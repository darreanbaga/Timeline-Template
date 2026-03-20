import {
  STORAGE_KEY,
  SAVE_DEBOUNCE_MS,
  MAX_HISTORY,
  DEFAULT_SIDEBAR_W,
  ZOOM_CONFIG,
  COLOR_MIGRATION,
  PALETTE,
} from './constants.js';
import { fmt, parseDate, addDays, fiscalQuarterRange } from './utils/date.js';
import { uid } from './utils/dom.js';

// ---- Render callback (avoids circular import with render.js) ----
let _renderFn = null;
export function registerRenderFn(fn) {
  _renderFn = fn;
}
export function getRender() {
  return _renderFn;
}

// ---- AssignTracks callback (avoids circular import with tracks.js) ----
let _assignTracksFn = null;
export function registerAssignTracksFn(fn) {
  _assignTracksFn = fn;
}

// ---- ShowInfo callback (avoids circular import with dialogs.js) ----
let _showInfoFn = null;
export function registerShowInfoFn(fn) {
  _showInfoFn = fn;
}

// ---- State ----
let STATE = defaultState();
let stateHistory = [JSON.parse(JSON.stringify(STATE))];
let historyIndex = 0;
let selectedItemId = null;
let saveTimer = null;

export function getState() {
  return STATE;
}

export function getSelectedItemId() {
  return selectedItemId;
}

export function setSelectedItemId(id) {
  selectedItemId = id;
}

export function defaultState() {
  const today = new Date();
  const { start, end } = fiscalQuarterRange(today);
  return {
    timeline: {
      startDate: fmt(start),
      endDate: fmt(end),
      zoomLevel: 'month',
      title: 'New Timeline',
      displayMode: 'timeline',
      sidebarWidth: DEFAULT_SIDEBAR_W,
      legendOrientation: 'vertical',
      legendAlign: 'right',
    },
    swimlanes: [],
    items: [],
    legendLabels: {},
  };
}

