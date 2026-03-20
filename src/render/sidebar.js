import { getState, setState, saveState, pushHistory } from '../state.js';
import { MAX_TOTAL_ROWS, DEFAULT_SIDEBAR_W } from '../constants.js';
import { getSidebarWidth, getSlideScale } from '../utils/layout.js';
import { showMenu } from '../interactions/menus.js';
import { startRenameLane } from '../interactions/inline-edit.js';
import { showConfirm } from '../interactions/dialogs.js';
import { getTotalRows } from '../utils/tracks.js';
import { getRender } from '../state.js';

export function buildSidebarRow(lane, height) {
  const STATE = getState();
  const row = document.createElement('div');
  row.className = 'sidebar-row';
  row.dataset.laneId = lane.id;
  row.draggable = true;
  row.style.height = height + 'px';

  row.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', lane.id);
    e.dataTransfer.effectAllowed = 'move';
    row.style.opacity = '0.5';
  });
  row.addEventListener('dragend', () => {
    row.style.opacity = '';
  });
  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = row.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    row.classList.remove('drag-over-above', 'drag-over-below');
    if (e.clientY < mid) row.classList.add('drag-over-above');
    else row.classList.add('drag-over-below');
  });
  row.addEventListener('dragleave', () => {
    row.classList.remove('drag-over-above', 'drag-over-below');
  });
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('drag-over-above', 'drag-over-below');
    const dragId = e.dataTransfer.getData('text/plain');
    if (dragId === lane.id) return;
    const rect = row.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const above = e.clientY < mid;
    setState((s) => {
      const fromIdx = s.swimlanes.findIndex((l) => l.id === dragId);
      if (fromIdx === -1) return;
      const [moved] = s.swimlanes.splice(fromIdx, 1);
      let toIdx = s.swimlanes.findIndex((l) => l.id === lane.id);
      if (!above) toIdx++;
      s.swimlanes.splice(toIdx, 0, moved);
    });
  });

  const nameEl = document.createElement('div');
  nameEl.className = 'lane-name';
  nameEl.textContent = lane.name;
  nameEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const laneItems = STATE.items.filter((it) => it.swimlaneId === lane.id);
    const itemCount = laneItems.length;
    const deleteMsg = itemCount > 0 ? `Delete '${lane.name}' and ${itemCount} item(s)?` : `Delete '${lane.name}'?`;
    const currentMinRows = (STATE.swimlanes.find((l) => l.id === lane.id) || {}).minRows || 1;
    const lastRowEmpty = !STATE.items.some((it) => it.swimlaneId === lane.id && it.track >= currentMinRows - 1);
    showMenu(
      [
        { label: 'Rename', onClick: () => startRenameLane(lane.id) },
        { separator: true },
        {
          label: '+ Add row',
          disabled: getTotalRows() >= MAX_TOTAL_ROWS,
          onClick: () => {
            if (getTotalRows() >= MAX_TOTAL_ROWS) return;
            setState((s) => {
              const l = s.swimlanes.find((l) => l.id === lane.id);
              if (l) l.minRows = (l.minRows || 1) + 1;
            });
          },
        },
        {
          label: '- Remove row',
          disabled: !lastRowEmpty || currentMinRows <= 1,
          onClick: () => {
            if (!lastRowEmpty || currentMinRows <= 1) return;
            setState((s) => {
              const l = s.swimlanes.find((l) => l.id === lane.id);
              if (l) l.minRows = Math.max(1, (l.minRows || 1) - 1);
            });
          },
        },
        { separator: true },
        {
          label: 'Delete',
          danger: true,
          onClick: () => {
            const doDelete = () =>
              setState((s) => {
                s.swimlanes = s.swimlanes.filter((l) => l.id !== lane.id);
                s.items = s.items.filter((it) => it.swimlaneId !== lane.id);
              });
            if (itemCount > 0) {
              showConfirm(deleteMsg, doDelete);
            } else {
              doDelete();
            }
          },
        },
      ],
      nameEl,
    );
  });

  row.appendChild(nameEl);
  return row;
}

export function buildSidebar(laneHeights) {
  const STATE = getState();
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';

  const sideHeader = document.createElement('div');
  sideHeader.className = 'sidebar-header';
  sidebar.appendChild(sideHeader);

  const sideRows = document.createElement('div');
  sideRows.className = 'sidebar-rows';
  STATE.swimlanes.forEach((lane, idx) => {
    sideRows.appendChild(buildSidebarRow(lane, laneHeights[idx]));
  });
  sidebar.appendChild(sideRows);

  // Resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'sidebar-resize-handle';
  resizeHandle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeHandle.classList.add('active');
    const slide = document.getElementById('slide');
    const scale = getSlideScale();
    const startX = e.clientX;
    const startWidth = getSidebarWidth();

    function onMove(me) {
      const dx = (me.clientX - startX) / scale;
      const newWidth = Math.max(DEFAULT_SIDEBAR_W, Math.min(400, startWidth + dx));
      const STATE = getState();
      STATE.timeline.sidebarWidth = Math.round(newWidth);
      if (slide) {
        slide.style.setProperty('--sidebar-width', Math.round(newWidth) + 'px');
      }
    }

    function onUp() {
      resizeHandle.classList.remove('active');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      saveState();
      pushHistory(getState());
      const render = getRender();
      if (render) render();
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
  sidebar.appendChild(resizeHandle);

  return sidebar;
}
