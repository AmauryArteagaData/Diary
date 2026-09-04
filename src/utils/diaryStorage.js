// src/utils/diaryStorage.js
/**
 * @typedef {Object} DiaryEntry
 * @property {string} fecha - Standard date string (YYYY-MM-DD)
 * @property {string} displayDate - Human readable date string
 * @property {string} contenido - Text content written by user
 * @property {string} mood - Selected mood identifier or emoji/label
 * @property {string[]} tags - List of associated tags (e.g. ['#gratitude'])
 * @property {string} [updatedAt] - ISO timestamp of last update
 */

const STORAGE_KEY = 'mind_diary_entries';

/**
 * Format Date object to YYYY-MM-DD string
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get human readable display date
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function getDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generate 10 sample past entries for demonstration
 * @returns {Record<string, DiaryEntry>}
 */
export function getSampleEntriesMap() {
  const sampleData = [
    { daysAgo: 1, mood: 'Feeling great', tags: ['#reflection', '#mindfulness'], content: 'Took a peaceful evening walk and reflected on my monthly goals. Feeling centered and inspired.' },
    { daysAgo: 2, mood: 'Feeling great', tags: ['#work', '#focus', '#productivity'], content: 'Deep focus session on creative projects today. Managed to solve a complex design challenge.' },
    { daysAgo: 3, mood: 'Feeling alright', tags: ['#reading', '#growth'], content: 'Read a compelling chapter on building positive daily rituals. Small steps compound over time.' },
    { daysAgo: 4, mood: 'Feeling great', tags: ['#gratitude', '#family'], content: 'Shared coffee and laughs with loved ones. It is always the simple moments that bring the deepest joy.' },
    { daysAgo: 5, mood: 'Feeling neutral', tags: ['#wellness', '#balance'], content: 'Felt a bit overwhelmed by chores, but a brief 10-minute meditation helped restore tranquility.' },
    { daysAgo: 6, mood: 'Feeling alright', tags: ['#routine', '#morning'], content: 'Started writing my thoughts alongside hot herbal tea at dawn. Clears the morning mental fog.' },
    { daysAgo: 7, mood: 'Feeling down', tags: ['#rest', '#selfcare'], content: 'A slower day with low energy. Allowed myself to disconnect, rest, and listen to relaxing music.' },
    { daysAgo: 8, mood: 'Feeling great', tags: ['#cooking', '#gratitude'], content: 'Cooked a new recipe from scratch and caught the golden sunset from the window.' },
    { daysAgo: 9, mood: 'Feeling alright', tags: ['#clarity', '#organization'], content: 'Organized my workspace and journal archive. A clear desk truly creates a clearer mind.' },
    { daysAgo: 10, mood: 'Feeling great', tags: ['#newbeginning', '#journal'], content: 'Began this mindful journal habit. Excited to track my daily moods and personal evolution.' },
  ];

  const map = {};
  sampleData.forEach(({ daysAgo, mood, tags, content }) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const key = getTodayKey(d);
    map[key] = {
      fecha: key,
      displayDate: getDisplayDate(d),
      contenido: content,
      mood: mood,
      tags: tags,
      updatedAt: d.toISOString()
    };
  });

  return map;
}

/**
 * Seed sample entries into localStorage if empty
 * @param {boolean} [force=false]
 */
export function seedSampleEntries(force = false) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const keys = Object.keys(existing);

    if (force || keys.length <= 1) {
      const samples = getSampleEntriesMap();
      const merged = { ...samples, ...existing };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('diary:entry-updated', { detail: { seeded: true } }));
      return merged;
    }
  } catch (err) {
    console.error('Error seeding sample entries:', err);
  }
}

/**
 * Retrieve all entries from localStorage as an array
 * @returns {DiaryEntry[]}
 */
export function getAllEntries() {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    let map = raw ? JSON.parse(raw) : null;

    // If storage is empty or only has today's initial empty entry, auto-seed with 10 sample entries
    if (!map || Object.keys(map).length <= 1) {
      map = seedSampleEntries() || (raw ? JSON.parse(raw) : {});
    }

    return Object.values(map).sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
  } catch (err) {
    console.error('Error reading diary entries from localStorage:', err);
    return [];
  }
}