export function exampleState() {
  const laneStrategy = uid(),
    laneCreative = uid(),
    laneExecution = uid(),
    laneAnalytics = uid();
  return {
    isExample: true,
    timeline: {
      startDate: '2025-11-01',
      endDate: '2026-11-01',
      zoomLevel: 'month',
      title: 'Q1 Product Launch Campaign',
      displayMode: 'timeline',
      sidebarWidth: DEFAULT_SIDEBAR_W,
      legendOrientation: 'horizontal',
      legendAlign: 'right',
    },
    swimlanes: [
      { id: laneStrategy, name: 'Strategy', order: 0, minRows: 3 },
      { id: laneCreative, name: 'Creative', order: 1, minRows: 3 },
      { id: laneExecution, name: 'Execution', order: 2, minRows: 3 },
      { id: laneAnalytics, name: 'Analytics', order: 3, minRows: 3 },
    ],
    items: [
      // Strategy
      {
        id: uid(),
        swimlaneId: laneStrategy,
        name: 'Research',
        startDate: '2025-10-06',
        endDate: '2025-11-21',
        color: PALETTE[0],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneStrategy,
        name: 'Segmentation',
        startDate: '2025-11-03',
        endDate: '2025-12-12',
        color: PALETTE[0],
        track: 1,
      },
      {
        id: uid(),
        swimlaneId: laneStrategy,
        name: 'Brief',
        startDate: '2025-12-01',
        endDate: '2026-01-16',
        color: PALETTE[0],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneStrategy,
        name: 'Channels',
        startDate: '2025-12-15',
        endDate: '2026-02-06',
        color: PALETTE[0],
        track: 2,
      },
      {
        id: uid(),
        swimlaneId: laneStrategy,
        name: 'Budget',
        startDate: '2026-01-12',
        endDate: '2026-02-20',
        color: PALETTE[0],
        track: 1,
      },

      // Creative
      {
        id: uid(),
        swimlaneId: laneCreative,
        name: 'Brand Update',
        startDate: '2025-11-17',
        endDate: '2026-01-09',
        color: PALETTE[1],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneCreative,
        name: 'Ad Copy',
        startDate: '2026-01-05',
        endDate: '2026-02-27',
        color: PALETTE[1],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneCreative,
        name: 'Video',
        startDate: '2026-01-19',
        endDate: '2026-04-10',
        color: PALETTE[2],
        track: 1,
      },
      {
        id: uid(),
        swimlaneId: laneCreative,
        name: 'Landing Pages',
        startDate: '2026-02-16',
        endDate: '2026-04-03',
        color: PALETTE[1],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneCreative,
        name: 'Social Assets',
        startDate: '2026-03-09',
        endDate: '2026-05-01',
        color: PALETTE[2],
        track: 2,
      },

      // Execution
      {
        id: uid(),
        swimlaneId: laneExecution,
        name: 'Paid Media',
        startDate: '2026-03-02',
        endDate: '2026-04-17',
        color: PALETTE[3],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneExecution,
        name: 'Email Nurture',
        startDate: '2026-03-16',
        endDate: '2026-05-08',
        color: PALETTE[4],
        track: 1,
      },
      {
        id: uid(),
        swimlaneId: laneExecution,
        name: 'Influencers',
        startDate: '2026-04-06',
        endDate: '2026-06-05',
        color: PALETTE[3],
        track: 2,
      },
      {
        id: uid(),
        swimlaneId: laneExecution,
        name: 'Launch Event',
        startDate: '2026-04-20',
        endDate: '2026-05-22',
        color: PALETTE[4],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneExecution,
        name: 'Retargeting',
        startDate: '2026-05-18',
        endDate: '2026-07-31',
        color: PALETTE[3],
        track: 1,
      },

      // Analytics
      {
        id: uid(),
        swimlaneId: laneAnalytics,
        name: 'Attribution Setup',
        startDate: '2026-02-02',
        endDate: '2026-03-20',
        color: PALETTE[5],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneAnalytics,
        name: 'A/B Testing',
        startDate: '2026-03-16',
        endDate: '2026-05-01',
        color: PALETTE[5],
        track: 1,
      },
      {
        id: uid(),
        swimlaneId: laneAnalytics,
        name: 'Weekly Reports',
        startDate: '2026-04-20',
        endDate: '2026-07-31',
        color: PALETTE[5],
        track: 0,
      },
      {
        id: uid(),
        swimlaneId: laneAnalytics,
        name: 'Optimization',
        startDate: '2026-05-25',
        endDate: '2026-07-10',
        color: PALETTE[5],
        track: 2,
      },
      {
        id: uid(),
        swimlaneId: laneAnalytics,
        name: 'Post-Mortem',
        startDate: '2026-07-27',
        endDate: '2026-09-11',
        color: PALETTE[5],
        track: 0,
      },
    ],
    legendLabels: {
      [PALETTE[0]]: 'Strategy',
      [PALETTE[1]]: 'Copy & Design',
      [PALETTE[2]]: 'Production',
      [PALETTE[3]]: 'Paid Media',
      [PALETTE[4]]: 'Owned Channels',
      [PALETTE[5]]: 'Analytics',
    },
  };
}

// ---- Persistence ----
export function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    } catch (e) {
      console.error('Save failed:', e);
      if (_showInfoFn) _showInfoFn('Could not save. Storage may be full.');
    }
  }, SAVE_DEBOUNCE_MS);
}

export function pushHistory(newState) {
  if (historyIndex < stateHistory.length - 1) {
    stateHistory = stateHistory.slice(0, historyIndex + 1);
  }
  stateHistory.push(JSON.parse(JSON.stringify(newState)));
  if (stateHistory.length > MAX_HISTORY) {
    stateHistory.shift();
  } else {
    historyIndex++;
  }
  updateUndoRedoUI();
}

export function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    STATE = JSON.parse(JSON.stringify(stateHistory[historyIndex]));
    if (_assignTracksFn) _assignTracksFn();
    saveState();
    if (_renderFn) _renderFn();
    updateUndoRedoUI();
  }
}

