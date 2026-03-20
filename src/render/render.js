import { getState } from '../state.js';
import { parseDate, daysBetween, getColumns } from '../utils/date.js';
import { ITEM_BAR_H } from '../utils/layout.js';
import {
  getDisplayConfig,
  getRowHeight,
  getSidebarWidth,
  getHeaderHeight,
  getTimelineWidth,
  getLaneHeights,
  getLaneScale,
  updateSlideScale,
} from '../utils/layout.js';
import { getTotalRows } from '../utils/tracks.js';
import { MAX_TOTAL_ROWS } from '../constants.js';
import { getDragState } from '../interactions/drag.js';
import { dismissCalendarPopover } from '../interactions/menus.js';
import { buildSidebar } from './sidebar.js';
import { buildTimelineArea } from './grid.js';
import { buildCalendarView } from './calendar.js';
import { updateZoomLabel, updateStartDateDisplay, updateDisplayModeUI } from '../controls.js';

export function render() {
  const dragState = getDragState();
  if (dragState) return;
  dismissCalendarPopover();
  const STATE = getState();
  const app = document.getElementById('app');
  const slide = document.getElementById('slide');
  const dm = STATE.timeline.displayMode || 'timeline';

  if (dm === 'calendar') {
    app.className = 'main';
    app.innerHTML = '';
    app.style.display = '';
    app.appendChild(buildCalendarView());
    updateDisplayModeUI();
    updateSlideScale();
    return;
  }

  const rowHeight = getRowHeight();
  if (slide) {
    slide.style.setProperty('--row-height', rowHeight + 'px');
    slide.style.setProperty('--item-bar-height', ITEM_BAR_H + 'px');
    slide.style.setProperty('--sidebar-width', getSidebarWidth() + 'px');
    slide.style.setProperty('--header-height', getHeaderHeight() + 'px');
  }

  app.className = 'main';
  app.style.display = '';
  app.innerHTML = '';

  const tlStart = parseDate(STATE.timeline.startDate);
  const tlEnd = parseDate(STATE.timeline.endDate);
  const totalDays = Math.max(daysBetween(tlStart, tlEnd), 1);
  const cfg = getDisplayConfig();
  const cols = getColumns(tlStart, tlEnd, cfg.topGranularity);
  const totalWidth = getTimelineWidth();
  const laneHeights = getLaneHeights();
  const scale = getLaneScale();
  const ctx = { tlStart, tlEnd, totalDays, cols, totalWidth, scale };

  app.appendChild(buildSidebar(laneHeights));
  app.appendChild(buildTimelineArea(ctx, laneHeights));

  updateZoomLabel();
  updateStartDateDisplay();
  updateDisplayModeUI();
  updateSlideScale();

  const addBtn = document.getElementById('btn-add');
  if (addBtn) addBtn.disabled = getTotalRows() >= MAX_TOTAL_ROWS;
}
