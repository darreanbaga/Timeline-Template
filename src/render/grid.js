import { getState } from '../state.js';
import { daysBetween, getQuarters } from '../utils/date.js';
import { getSlideScale, getItemBarHeight, xToDate } from '../utils/layout.js';
import { setDragState } from '../interactions/drag.js';
import { buildItemBar } from './item-bar.js';
import { buildHeader } from './header.js';
import { buildLegend } from './legend.js';

export function buildGrid(ctx, laneHeights) {
  const STATE = getState();
  const { tlStart, tlEnd, totalDays } = ctx;
  const grid = document.createElement('div');
  grid.className = 'timeline-grid';
  grid.id = 'timeline-grid';
  grid.style.width = '100%';

  // Gridlines anchored to quarter boundaries
  const quarters = getQuarters(tlStart, tlEnd);
  quarters.forEach((q, i) => {
    if (i === 0) return;
    const pct = (daysBetween(tlStart, q.start) / totalDays) * 100;
    const line = document.createElement('div');
    line.className = 'gridline';
    line.style.left = pct + '%';
    grid.appendChild(line);
  });

  // Today line
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (todayDate >= tlStart && todayDate <= tlEnd) {
    const pct = (daysBetween(tlStart, todayDate) / totalDays) * 100;
    const todayLine = document.createElement('div');
    todayLine.className = 'today-line';
    todayLine.style.left = pct + '%';
    grid.appendChild(todayLine);
  }

  // Rows with items
  STATE.swimlanes.forEach((lane, laneIdx) => {
    const row = document.createElement('div');
    row.className = 'timeline-grid-row';
    row.dataset.laneId = lane.id;
    row.dataset.laneIdx = laneIdx;
    row.style.height = laneHeights[laneIdx] + 'px';

    STATE.items
      .filter((it) => it.swimlaneId === lane.id)
      .forEach((item) => {
        row.appendChild(buildItemBar(item, ctx));
      });

    grid.appendChild(row);
  });

  return grid;
}

export function buildTimelineArea(ctx, laneHeights) {
  const STATE = getState();
  const { tlStart, totalDays, totalWidth } = ctx;
  const tlArea = document.createElement('div');
  tlArea.className = 'timeline-area';
  tlArea.id = 'timeline-area';

  tlArea.appendChild(buildHeader(ctx));

  const grid = buildGrid(ctx, laneHeights);

  // Click-drag to create on grid
  grid.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.item-bar') || e.target.closest('.item-bar-label')) return;
    if (e.button !== 0) return;
    const targetRow = e.target.closest('.timeline-grid-row');
    if (!targetRow) return;
    const laneIdx = parseInt(targetRow.dataset.laneIdx, 10);
    if (isNaN(laneIdx) || laneIdx < 0 || laneIdx >= STATE.swimlanes.length) return;
    const scale = getSlideScale();
    const gridRect = grid.getBoundingClientRect();
    const x = (e.clientX - gridRect.left) / scale;

    const startDate = xToDate(x, tlStart, totalDays, totalWidth);

    const ds = {
      type: 'create',
      laneIdx,
      startX: x,
      currentX: x,
      startDate,
      tlStart,
      totalDays,
      totalWidth,
      gridEl: grid,
      areaEl: tlArea,
      ghostEl: null,
      row: grid.querySelectorAll('.timeline-grid-row')[laneIdx],
    };

    const ghost = document.createElement('div');
    ghost.className = 'ghost-bar';
    ghost.style.height = getItemBarHeight() + 'px';
    ghost.style.left = x + 'px';
    ghost.style.width = '0px';
    ds.row.appendChild(ghost);
    ds.ghostEl = ghost;

    setDragState(ds);
  });

  tlArea.appendChild(grid);

  const legend = buildLegend();
  if (legend) tlArea.appendChild(legend);

  return tlArea;
}
