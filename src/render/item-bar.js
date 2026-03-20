import { PALETTE, DRAG_THRESHOLD, LABEL_PAD_H, BASE_FONT, MIN_BAR_WIDTH } from '../constants.js';
import { parseDate } from '../utils/date.js';
import { measureLabelText } from '../utils/dom.js';
import { dateToX, ITEM_BAR_H, TRACK_GAP, LANE_PADDING } from '../utils/layout.js';
import { getSelectedItemId, setSelectedItemId, setState, getRender } from '../state.js';
import { getDragState, startMove, startResize } from '../interactions/drag.js';
import { showMenu } from '../interactions/menus.js';
import { startRenameItem } from '../interactions/inline-edit.js';
import { deleteItem } from '../controls.js';

export function buildItemBar(item, ctx) {
  const { tlStart, totalDays, totalWidth, scale } = ctx;
  const s = scale || 1;
  const barH = Math.round(ITEM_BAR_H * s);
  const gap = Math.round(TRACK_GAP * s);
  const padY = Math.round(LANE_PADDING * s);
  const itemStart = parseDate(item.startDate);
  const itemEnd = parseDate(item.endDate);
  const x1 = dateToX(itemStart, tlStart, totalDays, totalWidth);
  const x2 = dateToX(itemEnd, tlStart, totalDays, totalWidth);
  const w = Math.max(x2 - x1, MIN_BAR_WIDTH);
  const trackY = padY + item.track * (barH + gap);

  // Wrapper to hold bar + floating label
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';

  const selectedItemId = getSelectedItemId();
  const bar = document.createElement('div');
  bar.className = 'item-bar' + (selectedItemId === item.id ? ' selected' : '');
  const fontSize = Math.round(BASE_FONT * s);
  bar.style.left = x1 + 'px';
  bar.style.width = w + 'px';
  bar.style.top = trackY + 'px';
  bar.style.height = barH + 'px';
  bar.style.fontSize = fontSize + 'px';
  bar.style.background = item.color;
  bar.style.setProperty('--bar-color', item.color);
  bar.dataset.itemId = item.id;
  bar.dataset.track = item.track;

  // Hidden text for bar sizing (no visible text in bar itself)
  const textSpan = document.createElement('span');
  textSpan.className = 'item-bar-text';
  textSpan.style.visibility = 'hidden';
  textSpan.textContent = item.name || 'Untitled';
  bar.appendChild(textSpan);

  const handleL = document.createElement('div');
  handleL.className = 'resize-handle left';
  const handleR = document.createElement('div');
  handleR.className = 'resize-handle right';
  bar.appendChild(handleL);
  bar.appendChild(handleR);

  handleL.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    startResize(e, item, 'resize-left', { tlStart, totalDays, totalWidth });
  });
  handleR.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    startResize(e, item, 'resize-right', { tlStart, totalDays, totalWidth });
  });

  bar.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    if (e.target.tagName === 'INPUT') return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    function onMove(me) {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
        moved = true;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        startMove(e, item, tlStart, totalDays, totalWidth);
      }
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
  bar.addEventListener('click', (e) => {
    const dragSt = getDragState();
    if (dragSt && dragSt.moved) return;
    if (e.target.tagName === 'INPUT') return;
    e.stopPropagation();
    setSelectedItemId(item.id);
    const render = getRender();
    if (render) render();
    requestAnimationFrame(() => {
      const newBar = document.querySelector(`.item-bar[data-item-id="${item.id}"]`);
      if (!newBar) return;
      showMenu(
        [
          {
            colors: PALETTE,
            selectedColor: item.color,
            onColorClick: (color) => {
              setState((s) => {
                const it = s.items.find((i) => i.id === item.id);
                if (it) it.color = color;
              });
            },
          },
          { label: 'Delete', danger: true, onClick: () => deleteItem(item.id) },
        ],
        newBar,
      );
    });
  });

  wrapper.appendChild(bar);

  // Auto-positioned label — inside bar if text fits, outside (no bg) if not
  const labelText = item.name || 'Untitled';
  const labelPadH = LABEL_PAD_H;
  const textPx = measureLabelText(labelText, fontSize);
  const labelW = textPx + labelPadH;
  const labelInset = 16;
  const fitsInBar = labelW <= w - labelInset * 2;

  const label = document.createElement('div');
  label.className = 'item-bar-label';
  label.dataset.itemId = item.id;
  label.textContent = labelText;
  label.style.fontSize = fontSize + 'px';
  const labelH = Math.round(22 * s);
  label.style.top = trackY + (barH - labelH) / 2 + 'px';

  if (fitsInBar) {
    label.style.left = x1 + labelInset + 'px';
  } else {
    label.classList.add('label-overflow');
    // Prefer right of bar; fall back to left if it would overflow the timeline
    const labelGap = labelInset; // match internal inset (padding + resize handle)
    const rightPos = x2 + labelGap;
    if (rightPos + labelW <= totalWidth) {
      label.style.left = rightPos + 'px';
    } else {
      label.style.left = Math.max(0, x1 - labelGap - labelW) + 'px';
    }
  }

  label.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;
    e.stopPropagation();
    setSelectedItemId(item.id);
    const render = getRender();
    if (render) render();
    const lbl = document.querySelector(`.item-bar-label[data-item-id="${item.id}"]`);
    if (lbl) startRenameItem(item.id, lbl);
  });

  label.addEventListener('mouseenter', () => {
    bar.classList.add('label-hovered');
  });
  label.addEventListener('mouseleave', () => {
    bar.classList.remove('label-hovered');
  });

  wrapper.appendChild(label);
  return wrapper;
}
