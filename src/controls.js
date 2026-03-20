import { getState, setState, setSelectedItemId, getSelectedItemId } from './state.js';
import { PALETTE, ZOOM_CONFIG, AUTOFOCUS_DELAY_MS, MAX_SWIMLANES, MAX_TOTAL_ROWS } from './constants.js';
import { fmt, parseDate, addDays, daysBetween, snapToMonday } from './utils/date.js';
import { uid } from './utils/dom.js';
import { getTotalRows, findFreeTrack } from './utils/tracks.js';
import { updateTimelineDates } from './state.js';
import { showInfo } from './interactions/dialogs.js';
import { startRenameLaneEl } from './interactions/inline-edit.js';

// Zoom label update
export function updateZoomLabel() {
  const STATE = getState();
  const label = document.getElementById('zoom-label');
  if (!label) return;
  const names = { day: 'Days', week: 'Weeks', month: 'Months', quarter: 'Quarters' };
  label.textContent = names[STATE.timeline.zoomLevel || 'month'];
}

// Timeline start date stepper
export function updateStartDateDisplay() {
  const STATE = getState();
  const label = document.getElementById('start-date-label');
  if (!label) return;
  const cfg = ZOOM_CONFIG[STATE.timeline.zoomLevel || 'month'];
  label.textContent = cfg.dateLabel(parseDate(STATE.timeline.startDate));
}

export function shiftStartDate(delta) {
  const STATE = getState();
  const cfg = ZOOM_CONFIG[STATE.timeline.zoomLevel || 'month'];
  setState((s) => {
    const d = parseDate(s.timeline.startDate);
    if (cfg.shiftUnit === 'day') {
      d.setDate(d.getDate() + delta);
    } else if (cfg.shiftUnit === 'week') {
      d.setDate(d.getDate() + delta * 7);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
    } else if (cfg.shiftUnit === 'month') {
      d.setMonth(d.getMonth() + delta);
      d.setDate(1);
    } else if (cfg.shiftUnit === 'quarter') {
      d.setMonth(d.getMonth() + delta * 3);
      d.setDate(1);
    }
    s.timeline.startDate = fmt(d);
    updateTimelineDates();
  });
}

export function setZoomLevel(level) {
  const STATE = getState();
  if (STATE.timeline.zoomLevel === level) return;
  setState((s) => {
    s.timeline.zoomLevel = level;
    const cfg = ZOOM_CONFIG[level];
    const d = parseDate(s.timeline.startDate);
    s.timeline.startDate = fmt(cfg.snapStart(new Date(d)));
    updateTimelineDates();
  });
}

export function jumpToToday() {
  setState((s) => {
    const cfg = ZOOM_CONFIG[s.timeline.zoomLevel || 'month'];
    const today = new Date();
    const offsetDays = Math.round(cfg.defaultDays * 0.1);
    const start = addDays(today, -offsetDays);
    s.timeline.startDate = fmt(cfg.snapStart(new Date(start)));
    updateTimelineDates();
  });
}

export function autoFit() {
  const STATE = getState();
  if (!STATE.items.length) {
    showInfo('Add items first.');
    return;
  }
  let minDate = Infinity,
    maxDate = -Infinity;
  STATE.items.forEach((item) => {
    const s = parseDate(item.startDate).getTime();
    const e = parseDate(item.endDate).getTime();
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  });
  const rangeMs = maxDate - minDate;
  const bufferMs = Math.max(rangeMs * 0.05, 7 * 86400000);
  const bufferedStart = new Date(minDate - bufferMs);
  const bufferedEnd = new Date(maxDate + bufferMs);
  const totalDays = daysBetween(bufferedStart, bufferedEnd);

  let bestZoom;
  if (totalDays <= 21) bestZoom = 'day';
  else if (totalDays <= 90) bestZoom = 'week';
  else if (totalDays <= 548) bestZoom = 'month';
  else bestZoom = 'quarter';

  setState((s) => {
    s.timeline.zoomLevel = bestZoom;
    const cfg = ZOOM_CONFIG[bestZoom];
    s.timeline.startDate = fmt(cfg.snapStart(new Date(bufferedStart)));
    s.timeline.endDate = fmt(bufferedEnd);
  });
}

