import { getState, setState, getSelectedItemId, setSelectedItemId, getRender } from '../state.js';
import { PALETTE, AUTOFOCUS_DELAY_MS, DRAG_THRESHOLD, MIN_BAR_WIDTH } from '../constants.js';
import { fmt, parseDate, daysBetween, addDays, snapToMonday, formatDateForTooltip } from '../utils/date.js';
import { uid } from '../utils/dom.js';
import {
  getSlideScale,
  getLaneScale,
  getLaneHeights,
  getItemBarHeight,
  dateToX,
  xToDate,
  ITEM_BAR_H,
  TRACK_GAP,
  LANE_PADDING,
} from '../utils/layout.js';
import { findFreeTrack } from '../utils/tracks.js';
import { startRenameItem } from './inline-edit.js';

// ---- Drag state ----
let dragState = null;
// types: 'create', 'move', 'resize-left', 'resize-right', 'reorder-lane'
let dragTooltip = null; // DOM element for showing date during drag

export function getDragState() {
  return dragState;
}

export function setDragState(ds) {
  dragState = ds;
}

export function showDragTooltip(text, x, y) {
  if (!dragTooltip) {
    dragTooltip = document.createElement('div');
    dragTooltip.className = 'drag-tooltip';
    document.body.appendChild(dragTooltip);
  }
  dragTooltip.textContent = text;
  dragTooltip.style.left = x + 15 + 'px';
  dragTooltip.style.top = y - 30 + 'px';
  dragTooltip.style.display = 'block';
}

export function hideDragTooltip() {
  if (dragTooltip) {
    dragTooltip.remove();
    dragTooltip = null;
  }
}

// ---- Drag handlers (strategy pattern) ----
export function handleCreateDrag(e, ds, scale) {
  const gridRect = ds.gridEl.getBoundingClientRect();
  const x = (e.clientX - gridRect.left) / scale;
  ds.currentX = x;

  const left = Math.min(ds.startX, x);
  const right = Math.max(ds.startX, x);
  const snappedStart = snapToMonday(xToDate(left, ds.tlStart, ds.totalDays, ds.totalWidth));
  const snappedEnd = snapToMonday(xToDate(right, ds.tlStart, ds.totalDays, ds.totalWidth));

  const snappedLeft = dateToX(snappedStart, ds.tlStart, ds.totalDays, ds.totalWidth);
  const snappedRight = dateToX(snappedEnd, ds.tlStart, ds.totalDays, ds.totalWidth);

  if (ds.ghostEl) {
    ds.ghostEl.style.left = snappedLeft + 'px';
    ds.ghostEl.style.width = Math.abs(snappedRight - snappedLeft) + 'px';
  }
  showDragTooltip(
    `${formatDateForTooltip(snappedStart)} - ${formatDateForTooltip(snappedEnd)}`,
    e.clientX,
    e.clientY,
  );
}

export function handleMoveDrag(e, ds, scale) {
  ds.moved = true;
  const gridRect = ds.gridEl.getBoundingClientRect();
  const x = (e.clientX - gridRect.left) / scale;
  const y = (e.clientY - gridRect.top) / scale;
  const dx = x - ds.startMouseX;
  const dy = y - ds.startMouseY;

  ds.barEl.style.transform = `translate(${dx}px, calc(-2px + ${dy}px))`;

  const rawLeft = ds.origLeft + dx;
  const snappedStartDate = snapToMonday(xToDate(rawLeft, ds.tlStart, ds.totalDays, ds.totalWidth));
  ds.newStartDate = snappedStartDate;
  showDragTooltip(formatDateForTooltip(snappedStartDate), e.clientX, e.clientY);

  const ls = getLaneScale();
  const scaledBarH = Math.round(ITEM_BAR_H * ls);
  const scaledGap = Math.round(TRACK_GAP * ls);
  const scaledPad = Math.round(LANE_PADDING * ls);
  const baseLaneHeights = getLaneHeights();
  const EXTRA = scaledBarH + scaledGap;
  // Expand the previously-hovered lane so the cursor can reach a new track slot
  const prevLaneIdx = ds.currentLaneIdx ?? 0;
  const effectiveHeights = baseLaneHeights.map((h, i) => (i === prevLaneIdx ? h + EXTRA : h));

  let cumulativeY = 0;
  let newLaneIdx = baseLaneHeights.length - 1;
  let newTrack = 0;

  for (let i = 0; i < effectiveHeights.length; i++) {
    if (y < cumulativeY + effectiveHeights[i]) {
      newLaneIdx = i;
      const trackY = y - cumulativeY - scaledPad;
      newTrack = Math.max(0, Math.floor(trackY / (scaledBarH + scaledGap)));
      break;
    }
    cumulativeY += effectiveHeights[i];
  }

  ds.currentLaneIdx = newLaneIdx;
  ds.currentTrack = newTrack;

  const rows = ds.gridEl.querySelectorAll('.timeline-grid-row');
  rows.forEach((r, i) => {
    r.classList.remove('drag-over-active');
    r.style.height = baseLaneHeights[i] + 'px';
  });
  if (rows[newLaneIdx]) {
    rows[newLaneIdx].classList.add('drag-over-active');
    rows[newLaneIdx].style.height = baseLaneHeights[newLaneIdx] + EXTRA + 'px';
  }
}

