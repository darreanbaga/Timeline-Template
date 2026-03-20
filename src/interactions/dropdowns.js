import { setState, getState } from '../state.js';
import { makeCheckmark } from '../utils/dom.js';

// ── Ribbon dropdown system ───────────────────────────────
let activeRibbonDropdown = null;

export function dismissRibbonDropdown() {
  if (!activeRibbonDropdown) return;
  const dd = activeRibbonDropdown;
  activeRibbonDropdown = null;
  dd.classList.add('ribbon-dropdown-exit');
  dd.addEventListener(
    'animationend',
    () => {
      dd.style.display = 'none';
      dd.classList.remove('ribbon-dropdown-exit');
    },
    { once: true },
  );
}

export function toggleRibbonDropdown(dropdownEl, buildFn) {
  if (activeRibbonDropdown === dropdownEl) {
    dismissRibbonDropdown();
    return;
  }
  dismissRibbonDropdown();
  buildFn(dropdownEl);
  dropdownEl.style.display = '';
  activeRibbonDropdown = dropdownEl;
}

export function getActiveRibbonDropdown() {
  return activeRibbonDropdown;
}

export function buildZoomDropdown(container, setZoomLevel) {
  const STATE = getState();
  container.innerHTML = '';  
  const currentZoom = STATE.timeline.zoomLevel || 'month';
  [
    { label: 'Days', value: 'day' },
    { label: 'Weeks', value: 'week' },
    { label: 'Months', value: 'month' },
    { label: 'Quarters', value: 'quarter' },
  ].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'ribbon-dropdown-item';
    const check = document.createElement('span');
    check.className = 'check';
    if (currentZoom === opt.value) check.appendChild(makeCheckmark());
    btn.appendChild(check);
    btn.appendChild(document.createTextNode(opt.label));
    btn.addEventListener('click', () => {
      setZoomLevel(opt.value);
      dismissRibbonDropdown();
    });
    container.appendChild(btn);
  });
}

export function buildLegendDropdown(container) {
  const STATE = getState();
  container.innerHTML = '';  
  const isHorizontal = STATE.timeline.legendOrientation === 'horizontal';
  const currentAlign = STATE.timeline.legendAlign || 'right';

  [
    { label: 'Vertical', value: 'vertical', active: !isHorizontal },
    { label: 'Horizontal', value: 'horizontal', active: isHorizontal },
  ].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'ribbon-dropdown-item';
    const check = document.createElement('span');
    check.className = 'check';
    if (opt.active) check.appendChild(makeCheckmark());
    btn.appendChild(check);
    btn.appendChild(document.createTextNode(opt.label));
    btn.addEventListener('click', () => {
      setState((s) => {
        s.timeline.legendOrientation = opt.value;
      });
      buildLegendDropdown(container);
    });
    container.appendChild(btn);
  });

  const sep = document.createElement('div');
  sep.className = 'ribbon-dropdown-separator';
  container.appendChild(sep);

  [
    { label: 'Align left', value: 'left' },
    { label: 'Align center', value: 'center' },
    { label: 'Align right', value: 'right' },
  ].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'ribbon-dropdown-item';
    const check = document.createElement('span');
    check.className = 'check';
    if (currentAlign === opt.value) check.appendChild(makeCheckmark());
    btn.appendChild(check);
    btn.appendChild(document.createTextNode(opt.label));
    btn.addEventListener('click', () => {
      setState((s) => {
        s.timeline.legendAlign = opt.value;
      });
      buildLegendDropdown(container);
    });
    container.appendChild(btn);
  });
}

export function buildFileDropdown(container, importCSV, exportPNG, exportCSV) {
  container.innerHTML = '';  
  const items = [
    {
      label: 'Import CSV...',
      action: () => {
        dismissRibbonDropdown();
        importCSV();
      },
    },
    { separator: true },
    {
      label: 'Export as PNG',
      action: () => {
        dismissRibbonDropdown();
        exportPNG();
      },
    },
    {
      label: 'Export as CSV',
      action: () => {
        dismissRibbonDropdown();
        exportCSV();
      },
    },
  ];
  items.forEach((item) => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'ribbon-dropdown-separator';
      container.appendChild(sep);
      return;
    }
    const btn = document.createElement('button');
    btn.className = 'ribbon-dropdown-item';
    btn.textContent = item.label;
    btn.addEventListener('click', item.action);
    container.appendChild(btn);
  });
}

export function updateLegendToggleUI() {
  // No-op: legend state is now reflected inside the dropdown when opened
}

// ---- Document-level dropdown dismiss listeners ----
document.addEventListener('mousedown', (e) => {
  if (activeRibbonDropdown && !e.target.closest('.ribbon-dropdown-wrapper')) {
    dismissRibbonDropdown();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeRibbonDropdown) {
    dismissRibbonDropdown();
  }
});
