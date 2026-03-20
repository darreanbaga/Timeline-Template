import { getState, setState } from '../state.js';

// ---- Inline edit utility ----
export function startInlineEdit(el, currentValue, onSave, options = {}) {
  const { placeholder, autoSize } = options;
  const input = document.createElement('input');
  input.value = currentValue;
  if (placeholder) input.placeholder = placeholder;
  el.textContent = '';

  let sizer = null;
  if (autoSize) {
    sizer = document.createElement('span');
    sizer.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font:inherit;pointer-events:none;';
    el.appendChild(sizer);
    const resizeInput = () => {
      sizer.textContent = input.value || input.placeholder || '';
      input.style.width = sizer.offsetWidth + 'px';
    };
    el.appendChild(input);
    resizeInput();
    input.addEventListener('input', resizeInput);
  } else {
    el.appendChild(input);
  }

  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onSave(input.value.trim());
  };

  input.addEventListener('blur', finish);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = currentValue;
      input.blur();
    }
  });
  input.addEventListener('pointerdown', (e) => e.stopPropagation());
}

// ---- Legend Rename ops ----
export function startRenameLegend(color, textEl) {
  const STATE = getState();
  const currentName = STATE.legendLabels[color] || 'Category';
  startInlineEdit(
    textEl,
    currentName === 'Category' ? '' : currentName,
    (val) => {
      setState((s) => {
        if (val) {
          s.legendLabels[color] = val;
        } else {
          delete s.legendLabels[color];
        }
      });
    },
    { placeholder: 'Category', autoSize: true },
  );
}

// ---- Title ops ----
export function startRenameTitle() {
  const titleEl = document.querySelector('.timeline-title');
  if (!titleEl) return;
  const STATE = getState();
  startInlineEdit(titleEl, STATE.timeline.title || 'New Timeline', (val) => {
    setState((s) => {
      s.timeline.title = val || 'New Timeline';
    });
  });
}

// ---- Item rename ----
export function startRenameItem(itemId, textEl) {
  const STATE = getState();
  const item = STATE.items.find((it) => it.id === itemId);
  if (!item) return;
  textEl.style.background = 'transparent';
  startInlineEdit(textEl, item.name || '', (val) => {
    setState((s) => {
      const it = s.items.find((i) => i.id === itemId);
      if (it) it.name = val;
    });
  });
}

// ---- Swimlane rename ----
export function startRenameLaneEl(nameEl, laneId) {
  const STATE = getState();
  const lane = STATE.swimlanes.find((l) => l.id === laneId);
  if (!lane) return;
  startInlineEdit(nameEl, lane.name, (val) => {
    setState((s) => {
      const l = s.swimlanes.find((l) => l.id === laneId);
      if (l) l.name = val || 'Untitled';
    });
  });
}

export function startRenameLane(laneId) {
  const row = document.querySelector(`.sidebar-row[data-lane-id="${laneId}"]`);
  if (!row) return;
  const nameEl = row.querySelector('.lane-name');
  startRenameLaneEl(nameEl, laneId);
}
