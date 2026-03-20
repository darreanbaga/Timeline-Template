import './styles/index.css';

import {
  getState,
  setState,
  getSelectedItemId,
  setSelectedItemId,
  registerRenderFn,
  registerAssignTracksFn,
  registerShowInfoFn,
  loadState,
  resetToDefault,
  undo,
  redo,
} from './state.js';
import { ZOOM_CONFIG } from './constants.js';
import { parseDate, fmt } from './utils/date.js';
import { uid } from './utils/dom.js';
import { updateSlideScale } from './utils/layout.js';
import { assignTracks } from './utils/tracks.js';
import { render } from './render/render.js';
import {
  shiftStartDate,
  setZoomLevel,
  jumpToToday,
  autoFit,
  setDisplayMode,
  addItem,
  addSwimlane,
  deleteItem,
  updateZoomLabel,
  updateStartDateDisplay,
  updateDisplayModeUI,
  updateLegendToggleUI,
} from './controls.js';
import { exportCSV, importCSV, setupCSVFileInput } from './io/csv.js';
import { exportPNG } from './io/png.js';
import { showMenu, dismissMenu, getActiveMenu } from './interactions/menus.js';
import { showConfirm, showInfo } from './interactions/dialogs.js';
import {
  toggleRibbonDropdown,
  buildZoomDropdown,
  buildLegendDropdown,
  buildFileDropdown,
} from './interactions/dropdowns.js';
import { updateTimelineDates } from './state.js';

// ---- Register callbacks to break circular deps ----
registerRenderFn(render);
registerAssignTracksFn(assignTracks);
registerShowInfoFn(showInfo);

// ---- Init ----
loadState();
updateZoomLabel();
updateStartDateDisplay();
updateDisplayModeUI();
updateLegendToggleUI();
render();

// ---- Window listeners ----
window.addEventListener('resize', updateSlideScale);

// Nudge user before closing tab if they have real data
window.addEventListener('beforeunload', (e) => {
  const STATE = getState();
  if (!STATE.isExample && STATE.items.length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ---- Button event wiring ----
document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);
document.getElementById('btn-add').addEventListener('click', function (e) {
  e.stopPropagation();
  showMenu(
    [
      { label: 'Add Group', onClick: addSwimlane },
      { label: 'Add Initiative', onClick: addItem },
    ],
    this,
  );
});

// Zoom dropdown
const zoomDropdownEl = document.getElementById('zoom-dropdown');
document.getElementById('btn-zoom-dropdown').addEventListener('click', () => {
  toggleRibbonDropdown(zoomDropdownEl, (container) => buildZoomDropdown(container, setZoomLevel));
});

// Date picker for start date
const startDatePicker = document.getElementById('start-date-picker');
document.getElementById('start-date-label').addEventListener('click', () => {
  const STATE = getState();
  startDatePicker.value = STATE.timeline.startDate;
  if (startDatePicker.showPicker) {
    startDatePicker.showPicker();
  } else {
    startDatePicker.click();
  }
});
startDatePicker.addEventListener('change', () => {
  const val = startDatePicker.value;
  if (!val) return;
  setState((s) => {
    const d = parseDate(val);
    const cfg = ZOOM_CONFIG[s.timeline.zoomLevel || 'month'];
    s.timeline.startDate = fmt(cfg.snapStart(new Date(d)));
    updateTimelineDates();
  });
});

document.getElementById('btn-start-prev').addEventListener('click', () => shiftStartDate(-1));
document.getElementById('btn-start-next').addEventListener('click', () => shiftStartDate(1));
document.getElementById('btn-today').addEventListener('click', jumpToToday);
document.getElementById('btn-autofit').addEventListener('click', autoFit);

// Display mode toggle
document.getElementById('btn-display-timeline').addEventListener('click', () => setDisplayMode('timeline'));
document.getElementById('btn-display-calendar').addEventListener('click', () => setDisplayMode('calendar'));

// Legend dropdown
const legendDropdownEl = document.getElementById('legend-dropdown');
document.getElementById('btn-legend-dropdown').addEventListener('click', () => {
  toggleRibbonDropdown(legendDropdownEl, buildLegendDropdown);
});

// File dropdown
const fileDropdownEl = document.getElementById('file-dropdown');
document.getElementById('btn-file-dropdown').addEventListener('click', () => {
  toggleRibbonDropdown(fileDropdownEl, (container) => buildFileDropdown(container, importCSV, exportPNG, exportCSV));
});

// CSV file input handler
setupCSVFileInput();

// Reset button
document.getElementById('btn-reset').addEventListener('click', () => {
  showConfirm('Delete all groups and initiatives?', () => {
    setState((s) => {
      s.swimlanes = [{ id: uid(), name: 'New Group', order: 0, minRows: 1 }];
      s.items = [];
      s.legendLabels = {};
    });
    setSelectedItemId(null);
  });
});

// ---- Keyboard shortcuts ----
document.addEventListener('keydown', (e) => {
  // Only trigger global shortcuts if not typing in an input
  if (document.activeElement.tagName === 'INPUT') {
    return;
  }

  // Undo: Ctrl+Z or Cmd+Z
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
    return;
  }

  // Redo: Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
    e.preventDefault();
    redo();
    return;
  }

  // Delete item
  if (getSelectedItemId() && (e.key === 'Delete' || e.key === 'Backspace')) {
    deleteItem(getSelectedItemId());
  }
});

// ---- Deselect on click outside ----
document.addEventListener('click', (e) => {
  const activeMenu = getActiveMenu();
  if (activeMenu && !e.target.closest('.ctx-menu')) dismissMenu();
  if (!e.target.closest('.item-bar') && !e.target.closest('.item-bar-label') && !e.target.closest('.ctx-menu')) {
    if (getSelectedItemId()) {
      setSelectedItemId(null);
      render();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') dismissMenu();
});

// ---- Welcome toast ----
const STATE = getState();
if (STATE.isExample) {
  const toast = document.createElement('div');
  toast.className = 'welcome-toast';
  const p = document.createElement('span');
  p.textContent = 'This is a sample timeline.';
  toast.appendChild(p);
  const btn = document.createElement('button');
  btn.className = 'btn-primary';
  btn.textContent = 'Get Started';
  btn.addEventListener('click', () => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
    resetToDefault();
    updateZoomLabel();
    updateStartDateDisplay();
    updateDisplayModeUI();
    updateLegendToggleUI();
    render();
  });
  toast.appendChild(btn);
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn-dismiss';
  dismissBtn.innerHTML = '&times;';
  dismissBtn.title = 'Dismiss';
  dismissBtn.addEventListener('click', function () {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', function () {
      toast.remove();
    });
  });
  toast.appendChild(dismissBtn);
  document.body.appendChild(toast);
}

// ---- Save-tip toast ----
if (!STATE.isExample && !localStorage.getItem('timeline_tip_dismissed')) {
  const tip = document.createElement('div');
  tip.className = 'welcome-toast';
  const span = document.createElement('span');
  span.textContent =
    'Your work saves automatically in this browser, but clearing your cache will erase it. Export CSV regularly to keep an offline backup.';
  tip.appendChild(span);
  const gotIt = document.createElement('button');
  gotIt.className = 'btn-primary';
  gotIt.textContent = 'Got it';
  gotIt.addEventListener('click', () => {
    localStorage.setItem('timeline_tip_dismissed', '1');
    tip.classList.add('toast-exit');
    tip.addEventListener('animationend', () => tip.remove());
  });
  tip.appendChild(gotIt);
  document.body.appendChild(tip);
}
