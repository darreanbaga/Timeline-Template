import { getState, setState } from '../state.js';
import { PALETTE } from '../constants.js';
import { uid } from '../utils/dom.js';
import { showInfo } from '../interactions/dialogs.js';

export function exportCSV() {
  const STATE = getState();
  const laneMap = {};
  STATE.swimlanes.forEach((l) => {
    laneMap[l.id] = l.name;
  });
  const escape = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const paletteIndex = (color) => {
    const m = String(color).match(/--palette-(\d)/);
    return m ? m[1] : '0';
  };
  const rows = [['Group', 'Initiative', 'Start Date', 'End Date', 'Color'].map(escape).join(',')];
  STATE.items.forEach((item) => {
    rows.push(
      [
        escape(laneMap[item.swimlaneId] || ''),
        escape(item.name || ''),
        escape(item.startDate),
        escape(item.endDate),
        escape(paletteIndex(item.color)),
      ].join(','),
    );
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'timeline.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importCSV() {
  const fileInput = document.getElementById('csv-file-input');
  fileInput.value = '';
  fileInput.click();
}

export function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function setupCSVFileInput() {
  document.getElementById('csv-file-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showInfo('Please select a CSV file.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', function (evt) {
      const text = evt.target.result.trim();
      if (!text) {
        showInfo('The file is empty.');
        return;
      }
      const lines = text.split(/\r?\n/);
      // Validate header
      const header = lines[0]
        .replace(/"/g, '')
        .split(',')
        .map((h) => h.trim());
      if (
        header.length < 4 ||
        header[0] !== 'Group' ||
        header[1] !== 'Initiative' ||
        header[2] !== 'Start Date' ||
        header[3] !== 'End Date'
      ) {
        showInfo('Invalid CSV format. Expected columns: Group, Initiative, Start Date, End Date');
        return;
      }
      const hasColor = header.length >= 5 && header[4] === 'Color';
      const dataRows = lines.slice(1).filter((l) => l.trim());
      if (dataRows.length === 0) {
        showInfo('The CSV file has no data rows.');
        return;
      }
      const dateRe = /^\d{4}-\d{2}-\d{2}$/;
      const newItems = [];
      const errors = [];
      dataRows.forEach((row, i) => {
        const cols = parseCSVRow(row);
        if (cols.length < 4) {
          errors.push('Row ' + (i + 2) + ': not enough columns');
          return;
        }
        const group = cols[0],
          name = cols[1],
          startDate = cols[2],
          endDate = cols[3];
        if (!name) {
          errors.push('Row ' + (i + 2) + ': missing initiative name');
          return;
        }
        if (!dateRe.test(startDate) || !dateRe.test(endDate)) {
          errors.push('Row ' + (i + 2) + ': invalid date format (expected YYYY-MM-DD)');
          return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
          errors.push('Row ' + (i + 2) + ': end date must be after start date');
          return;
        }
        let colorIdx = 0;
        if (hasColor && cols[4] !== undefined && cols[4] !== '') {
          const parsed = parseInt(cols[4], 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < PALETTE.length) colorIdx = parsed;
        }
        newItems.push({ group, name, startDate, endDate, colorIdx });
      });
      if (newItems.length === 0) {
        showInfo('No valid rows found.\n' + errors.join('\n'));
        return;
      }
      setState((s) => {
        const laneByName = {};
        s.swimlanes.forEach((l) => {
          laneByName[l.name.toLowerCase()] = l;
        });
        let maxOrder = Math.max(0, ...s.swimlanes.map((l) => l.order));
        newItems.forEach((row) => {
          let lane = laneByName[row.group.toLowerCase()];
          if (!lane) {
            lane = { id: uid(), name: row.group || 'Imported', order: ++maxOrder, minRows: 1 };
            s.swimlanes.push(lane);
            laneByName[lane.name.toLowerCase()] = lane;
          }
          s.items.push({
            id: uid(),
            swimlaneId: lane.id,
            name: row.name,
            startDate: row.startDate,
            endDate: row.endDate,
            color: PALETTE[row.colorIdx || 0],
            track: 0,
          });
        });
      });
      let msg = 'Imported ' + newItems.length + ' initiative' + (newItems.length === 1 ? '' : 's') + '.';
      if (errors.length) msg += '\n' + errors.length + ' row(s) skipped:\n' + errors.join('\n');
      showInfo(msg);
    });
    reader.readAsText(file);
  });
}
