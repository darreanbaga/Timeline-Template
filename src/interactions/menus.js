// ---- Context menu ----
let activeMenu = null;

export function dismissMenu() {
  if (activeMenu) {
    activeMenu.classList.add('ctx-exit');
    const el = activeMenu;
    activeMenu = null;
    setTimeout(() => el.remove(), 100);
  }
}

export function showMenu(items, anchorEl) {
  dismissMenu();
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';

  items.forEach((item) => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'ctx-menu-separator';
      menu.appendChild(sep);
      return;
    }
    if (item.colors) {
      const row = document.createElement('div');
      row.className = 'ctx-menu-colors';
      item.colors.forEach((color) => {
        const sw = document.createElement('div');
        sw.className = 'ctx-menu-swatch' + (item.selectedColor === color ? ' selected' : '');
        sw.style.background = color;
        sw.addEventListener('click', () => {
          dismissMenu();
          if (item.onColorClick) item.onColorClick(color);
        });
        row.appendChild(sw);
      });
      menu.appendChild(row);
      return;
    }
    const btn = document.createElement('button');
    btn.className =
      'ctx-menu-item' + (item.danger ? ' ctx-danger' : '') + (item.disabled ? ' ctx-disabled' : '');
    btn.textContent = item.label;
    if (item.disabled) btn.disabled = true;
    btn.addEventListener('click', () => {
      if (item.disabled) return;
      dismissMenu();
      if (item.onClick) item.onClick();
    });
    menu.appendChild(btn);
  });

  menu.style.visibility = 'hidden';
  menu.style.top = '0';
  menu.style.left = '0';
  document.body.appendChild(menu);

  const rect = anchorEl.getBoundingClientRect();
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  const margin = 4;
  let top = rect.bottom + margin;
  if (top + mh > window.innerHeight - 8) top = rect.top - mh - margin;
  let left = rect.left;
  if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
  if (left < 8) left = 8;
  menu.style.top = top + 'px';
  menu.style.left = left + 'px';
  menu.style.visibility = '';
  activeMenu = menu;
}

export function getActiveMenu() {
  return activeMenu;
}

// ---- Calendar popover ----
let activeCalendarPopover = null;

export function dismissCalendarPopover() {
  if (activeCalendarPopover) {
    activeCalendarPopover.remove();
    activeCalendarPopover = null;
  }
}

export function showCalendarPopover(items, anchorEl, title) {
  dismissCalendarPopover();
  const pop = document.createElement('div');
  pop.className = 'calendar-popover';
  if (title) {
    const h = document.createElement('div');
    h.className = 'calendar-popover-title';
    h.textContent = title;
    pop.appendChild(h);
  }
  items.forEach(function (it) {
    const row = document.createElement('div');
    row.className = 'calendar-popover-item';
    const swatch = document.createElement('div');
    swatch.className = 'calendar-popover-swatch';
    swatch.style.background = it.color;
    row.appendChild(swatch);
    const nameEl = document.createElement('span');
    nameEl.textContent = it.name || 'Untitled';
    row.appendChild(nameEl);
    const dates = document.createElement('span');
    dates.className = 'calendar-popover-dates';
    dates.textContent = it.startDate + ' \u2013 ' + it.endDate;
    row.appendChild(dates);
    pop.appendChild(row);
  });
  document.body.appendChild(pop);
  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 4;
  let left = rect.left;
  const popRect = pop.getBoundingClientRect();
  if (top + popRect.height > window.innerHeight) top = rect.top - popRect.height - 4;
  if (left + popRect.width > window.innerWidth) left = window.innerWidth - popRect.width - 8;
  if (left < 4) left = 4;
  pop.style.top = top + 'px';
  pop.style.left = left + 'px';
  activeCalendarPopover = pop;
  setTimeout(function () {
    document.addEventListener('click', dismissCalendarPopover, { once: true });
  }, 0);
}
