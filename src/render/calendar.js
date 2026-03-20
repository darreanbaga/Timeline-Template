import { getState, setState } from '../state.js';
import { PALETTE, MONTH_NAMES_FULL } from '../constants.js';
import { fmt, parseDate, daysBetween } from '../utils/date.js';
import { goldRamp } from '../utils/date.js';
import { showMenu } from '../interactions/menus.js';
import { showCalendarPopover } from '../interactions/menus.js';
import { startInlineEdit } from '../interactions/inline-edit.js';
import { startRenameTitle } from '../interactions/inline-edit.js';
import { showInfo } from '../interactions/dialogs.js';
import { deleteItem, addItem } from '../controls.js';
import { buildLegend } from './legend.js';
import { LOGO_SRC } from './logo.js';

export function buildCalendarView() {
  const STATE = getState();
  const view = document.createElement('div');
  view.className = 'calendar-view';

  // Title row
  const titleRow = document.createElement('div');
  titleRow.className = 'calendar-title-row';
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
  view.appendChild(titleRow);

  // Determine month range from state
  const tlStart = parseDate(STATE.timeline.startDate);
  const tlEnd = parseDate(STATE.timeline.endDate);
  const months = [];
  const cur = new Date(tlStart.getFullYear(), tlStart.getMonth(), 1);
  while (cur < tlEnd) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  if (months.length === 0) months.push(new Date(tlStart.getFullYear(), tlStart.getMonth(), 1));

  // Navigation row
  const navRow = document.createElement('div');
  navRow.className = 'calendar-nav-row';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'calendar-nav-btn';
  prevBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

  const navLabel = document.createElement('div');
  navLabel.className = 'calendar-nav-label';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'calendar-nav-btn';
  nextBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

  navRow.appendChild(prevBtn);
  navRow.appendChild(navLabel);
  navRow.appendChild(nextBtn);

  const calTodayBtn = document.createElement('button');
  calTodayBtn.className = 'calendar-today-btn';
  calTodayBtn.textContent = 'Today';
  calTodayBtn.addEventListener('click', function () {
    const now = new Date();
    for (let i = 0; i < months.length; i++) {
      if (months[i].getFullYear() === now.getFullYear() && months[i].getMonth() === now.getMonth()) {
        slidesContainer.scrollLeft = i * slidesContainer.clientWidth;
        return;
      }
    }
    showInfo('Current month is outside the timeline range.');
  });
  navRow.appendChild(calTodayBtn);

  view.appendChild(navRow);

  // Slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'calendar-slides-container';

  const today = new Date();
  const todayStr = fmt(today);
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build a slide for each month
  months.forEach((monthDate) => {
    const slide = document.createElement('div');
    slide.className = 'calendar-slide';
    slide.style.background = goldRamp(monthDate.getMonth() % 2 === 0 ? 0.03 : 0.08);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Weekday labels
    const weekdayRow = document.createElement('div');
    weekdayRow.className = 'calendar-weekday-row';
    WEEKDAYS.forEach((d) => {
      const cell = document.createElement('div');
      cell.textContent = d;
      weekdayRow.appendChild(cell);
    });
    slide.appendChild(weekdayRow);

    // Items active during this month
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    const activeItems = STATE.items.filter((it) => {
      const iStart = parseDate(it.startDate);
      const iEnd = parseDate(it.endDate);
      return iStart <= monthEnd && iEnd >= monthStart;
    });

    // Build weeks structure: each week is an array of 7 day numbers (0 = empty)
    const weeks = [];
    let week = new Array(7).fill(0);
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      if (d === 1) {
        week = new Array(7).fill(0);
      }
      week[dayOfWeek] = d;
      if (dayOfWeek === 6 || d === daysInMonth) {
        weeks.push(week);
        week = new Array(7).fill(0);
      }
    }

    // Assign items to tracks within weeks for bar layout
    const weeksContainer = document.createElement('div');
    weeksContainer.className = 'calendar-weeks-container';

    weeks.forEach((weekDays) => {
      const weekStart = weekDays.find((d) => d > 0);
      const weekEnd = weekDays
        .slice()
        .reverse()
        .find((d) => d > 0);
      if (!weekStart) return;

      const weekStartDate = new Date(year, month, weekStart);
      const weekEndDate = new Date(year, month, weekEnd, 23, 59, 59);

      // Day number row
      const dayRow = document.createElement('div');
      dayRow.className = 'calendar-week-row';
      for (let col = 0; col < 7; col++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (weekDays[col] === 0) {
          dayEl.classList.add('outside');
        } else {
          const dateStr = fmt(new Date(year, month, weekDays[col]));
          if (dateStr === todayStr) dayEl.classList.add('today');
          const num = document.createElement('div');
          num.className = 'calendar-day-num';
          num.textContent = weekDays[col];
          dayEl.appendChild(num);
          (function (dayDate) {
            dayEl.addEventListener('click', function (e) {
              e.stopPropagation();
              addItem(dayDate);
            });
          })(new Date(year, month, weekDays[col]));
        }
        dayRow.appendChild(dayEl);
      }
      weeksContainer.appendChild(dayRow);

      // Find items active in this week
      const weekItems = activeItems.filter((it) => {
        const iStart = parseDate(it.startDate);
        const iEnd = parseDate(it.endDate);
        return iStart <= weekEndDate && iEnd >= weekStartDate;
      });

      if (weekItems.length > 0) {
        // Sort items: longer items first, then by start date
        weekItems.sort((a, b) => {
          const aDays = daysBetween(parseDate(a.startDate), parseDate(a.endDate));
          const bDays = daysBetween(parseDate(b.startDate), parseDate(b.endDate));
          if (bDays !== aDays) return bDays - aDays;
          return a.startDate.localeCompare(b.startDate);
        });

        // Assign tracks (vertical slots) to avoid overlaps
        const tracks = [];
        const itemTrackMap = new Map();

        weekItems.forEach((item) => {
          const iStart = parseDate(item.startDate);
          const iEnd = parseDate(item.endDate);
          let colStart = 0;
          let colEnd = 6;
          for (let c = 0; c < 7; c++) {
            if (weekDays[c] > 0) {
              const cd = new Date(year, month, weekDays[c]);
              if (cd >= iStart && colStart === 0 && c > 0 && weekDays[c - 1] === 0) colStart = c;
              if (cd < iStart) colStart = c + 1;
              if (cd <= iEnd) colEnd = c;
            }
          }
          const firstCol = weekDays.findIndex((d) => d > 0);
          const lastCol =
            weekDays.length -
            1 -
            weekDays
              .slice()
              .reverse()
              .findIndex((d) => d > 0);
          colStart = Math.max(colStart, firstCol);
          colEnd = Math.min(colEnd, lastCol);

          let placed = false;
          for (let t = 0; t < tracks.length; t++) {
            const conflict = tracks[t].some((entry) => {
              return !(colEnd < entry.colStart || colStart > entry.colEnd);
            });
            if (!conflict) {
              tracks[t].push({ item, colStart, colEnd });
              itemTrackMap.set(item.id, t);
              placed = true;
              break;
            }
          }
          if (!placed) {
            tracks.push([{ item, colStart, colEnd }]);
            itemTrackMap.set(item.id, tracks.length - 1);
          }
        });

        // Render item bar rows (one row per track)
        const maxTracks = Math.min(tracks.length, 4);
        for (let t = 0; t < maxTracks; t++) {
          const barRow = document.createElement('div');
          barRow.className = 'calendar-item-bars-row';

          const entries = tracks[t];
          entries.sort((a, b) => a.colStart - b.colStart);

          let currentCol = 0;
          entries.forEach((entry) => {
            if (entry.colStart > currentCol) {
              const spacer = document.createElement('div');
              spacer.className = 'calendar-item-bar-spacer';
              spacer.style.gridColumn = currentCol + 1 + ' / ' + (entry.colStart + 1);
              barRow.appendChild(spacer);
            }

            const bar = document.createElement('div');
            bar.className = 'calendar-item-bar';
            bar.dataset.itemId = entry.item.id;
            bar.style.gridColumn = entry.colStart + 1 + ' / ' + (entry.colEnd + 2);
            bar.style.background = entry.item.color;
            bar.title =
              (entry.item.name || 'Untitled') + ' (' + entry.item.startDate + ' to ' + entry.item.endDate + ')';

            const iStart = parseDate(entry.item.startDate);
            const iEnd = parseDate(entry.item.endDate);
            const firstDayDate = new Date(year, month, weekDays[entry.colStart]);
            const lastDayDate = new Date(year, month, weekDays[entry.colEnd]);

            const isStart =
              firstDayDate.getTime() === iStart.getTime() ||
              (iStart < new Date(year, month, 1) && weekDays[entry.colStart] === 1);
            const isEnd =
              lastDayDate.getTime() === iEnd.getTime() || (iEnd > monthEnd && weekDays[entry.colEnd] === daysInMonth);

            if (isStart && isEnd) {
              bar.classList.add('bar-start', 'bar-end');
            } else if (isStart) {
              bar.classList.add('bar-start');
              bar.style.borderTopRightRadius = '0';
              bar.style.borderBottomRightRadius = '0';
              bar.style.marginRight = '0';
            } else if (isEnd) {
              bar.classList.add('bar-end');
              bar.style.borderTopLeftRadius = '0';
              bar.style.borderBottomLeftRadius = '0';
              bar.style.marginLeft = '0';
            } else {
              bar.classList.add('bar-mid');
              bar.style.marginLeft = '0';
              bar.style.marginRight = '0';
            }

            bar.textContent = entry.item.name || 'Untitled';
            (function (item, barEl) {
              barEl.addEventListener('click', function (e) {
                e.stopPropagation();
                showMenu(
                  [
                    {
                      colors: PALETTE,
                      selectedColor: item.color,
                      onColorClick: function (color) {
                        setState(function (s) {
                          const it = s.items.find(function (i) {
                            return i.id === item.id;
                          });
                          if (it) it.color = color;
                        });
                      },
                    },
                    {
                      label: 'Rename',
                      onClick: function () {
                        startInlineEdit(barEl, item.name || '', function (val) {
                          setState(function (s) {
                            const it = s.items.find(function (i) {
                              return i.id === item.id;
                            });
                            if (it) it.name = val;
                          });
                        });
                      },
                    },
                    {
                      label: 'Delete',
                      danger: true,
                      onClick: function () {
                        deleteItem(item.id);
                      },
                    },
                  ],
                  barEl,
                );
              });
            })(entry.item, bar);
            barRow.appendChild(bar);

            currentCol = entry.colEnd + 1;
          });

          weeksContainer.appendChild(barRow);
        }

        // Show overflow indicator if more tracks than displayed
        if (tracks.length > maxTracks) {
          const hiddenItemsMap = new Map();
          for (let t = maxTracks; t < tracks.length; t++) {
            tracks[t].forEach(function (entry) {
              if (!hiddenItemsMap.has(entry.item.id)) {
                hiddenItemsMap.set(entry.item.id, entry.item);
              }
            });
          }
          const hiddenItems = Array.from(hiddenItemsMap.values());
          const overflow = document.createElement('div');
          overflow.className = 'calendar-overflow-indicator';
          overflow.textContent = '+' + hiddenItems.length + ' more';
          overflow.addEventListener('click', function (e) {
            e.stopPropagation();
            showCalendarPopover(hiddenItems, overflow, 'Hidden items');
          });
          weeksContainer.appendChild(overflow);
        }
      }
    });

    slide.appendChild(weeksContainer);
    slidesContainer.appendChild(slide);
  });

  view.appendChild(slidesContainer);

  // Update nav label based on visible slide
  function updateNavLabel() {
    if (months.length === 0) return;
    const slideWidth = slidesContainer.clientWidth;
    if (slideWidth === 0) return;
    const idx = Math.round(slidesContainer.scrollLeft / slideWidth);
    const clampedIdx = Math.max(0, Math.min(idx, months.length - 1));
    const m = months[clampedIdx];
    navLabel.textContent = MONTH_NAMES_FULL[m.getMonth()] + ' ' + m.getFullYear();
  }

  // Scroll to a month that contains today or start with first slide
  let initialIdx = 0;
  for (let i = 0; i < months.length; i++) {
    if (months[i].getFullYear() === today.getFullYear() && months[i].getMonth() === today.getMonth()) {
      initialIdx = i;
      break;
    }
  }

  // After DOM is attached, scroll to initial month
  requestAnimationFrame(() => {
    slidesContainer.scrollLeft = initialIdx * slidesContainer.clientWidth;
    updateNavLabel();
  });

  slidesContainer.addEventListener('scroll', updateNavLabel);

  prevBtn.addEventListener('click', () => {
    const slideWidth = slidesContainer.clientWidth;
    const currentIdx = Math.round(slidesContainer.scrollLeft / slideWidth);
    if (currentIdx > 0) {
      slidesContainer.scrollLeft = (currentIdx - 1) * slideWidth;
    }
  });

  nextBtn.addEventListener('click', () => {
    const slideWidth = slidesContainer.clientWidth;
    const currentIdx = Math.round(slidesContainer.scrollLeft / slideWidth);
    if (currentIdx < months.length - 1) {
      slidesContainer.scrollLeft = (currentIdx + 1) * slideWidth;
    }
  });

  updateNavLabel();

  // Legend
  const legend = buildLegend();
  if (legend) {
    legend.style.position = 'absolute';
    legend.style.bottom = '12px';
    view.style.position = 'relative';
    view.appendChild(legend);
  }

  return view;
}