export function handleResizeDrag(e, ds, scale) {
  ds.moved = true;
  const gridRect = ds.gridEl.getBoundingClientRect();
  const x = (e.clientX - gridRect.left) / scale;
  const rawDate = xToDate(x, ds.tlStart, ds.totalDays, ds.totalWidth);
  const snappedX = dateToX(snapToMonday(rawDate), ds.tlStart, ds.totalDays, ds.totalWidth);

  if (ds.type === 'resize-left') {
    const newLeft = Math.min(snappedX, ds.origRight - MIN_BAR_WIDTH);
    ds.barEl.style.left = newLeft + 'px';
    ds.barEl.style.width = ds.origRight - newLeft + 'px';
    ds.newStartDate = snapToMonday(xToDate(newLeft, ds.tlStart, ds.totalDays, ds.totalWidth));
    showDragTooltip(formatDateForTooltip(ds.newStartDate), e.clientX, e.clientY);
  } else {
    const newRight = Math.max(snappedX, ds.origLeft + MIN_BAR_WIDTH);
    ds.barEl.style.width = newRight - ds.origLeft + 'px';
    ds.newEndDate = snapToMonday(xToDate(newRight, ds.tlStart, ds.totalDays, ds.totalWidth));
    showDragTooltip(formatDateForTooltip(ds.newEndDate), e.clientX, e.clientY);
  }
}

const dragHandlers = {
  create: handleCreateDrag,
  move: handleMoveDrag,
  'resize-left': handleResizeDrag,
  'resize-right': handleResizeDrag,
};

export function startMove(e, item, tlStart, totalDays, totalWidth) {
  const STATE = getState();
  const bar = e.target.closest('.item-bar');
  if (!bar) return;

  const grid = document.getElementById('timeline-grid');
  const area = document.getElementById('timeline-area');
  const scale = getSlideScale();
  const gridRect = grid.getBoundingClientRect();

  dragState = {
    type: 'move',
    item,
    barEl: bar,
    gridEl: grid,
    areaEl: area,
    startMouseX: (e.clientX - gridRect.left) / scale,
    startMouseY: (e.clientY - gridRect.top) / scale,
    origLeft: parseFloat(bar.style.left),
    currentLaneIdx: STATE.swimlanes.findIndex((l) => l.id === item.swimlaneId),
    tlStart,
    totalDays,
    totalWidth,
    moved: false,
  };
  bar.classList.add('dragging');
}

export function startResize(e, item, type, tlStart, totalDays, totalWidth) {
  const bar = e.target.closest('.item-bar');
  const grid = document.getElementById('timeline-grid');
  const area = document.getElementById('timeline-area');

  dragState = {
    type,
    item,
    barEl: bar,
    gridEl: grid,
    areaEl: area,
    origLeft: parseFloat(bar.style.left),
    origRight: parseFloat(bar.style.left) + parseFloat(bar.style.width),
    tlStart,
    totalDays,
    totalWidth,
    moved: false,
    newStartDate: null,
    newEndDate: null,
  };
}

