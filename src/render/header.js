import { MONTH_NAMES_FULL } from '../constants.js';
import { columnWidthPct, getMonths, getDays, getWeeks, getFiscalInfo, goldRamp } from '../utils/date.js';
import { getState } from '../state.js';
import { TITLE_ROW_H, QUARTER_ROW_H, MONTH_ROW_H, WEEK_ROW_H, getDisplayConfig } from '../utils/layout.js';
import { showMenu } from '../interactions/menus.js';
import { startRenameTitle } from '../interactions/inline-edit.js';
import { LOGO_SRC } from './logo.js';

export function buildHeaderRow(items, ctx, height, styleFn, options = {}) {
  const { tlStart, totalDays } = ctx;
  const row = document.createElement('div');
  row.className = 'timeline-header-row' + (options.className ? ' ' + options.className : '');
  row.style.height = height + 'px';
  items.forEach((item, i) => {
    const hd = document.createElement('div');
    hd.className = 'timeline-col-header';
    hd.style.width = columnWidthPct(item, tlStart, totalDays) + '%';
    hd.style.background = styleFn(item, i, items.length);
    hd.textContent = options.labelFn ? options.labelFn(item, i) : item.label;
    row.appendChild(hd);
  });
  return row;
}

export function buildHeader(ctx) {
  const STATE = getState();
  const { tlStart, tlEnd, cols } = ctx;
  const cfg = getDisplayConfig();
  const header = document.createElement('div');
  header.className = 'timeline-header';
  const months = getMonths(tlStart, tlEnd);

  // Title row
  const titleRow = document.createElement('div');
  titleRow.className = 'timeline-header-row timeline-title-row';
  titleRow.style.height = TITLE_ROW_H + 'px';
  const titleEl = document.createElement('div');
  titleEl.className = 'timeline-title';
  titleEl.textContent = STATE.timeline.title || 'New Timeline';
  titleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    showMenu([{ label: 'Rename', onClick: () => startRenameTitle() }], titleEl);
  });
  titleRow.appendChild(titleEl);

  const logo = document.createElement('img');
  logo.className = 'slide-logo';
  logo.crossOrigin = 'anonymous';
  logo.src = LOGO_SRC;
  logo.alt = 'EQ Bank';
  titleRow.appendChild(logo);
  header.appendChild(titleRow);

  // Quarter row
  if (cfg.showQuarterRow) {
    header.appendChild(
      buildHeaderRow(cols, ctx, QUARTER_ROW_H, (col) => goldRamp((getFiscalInfo(col.start).fiscalQuarter + 1) / 4)),
    );
  }

  // Month row
  const monthStyle =
    cfg.monthColorMode === 'gradient'
      ? (_m, i, len) => goldRamp(len === 1 ? 1 : i / (len - 1))
      : (_m, i) => (i % 2 === 0 ? 'var(--canvas-row-even)' : 'var(--canvas-row-weekend)');
  const monthLabel = cfg.useFullMonthNames ? (m) => MONTH_NAMES_FULL[m.start.getMonth()] : undefined;
  header.appendChild(
    buildHeaderRow(months, ctx, MONTH_ROW_H, monthStyle, {
      labelFn: monthLabel,
      className: cfg.showQuarterRow ? '' : 'timeline-month-primary',
    }),
  );

  // Sub-month row (weeks or days)
  if (cfg.showSubMonthRow) {
    if (cfg.subMonthMode === 'day') {
      header.appendChild(
        buildHeaderRow(
          getDays(tlStart, tlEnd),
          ctx,
          WEEK_ROW_H,
          (day) => {
            const dow = day.start.getDay();
            return dow === 0 || dow === 6 ? 'var(--canvas-row-weekend)' : 'var(--canvas-row-even)';
          },
          { className: 'timeline-week-header' },
        ),
      );
    } else {
      header.appendChild(
        buildHeaderRow(
          getWeeks(tlStart, tlEnd),
          ctx,
          WEEK_ROW_H,
          (_w, i) => (i % 2 === 0 ? 'var(--canvas-row-even)' : 'var(--canvas-row-weekend)'),
          { className: 'timeline-week-header' },
        ),
      );
    }
  }

  return header;
}
