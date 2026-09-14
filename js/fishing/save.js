import { byId, rods, baits, rodUnlocked, baitUnlocked } from './catches.js';
export const SAVE_KEY = 'eliana.fishing.v1';
const cap = (value, max = 1e9) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
export function freshSave() {
  return { version: 1, collection: {}, highScore: 0, rod: 'driftwood', bait: 'crumbs', dryStreak: 0, muted: true };
}
export function normalizeSave(input) {
  const data = freshSave();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return data;
  data.highScore = cap(input.highScore);
  data.dryStreak = cap(input.dryStreak, 100);
  for (const key of ['muted']) if (typeof input[key] === 'boolean') data[key] = input[key];
  if (input.collection && typeof input.collection === 'object') {
    for (const [id, entry] of Object.entries(input.collection)) {
      if (!Object.hasOwn(byId, id) || !entry || typeof entry !== 'object' || !cap(entry.count, 1e6)) continue;
      data.collection[id] = {
        count: cap(entry.count, 1e6),
        largest: typeof entry.largest === 'number' && Number.isFinite(entry.largest) ? Math.min(1000, Math.max(0, entry.largest)) : null,
        firstCaught: typeof entry.firstCaught === 'string' && Number.isFinite(Date.parse(entry.firstCaught)) ? new Date(entry.firstCaught).toISOString() : null
      };
    }
  }
  if (rods.some(rod => rod.id === input.rod && rodUnlocked(rod, data))) data.rod = input.rod;
  if (baits.some(bait => bait.id === input.bait && baitUnlocked(bait, data))) data.bait = input.bait;
  return data;
}
export function createStore(storage, onIssue = () => {}) {
  let readOnly = false;
  return {
    load() {
      try {
        const raw = storage.getItem(SAVE_KEY);
        if (!raw) return freshSave();
        const input = JSON.parse(raw);
        if (input?.version && input.version !== 1) {
          readOnly = true;
          onIssue('this save belongs to a different game version. you can play, but it will not be overwritten.');
          return freshSave();
        }
        return normalizeSave(input);
      } catch {
        onIssue('your saved progress could not be read. starting fresh; progress will save here if your browser allows it.');
        return freshSave();
      }
    },
    save(data) {
      if (readOnly) return false;
      try { storage.setItem(SAVE_KEY, JSON.stringify(data)); return true; }
      catch { onIssue('saving is unavailable in this browser. you can keep playing, but new progress may be lost when you leave.'); return false; }
    },
    reset() {
      try { storage.removeItem(SAVE_KEY); readOnly = false; return true; }
      catch { onIssue('your browser could not reset the saved progress. please allow local storage and try again.'); return false; }
    }
  };
}
