import { getState } from '../state.js';
import { PALETTE } from '../constants.js';
import { showMenu } from '../interactions/menus.js';
import { startRenameLegend } from '../interactions/inline-edit.js';

export function buildLegend() {
  const STATE = getState();
  const usedColors = new Set(STATE.items.map((it) => it.color));
  if (usedColors.size === 0) return null;

  const legend = document.createElement('div');
  const orientation = STATE.timeline.legendOrientation || 'vertical';
  const align = STATE.timeline.legendAlign || 'right';
  legend.className =
    'timeline-legend legend-align-' + align + (orientation === 'horizontal' ? ' legend-horizontal' : '');

  PALETTE.forEach((color) => {
    if (!usedColors.has(color)) return;
    const itemEl = document.createElement('div');
    itemEl.className = 'legend-item';

    const colorDot = document.createElement('div');
    colorDot.className = 'legend-color';
    colorDot.style.background = color;

    const labelEl = document.createElement('div');
    labelEl.className = 'legend-label';
    labelEl.textContent = STATE.legendLabels[color] || 'Category';
    labelEl.addEventListener('click', (e) => {
      e.stopPropagation();
      showMenu([{ label: 'Rename', onClick: () => startRenameLegend(color, labelEl) }], labelEl);
    });

    itemEl.appendChild(colorDot);
    itemEl.appendChild(labelEl);
    legend.appendChild(itemEl);
  });

  return legend;
}
