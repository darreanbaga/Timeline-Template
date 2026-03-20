import { BASE_FONT } from '../constants.js';

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Read layout constants from CSS custom properties (single source of truth)
export function cssVar(name) {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue(name), 10);
}

// Measure rendered width of a label string using canvas (matches label CSS font)
let _measureCanvas = null;
export function measureLabelText(text, fontPx) {
  if (!_measureCanvas) {
    _measureCanvas = document.createElement('canvas');
  }
  const ctx = _measureCanvas.getContext('2d');
  ctx.font = `500 ${fontPx || BASE_FONT}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  return ctx.measureText(text).width;
}

export function makeCheckmark() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  pl.setAttribute('points', '20 6 9 17 4 12');
  svg.appendChild(pl);
  return svg;
}
