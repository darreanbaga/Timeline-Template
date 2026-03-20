import { snapToMonday, getFiscalInfo } from './utils/date.js';

export const PALETTE = Array.from({ length: 8 }, (_, i) => `var(--palette-${i})`);
export const STORAGE_KEY = 'timeline_tmpl_v1';
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Layout and behavior constants (avoid magic numbers scattered in code)
export const MS_PER_DAY = 86400000;
export const MIN_BAR_WIDTH = 12;
export const DRAG_THRESHOLD = 5;
export const LABEL_PAD_H = 12;
export const BASE_FONT = 17;
export const MIN_FONT = 10;
export const MIN_LANE_SCALE = MIN_FONT / BASE_FONT;
export const DEFAULT_SIDEBAR_W = 180;
export const AUTOFOCUS_DELAY_MS = 30;
export const SAVE_DEBOUNCE_MS = 500;
export const MAX_HISTORY = 50;
export const FY_START_MONTH = 10; // November (0-indexed), FY ends October 31

export const MAX_SWIMLANES = 8;
export const MAX_TOTAL_ROWS = 20;

export const SLIDE_W = 1920;
export const SLIDE_H = 1080;
export const LEGEND_RESERVE = 80; // space reserved at bottom of grid for legend overlay

// Zoom-level configuration map
export const ZOOM_CONFIG = {
  day: {
    defaultDays: 14,
    shiftUnit: 'day',
    shiftAmount: 1,
    snapStart: (d) => d,
    topGranularity: 'month',
    showQuarterRow: false,
    showSubMonthRow: true,
    subMonthMode: 'day',
    useFullMonthNames: true,
    monthColorMode: 'gradient',
    dateLabel: (d) => MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
  },
  week: {
    defaultDays: 56,
    shiftUnit: 'week',
    shiftAmount: 7,
    snapStart: (d) => snapToMonday(d),
    topGranularity: 'month',
    showQuarterRow: false,
    showSubMonthRow: true,
    subMonthMode: 'week',
    useFullMonthNames: true,
    monthColorMode: 'gradient',
    dateLabel: (d) => MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
  },
  month: {
    defaultDays: 365,
    shiftUnit: 'month',
    shiftAmount: 1,
    snapStart: (d) => {
      d.setDate(1);
      return d;
    },
    topGranularity: 'quarter',
    showQuarterRow: true,
    showSubMonthRow: false,
    subMonthMode: null,
    useFullMonthNames: false,
    monthColorMode: 'alternating',
    dateLabel: (d) => MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear(),
  },
  quarter: {
    defaultDays: 730,
    shiftUnit: 'quarter',
    shiftAmount: 3,
    snapStart: (d) => {
      const fi = getFiscalInfo(d);
      const calMonth = (FY_START_MONTH + fi.fiscalQuarter * 3) % 12;
      const yr = calMonth >= FY_START_MONTH ? fi.fyYear : fi.fyYear + 1;
      return new Date(yr, calMonth, 1);
    },
    topGranularity: 'quarter',
    showQuarterRow: true,
    showSubMonthRow: false,
    subMonthMode: null,
    useFullMonthNames: false,
    monthColorMode: 'alternating',
    dateLabel: (d) => {
      const fi = getFiscalInfo(d);
      return 'Q' + (fi.fiscalQuarter + 1) + ' FY' + String(fi.fyYear + 1).slice(2);
    },
  },
};

export const COLOR_MIGRATION = {
  '#4f6df5': '#5b8dbf',
  '#e5484d': '#d4736c',
  '#30a46c': '#5ea87a',
  '#e38627': '#d4964a',
  '#8b5cf6': '#9179c2',
  '#0ea5e9': '#5ea5b8',
  '#ec4899': '#c97ba0',
  '#6d6e75': '#8a8580',
};