/**
 * Get entry by date key (YYYY-MM-DD)
 * @param {string} dateKey
 * @returns {DiaryEntry | null}
 */
export function getEntryByDate(dateKey) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[dateKey] || null;
  } catch (err) {
    console.error('Error reading entry for date:', dateKey, err);
    return null;
  }
}

/**
 * Get or create today's entry
 * @returns {DiaryEntry}
 */
export function getTodayEntry() {
  const todayKey = getTodayKey();
  const existing = getEntryByDate(todayKey);
  if (existing) return existing;

  return {
    fecha: todayKey,
    displayDate: getDisplayDate(),
    contenido: '',
    mood: 'Feeling alright',
    tags: [],
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save / update today's entry
 * @param {Partial<DiaryEntry>} patch
 * @returns {DiaryEntry}
 */
export function saveTodayEntry(patch) {
  if (typeof window === 'undefined') return getTodayEntry();
  try {
    const todayKey = getTodayKey();
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const current = map[todayKey] || {
      fecha: todayKey,
      displayDate: getDisplayDate(),
      contenido: '',
      mood: 'Feeling alright',
      tags: [],
      updatedAt: new Date().toISOString()
    };

    const updated = {
      ...current,
      ...patch,
      fecha: todayKey,
      displayDate: current.displayDate || getDisplayDate(),
      updatedAt: new Date().toISOString()
    };

    map[todayKey] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    // Also support fallback single entry key with template literal
    localStorage.setItem(`entry-${todayKey}`, updated.contenido);

    // Broadcast event so all components react immediately
    window.dispatchEvent(new CustomEvent('diary:entry-updated', { detail: updated }));

    return updated;
  } catch (err) {
    console.error('Error saving today entry:', err);
    return getTodayEntry();
  }
}

/**
 * Delete an entry by date key
 * @param {string} dateKey
 * @returns {boolean}
 */
export function deleteEntry(dateKey) {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    if (map[dateKey]) {
      delete map[dateKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      localStorage.removeItem(`entry-${dateKey}`);
      window.dispatchEvent(new CustomEvent('diary:entry-updated', { detail: { fecha: dateKey, deleted: true } }));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error deleting entry:', dateKey, err);
    return false;
  }
}

/**
 * Calculate consecutive streak from entries
 * @param {DiaryEntry[]} [entries]
 * @returns {{ currentStreak: number, activeToday: boolean }}
 */
export function calculateStreak(entries = getAllEntries()) {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, activeToday: false };
  }

  // Filter valid entries that have text or tags recorded
  const validDates = new Set(
    entries
      .filter(e => (e.contenido && e.contenido.trim().length > 0) || (e.tags && e.tags.length > 0))
      .map(e => e.fecha)
  );

  const today = new Date();
  const todayStr = getTodayKey(today);
  const activeToday = validDates.has(todayStr);

  let streak = 0;
  let checkDate = new Date(today);

  // If not written today, start checking from yesterday
  if (!activeToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = getTodayKey(checkDate);
    if (validDates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, activeToday };
}

/**
 * Extract frequent themes/tags and usage counts across all entries
 * @param {DiaryEntry[]} [entries]
 * @returns {{ tag: string, count: number }[]}
 */
export function extractThemes(entries = getAllEntries()) {
  const counts = {};

  entries.forEach(entry => {
    if (Array.isArray(entry.tags)) {
      entry.tags.forEach(t => {
        if (!t) return;
        const clean = t.startsWith('#') ? t : `#${t}`;
        counts[clean] = (counts[clean] || 0) + 1;
      });
    }

    // Also extract hashtags written directly inside the content
    if (entry.contenido) {
      const inlineTags = entry.contenido.match(/#[a-zA-Z0-9_\u00C0-\u017F]+/g) || [];
      inlineTags.forEach(t => {
        if (!entry.tags || !entry.tags.includes(t)) {
          counts[t] = (counts[t] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get recent entries sorted with non-empty content
 * @param {DiaryEntry[]} [entries]
 * @param {number} [limit=4]
 * @returns {DiaryEntry[]}
 */
export function getRecentEntries(entries = getAllEntries(), limit = 4) {
  return entries
    .filter(e => (e.contenido && e.contenido.trim().length > 0) || (e.tags && e.tags.length > 0))
    .slice(0, limit);
}
