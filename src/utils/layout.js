import { getState } from '../state.js';
import { cssVar } from './dom.js';
import { DEFAULT_SIDEBAR_W, SLIDE_W, SLIDE_H, LEGEND_RESERVE, MIN_LANE_SCALE, ZOOM_CONFIG } from '../constants.js';
import { getTrackCount } from './tracks.js';
import { daysBetween, addDays } from './date.js';

// Read layout constants from CSS custom properties (single source of truth)
export const SLIDE_PAD = cssVar('--slide-pad');
export const CONTENT_W = SLIDE_W - SLIDE_PAD * 2;
export const CONTENT_H = SLIDE_H - SLIDE_PAD * 2;
export const TITLE_ROW_H = cssVar('--title-row-height');
export const QUARTER_ROW_H = cssVar('--quarter-row-height');
export const MONTH_ROW_H = cssVar('--month-row-height');
export const WEEK_ROW_H = cssVar('--week-row-height');
export const ITEM_BAR_H = cssVar('--item-bar-height');
export const TRACK_GAP = cssVar('--track-gap');
export const LANE_PADDING = cssVar('--lane-padding');

export function getSidebarWidth() {
  const STATE = getState();
  return STATE.timeline.sidebarWidth || DEFAULT_SIDEBAR_W;
}

export function getTimelineWidth() {
  return CONTENT_W - getSidebarWidth();
}

export function getDisplayConfig() {
  const STATE = getState();
  return ZOOM_CONFIG[STATE.timeline.zoomLevel || 'month'];
}

export function getHeaderHeight() {
  const cfg = getDisplayConfig();
  let h = TITLE_ROW_H + MONTH_ROW_H;
  if (cfg.showQuarterRow) h += QUARTER_ROW_H;
  if (cfg.showSubMonthRow) h += WEEK_ROW_H;
  return h;
}

export function getGridHeight() {
  return CONTENT_H - getHeaderHeight() - LEGEND_RESERVE;
}

export function getLaneHeight(laneId) {
  const trackCount = getTrackCount(laneId);
  return trackCount * ITEM_BAR_H + (trackCount - 1) * TRACK_GAP + LANE_PADDING * 2;
}

export function getLaneScale() {
  const STATE = getState();
  const raw = STATE.swimlanes.map((lane) => getLaneHeight(lane.id));
  const total = raw.reduce((sum, h) => sum + h, 0);
  if (total <= getGridHeight()) return 1;
  return Math.max(getGridHeight() / total, MIN_LANE_SCALE);
}

export function getLaneHeights() {
  const STATE = getState();
  const raw = STATE.swimlanes.map((lane) => getLaneHeight(lane.id));
  const scale = getLaneScale();
  if (scale >= 1) return raw;
  return raw.map((h) => Math.floor(h * scale));
}

export function getTotalGridHeight() {
  const heights = getLaneHeights();
  return heights.reduce((sum, h) => sum + h, 0);
}

export function getRowHeight() {
  const STATE = getState();
  return getGridHeight() / Math.max(STATE.swimlanes.length, 1);
}

export function getColWidth(cols) {
  return getTimelineWidth() / Math.max(cols.length, 1);
}

export function getItemBarHeight() {
  return Math.round(ITEM_BAR_H * getLaneScale());
}

export function getSlideScale() {
  const slide = document.getElementById('slide');
  if (!slide) return 1;
  const rect = slide.getBoundingClientRect();
  return Math.max(rect.width / SLIDE_W, 0.01);
}

export function updateSlideScale() {
  const slide = document.getElementById('slide');
  const viewport = document.querySelector('.slide-viewport');
  if (!slide || !viewport) return;

  // Account for viewport padding (40px on each side = 80px total)
  const padding = 80;
  const availW = viewport.clientWidth - padding;
  const availH = viewport.clientHeight - padding;

  // Calculate scale to fit while maintaining aspect ratio
  const scaleX = availW / SLIDE_W;
  const scaleY = availH / SLIDE_H;
  const scale = Math.min(scaleX, scaleY, 1);

  slide.style.transform = `scale(${scale})`;
}

// Position helpers
export function dateToX(date, tlStart, totalDays, totalWidth) {
  const d = daysBetween(tlStart, date);
  return (d / totalDays) * totalWidth;
}

export function xToDate(x, tlStart, totalDays, totalWidth) {
  if (totalWidth === 0) return new Date(tlStart);
  const frac = x / totalWidth;
  const days = Math.round(frac * totalDays);
  return addDays(tlStart, days);
}
