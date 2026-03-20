import { getState } from '../state.js';
import { parseDate } from './date.js';
import { MAX_TOTAL_ROWS } from '../constants.js';

export function assignTracks() {
  const STATE = getState();
  // Preserve user-set track positions. Only push items DOWN when there is
  // an actual collision on their current track — never pack items upward.
  STATE.swimlanes.forEach((lane) => {
    const laneItems = STATE.items.filter((it) => it.swimlaneId === lane.id);
    if (laneItems.length === 0) return;

    // Sort by intended track first, then by start date within each track.
    // This ensures earlier-placed items on a track claim it before later ones.
    laneItems.sort((a, b) => {
      if (a.track !== b.track) return a.track - b.track;
      return parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime();
    });

    // trackEnds[t] = latest end date of items already placed on track t
    const trackEnds = {};

    laneItems.forEach((item) => {
      const itemStart = parseDate(item.startDate);
      const itemEnd = parseDate(item.endDate);
      let t = item.track;

      // Push down only if there is a real collision on track t
      while (trackEnds[t] && itemStart < trackEnds[t]) {
        t++;
      }

      item.track = t;
      if (!trackEnds[t] || itemEnd > trackEnds[t]) {
        trackEnds[t] = itemEnd;
      }
    });
  });
}

export function getTrackCount(laneId) {
  const STATE = getState();
  const lane = STATE.swimlanes.find((l) => l.id === laneId);
  const minRows = lane && lane.minRows ? lane.minRows : 1;
  const laneItems = STATE.items.filter((it) => it.swimlaneId === laneId);
  if (laneItems.length === 0) return minRows;
  const itemMax = Math.max(...laneItems.map((it) => it.track)) + 1;
  return Math.max(itemMax, minRows);
}

export function getTotalRows() {
  const STATE = getState();
  return STATE.swimlanes.reduce((sum, lane) => sum + getTrackCount(lane.id), 0);
}

export function findFreeTrack(laneId, startDateStr, endDateStr, items) {
  const STATE = getState();
  const src = items || STATE.items;
  const laneItems = src.filter((it) => it.swimlaneId === laneId);
  const itemStart = parseDate(startDateStr);
  const itemEnd = parseDate(endDateStr);
  // Check total row budget before allowing a new track
  const currentTotal = getTotalRows();
  const currentLaneTracks = getTrackCount(laneId);
  for (let t = 0; ; t++) {
    const conflict = laneItems.some(
      (it) => it.track === t && parseDate(it.startDate) < itemEnd && parseDate(it.endDate) > itemStart,
    );
    if (!conflict) {
      // If this track would create a new row, check the budget
      if (t >= currentLaneTracks && currentTotal >= MAX_TOTAL_ROWS) return -1;
      return t;
    }
  }
}