export function redo() {
  if (historyIndex < stateHistory.length - 1) {
    historyIndex++;
    STATE = JSON.parse(JSON.stringify(stateHistory[historyIndex]));
    if (_assignTracksFn) _assignTracksFn();
    saveState();
    if (_renderFn) _renderFn();
    updateUndoRedoUI();
  }
}

export function updateUndoRedoUI() {
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  if (btnUndo) btnUndo.disabled = historyIndex <= 0;
  if (btnRedo) btnRedo.disabled = historyIndex >= stateHistory.length - 1;
}

export function updateTimelineDates() {
  const cfg = ZOOM_CONFIG[STATE.timeline.zoomLevel || 'month'];  
  const start = parseDate(STATE.timeline.startDate);  
  const end = addDays(start, cfg.defaultDays);
  STATE.timeline.endDate = fmt(end);  
}

export function setState(fn, skipHistory = false) {
  fn(STATE);
  if (_assignTracksFn) _assignTracksFn();
  saveState();
  if (!skipHistory) {
    pushHistory(STATE);
  }
  if (_renderFn) _renderFn();
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.timeline) STATE = parsed;  
    } else {
      STATE = exampleState();  
    }
  } catch (e) {
    console.error('Load failed:', e);
  }
  // Migrate old palette colors and add track property
  if (STATE.items) {
    STATE.items.forEach((item) => {
      const mapped = COLOR_MIGRATION[item.color];
      if (mapped) item.color = mapped;
      if (item.track === undefined) item.track = 0;
    });
  }
  if (STATE.swimlanes) {
    STATE.swimlanes.forEach((lane) => {
      if (lane.minRows === undefined) lane.minRows = 1;
    });
  }
  if (!STATE.legendLabels) {
    STATE.legendLabels = {}; // eslint-disable-line no-restricted-syntax
  }
  if (!STATE.timeline.sidebarWidth) {
    STATE.timeline.sidebarWidth = DEFAULT_SIDEBAR_W;  
  }
  if (!STATE.timeline.legendOrientation) {
    STATE.timeline.legendOrientation = 'vertical';  
  }
  if (!STATE.timeline.legendAlign) {
    STATE.timeline.legendAlign = 'right';  
  }
  if (!STATE.timeline.displayMode) {
    STATE.timeline.displayMode = 'timeline';  
  }
  // Migrate old viewMode/monthCount/weekCount to new zoomLevel
  if (STATE.timeline.viewMode && typeof STATE.timeline.zoomLevel !== 'string') {
    if (STATE.timeline.viewMode === 'week') {
      STATE.timeline.zoomLevel = 'week';  
    } else {
      const mc = STATE.timeline.monthCount || 12;
      if (mc <= 2) STATE.timeline.zoomLevel = 'week';  
      else if (mc <= 18) STATE.timeline.zoomLevel = 'month';  
      else STATE.timeline.zoomLevel = 'quarter';  
    }
    delete STATE.timeline.viewMode;  
    delete STATE.timeline.monthCount;  
    delete STATE.timeline.weekCount;  
  }
  if (!STATE.timeline.zoomLevel || !ZOOM_CONFIG[STATE.timeline.zoomLevel]) {
    STATE.timeline.zoomLevel = 'month';  
  }
  // Update timeline dates based on zoomLevel
  updateTimelineDates();
  // Assign tracks after loading
  if (_assignTracksFn) _assignTracksFn();

  // Reset history to the loaded state
  stateHistory = [JSON.parse(JSON.stringify(STATE))];
  historyIndex = 0;
  updateUndoRedoUI();
}

// Used by welcome toast "Get Started" button
export function resetToDefault() {
  STATE = defaultState();  
  selectedItemId = null;
  saveState();
  stateHistory = [JSON.parse(JSON.stringify(STATE))];
  historyIndex = 0;
  updateUndoRedoUI();
}