// ---- Document-level drag event listeners ----
document.addEventListener('pointermove', (e) => {
  if (!dragState) return;
  const handler = dragHandlers[dragState.type];
  if (handler) handler(e, dragState, getSlideScale());
});

document.addEventListener('pointerup', (_e) => {
  if (!dragState) return;
  const STATE = getState();
  const ds = dragState;
  dragState = null;
  hideDragTooltip();

  // Check if dragged then clear transform & clean up active highlight
  if (ds.barEl) {
    ds.barEl.classList.remove('dragging');
    ds.barEl.style.transform = ''; // Reset the free drag transform
  }
  document.querySelectorAll('.drag-over-active').forEach((r) => r.classList.remove('drag-over-active'));
  document.querySelectorAll('.timeline-grid-row').forEach((r) => (r.style.height = ''));

  if (ds.type === 'create') {
    if (ds.ghostEl) ds.ghostEl.remove();
    const width = Math.abs(ds.currentX - ds.startX);
    if (width < DRAG_THRESHOLD) return; // too small, ignore

    const left = Math.min(ds.startX, ds.currentX);
    const right = Math.max(ds.startX, ds.currentX);
    const rawStartDate = xToDate(left, ds.tlStart, ds.totalDays, ds.totalWidth);
    const rawEndDate = xToDate(right, ds.tlStart, ds.totalDays, ds.totalWidth);

    // Snap to weeks
    const startDate = snapToMonday(rawStartDate);
    const endDate = snapToMonday(rawEndDate);

    // Ensure at least 1 week
    if (daysBetween(startDate, endDate) < 7) {
      endDate.setDate(endDate.getDate() + 7);
    }

    const lane = STATE.swimlanes[ds.laneIdx];
    if (!lane) return;

    const track = findFreeTrack(lane.id, fmt(startDate), fmt(endDate));
    if (track === -1) return; // lane full

    const newItem = {
      id: uid(),
      swimlaneId: lane.id,
      name: '',
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      color: PALETTE[STATE.items.length % PALETTE.length],
      track,
    };

    setSelectedItemId(newItem.id);
    setState((s) => {
      s.items.push(newItem);
    });
    // Auto-trigger rename on the new drag-created item
    setTimeout(() => {
      const lbl = document.querySelector(`.item-bar-label[data-item-id="${newItem.id}"]`);
      if (lbl) startRenameItem(newItem.id, lbl);
    }, AUTOFOCUS_DELAY_MS);
  } else if (ds.type === 'move' && ds.moved) {
    // Use the snapped start date from dragState (calculated during mousemove)
    const newStartDate = ds.newStartDate;
    const origStart = parseDate(ds.item.startDate);
    const origEnd = parseDate(ds.item.endDate);
    const duration = daysBetween(origStart, origEnd);
    const newEndDate = addDays(newStartDate, duration);

    const newLane = STATE.swimlanes[ds.currentLaneIdx];

    setState((s) => {
      const it = s.items.find((i) => i.id === ds.item.id);
      if (it) {
        it.startDate = fmt(newStartDate);
        it.endDate = fmt(newEndDate);
        if (newLane) it.swimlaneId = newLane.id;
        if (ds.currentTrack !== undefined) it.track = ds.currentTrack;
      }
    });
  } else if ((ds.type === 'resize-left' || ds.type === 'resize-right') && ds.moved) {
    setState((s) => {
      const it = s.items.find((i) => i.id === ds.item.id);
      if (!it) return;
      if (ds.type === 'resize-left' && ds.newStartDate) {
        it.startDate = fmt(ds.newStartDate);
      } else if (ds.type === 'resize-right' && ds.newEndDate) {
        it.endDate = fmt(ds.newEndDate);
      }
      // Ensure start < end with 7-day minimum (matches drag-create minimum)
      const rs = parseDate(it.startDate),
        re = parseDate(it.endDate);
      if (rs >= re || daysBetween(rs, re) < 7) {
        if (ds.type === 'resize-left') {
          it.startDate = fmt(addDays(re, -7));
        } else {
          it.endDate = fmt(addDays(rs, 7));
        }
      }
    });
  }
});
