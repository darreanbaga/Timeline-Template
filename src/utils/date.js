import { MONTH_NAMES, MS_PER_DAY, FY_START_MONTH } from '../constants.js';

export function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s) {
  if (!s || typeof s !== 'string') return new Date();
  const [y, m, d] = s.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
  return new Date(y, m - 1, d);
}

export function daysBetween(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function snapToMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday = 0, Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDateForTooltip(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Shared fiscal calendar calculation for a given date.
// Returns fiscalMonth (0=Oct..11=Sep), fiscalQuarter (0-based), fyYear.
export function getFiscalInfo(date) {
  const month = date.getMonth();
  const year = date.getFullYear();
  const fiscalMonth = (month - FY_START_MONTH + 12) % 12;
  const fiscalQuarter = Math.floor(fiscalMonth / 3);
  const fyYear = month >= FY_START_MONTH ? year : year - 1;
  return { fiscalMonth, fiscalQuarter, fyYear };
}

// Returns the start of the current fiscal quarter and 4 quarters later.
export function fiscalQuarterRange(today) {
  const { fiscalQuarter, fyYear } = getFiscalInfo(today);
  const qCalMonth = (FY_START_MONTH + fiscalQuarter * 3) % 12;
  const qYear = qCalMonth >= FY_START_MONTH ? fyYear : fyYear + 1;
  const start = new Date(qYear, qCalMonth, 1);
  const end = new Date(qYear + 1, qCalMonth, 1);
  return { start, end };
}

export function columnWidthPct(col, tlStart, totalDays) {
  const days = daysBetween(tlStart, col.end) - daysBetween(tlStart, col.start);
  return (days / totalDays) * 100;
}

export function getQuarters(start, end) {
  const quarters = [];
  let cur = new Date(start);
  while (cur < end) {
    const fi = getFiscalInfo(cur);
    const nextQIdx = fi.fiscalQuarter + 1;
    const nextCalMonth = (FY_START_MONTH + nextQIdx * 3) % 12;
    const nextFyYear = nextQIdx >= 4 ? fi.fyYear + 1 : fi.fyYear;
    const nextYear = nextCalMonth < FY_START_MONTH ? nextFyYear + 1 : nextFyYear;
    const next = new Date(nextYear, nextCalMonth, 1);
    quarters.push({
      start: new Date(cur),
      end: next > end ? new Date(end) : next,
      label: `Q${fi.fiscalQuarter + 1} FY${String(fi.fyYear + 1).slice(2)}`,
    });
    cur = next;
  }
  return quarters;
}

export function getMonths(start, end) {
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur < end) {
    const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    months.push({
      start: new Date(cur),
      end: next > end ? new Date(end) : next,
      label: MONTH_NAMES[cur.getMonth()],
    });
    cur = next;
  }
  return months;
}

export function getWeeks(start, end) {
  const weeks = [];
  let cur = new Date(start);
  cur = snapToMonday(cur);

  let weekNum = 1;
  while (cur < end) {
    const next = addDays(cur, 7);
    weeks.push({
      start: new Date(cur),
      end: next > end ? new Date(end) : next,
      label: `W${weekNum}`,
    });
    cur = next;
    weekNum++;
  }
  return weeks;
}

export function getDays(start, end) {
  const days = [];
  let cur = new Date(start);
  while (cur < end) {
    const next = addDays(cur, 1);
    days.push({
      start: new Date(cur),
      end: next > end ? new Date(end) : next,
      label: String(cur.getDate()),
    });
    cur = next;
  }
  return days;
}

export function getColumns(start, end, granularity) {
  const generators = { day: getDays, week: getWeeks, month: getMonths, quarter: getQuarters };
  return generators[granularity](start, end);
}

// Interpolate from eq-gold-light (#fff8e6) to eq-gold (#ffcb31), t in [0,1]
export function goldRamp(t) {
  const r = Math.round(255 + (255 - 255) * t);
  const g = Math.round(248 + (203 - 248) * t);
  const b = Math.round(230 + (49 - 230) * t);
  return `rgb(${r},${g},${b})`;
}