// Display mode toggle (Timeline / Calendar)
export function updateDisplayModeUI() {
  const STATE = getState();
  const dm = STATE.timeline.displayMode || 'timeline';
  const btnTimeline = document.getElementById('btn-display-timeline');
  const btnCalendar = document.getElementById('btn-display-calendar');
  btnTimeline.classList.toggle('btn-active', dm === 'timeline');
  btnCalendar.classList.toggle('btn-active', dm === 'calendar');

  // Hide timeline-specific controls in calendar mode
  const timelineControls = document.getElementById('section-timeline-controls');
  if (timelineControls) {
    timelineControls.style.display = dm === 'calendar' ? 'none' : '';
  }
  // Also hide the divider before it
  const prev = timelineControls && timelineControls.previousElementSibling;
  if (prev && prev.classList.contains('control-section-divider')) {
    prev.style.display = dm === 'calendar' ? 'none' : '';
  }
}

export function setDisplayMode(mode) {
  const STATE = getState();
  if (STATE.timeline.displayMode === mode) return;
  setState((s) => {
    s.timeline.displayMode = mode;
  });
}

export function addItem(overrideStartDate) {
  const STATE = getState();
  if (STATE.swimlanes.length === 0) {
    showInfo('Please add a group first.');
    return;
  }

  // Clamp start date to visible timeline range
  const tlStart = parseDate(STATE.timeline.startDate);
  const tlEnd = parseDate(STATE.timeline.endDate);
  let startDate;
  if (overrideStartDate) {
    startDate = overrideStartDate;
  } else {
    startDate = snapToMonday(new Date());
    if (startDate < tlStart || startDate >= tlEnd) startDate = snapToMonday(tlStart);
  }
  let endDate = addDays(startDate, overrideStartDate ? 7 : 28);
  if (endDate > tlEnd) endDate = tlEnd;
  if (daysBetween(startDate, endDate) < 1) endDate = addDays(startDate, 7);

  // Find the first lane with a free track (not always the first lane)
  let targetLaneId = null;
  let targetTrack = -1;
  for (const lane of STATE.swimlanes) {
    const t = findFreeTrack(lane.id, fmt(startDate), fmt(endDate));
    if (t !== -1) {
      targetLaneId = lane.id;
      targetTrack = t;
      break;
    }
  }
  if (targetTrack === -1) {
    showInfo('No space available. Remove items or add rows first.');
    return;
  }

  let newItemId;
  setState((s) => {
    const newItem = {
      id: uid(),
      swimlaneId: targetLaneId,
      name: 'New Initiative',
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      color: PALETTE[s.items.length % PALETTE.length],
      track: targetTrack,
    };
    s.items.push(newItem);
    setSelectedItemId(newItem.id);
    newItemId = newItem.id;
  });

  // In calendar mode, scroll to the item's month and highlight it
  if ((STATE.timeline.displayMode || 'timeline') === 'calendar') {
    requestAnimationFrame(function () {
      const container = document.querySelector('.calendar-slides-container');
      if (!container) return;
      const slides = container.querySelectorAll('.calendar-slide');
      const targetMonth = startDate.getMonth();
      const targetYear = startDate.getFullYear();
      const calStart = parseDate(STATE.timeline.startDate);
      const cur = new Date(calStart.getFullYear(), calStart.getMonth(), 1);
      for (let i = 0; i < slides.length; i++) {
        if (cur.getFullYear() === targetYear && cur.getMonth() === targetMonth) {
          container.scrollLeft = i * container.clientWidth;
          break;
        }
        cur.setMonth(cur.getMonth() + 1);
      }
      // Highlight the new bar
      const bars = container.querySelectorAll('.calendar-item-bar');
      bars.forEach(function (b) {
        if (b.dataset.itemId === newItemId) {
          b.classList.add('bar-new');
        }
      });
    });
  }
}

// ---- Item delete ----
export function deleteItem(itemId) {
  if (getSelectedItemId() === itemId) setSelectedItemId(null);
  setState((s) => {
    s.items = s.items.filter((it) => it.id !== itemId);
  });
}

// ---- Swimlane ops ----
let _addLaneTimer = null;
export function addSwimlane() {
  const STATE = getState();
  if (STATE.swimlanes.length >= MAX_SWIMLANES || getTotalRows() >= MAX_TOTAL_ROWS) return;
  const newId = uid();
  setState((s) => {
    s.swimlanes.push({ id: newId, name: 'New Group', order: s.swimlanes.length, minRows: 1 });
  });
  // Auto-focus rename on the new lane (cancel any pending autofocus)
  if (_addLaneTimer) clearTimeout(_addLaneTimer);
  _addLaneTimer = setTimeout(() => {
    _addLaneTimer = null;
    const row = document.querySelector(`.sidebar-row[data-lane-id="${newId}"]`);
    if (row) {
      const nameEl = row.querySelector('.lane-name');
      if (nameEl) startRenameLaneEl(nameEl, newId);
    }
  }, AUTOFOCUS_DELAY_MS);
}

export function updateLegendToggleUI() {
  // No-op: legend state is now reflected inside the dropdown when opened
}
