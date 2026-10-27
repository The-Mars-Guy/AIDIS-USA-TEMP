// Syncs the AIDIS Inter-American event feed into src/data/aidis-feed.json for reference.
// The public site renders curated English events from src/data/events.json.
// Never fails the build: on any error it keeps the existing data file.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'src', 'data', 'aidis-feed.json');
const SOURCE = 'https://aidisnet.org/events/?ical=1';

/** Unfold iCal folded lines: a leading space/tab continues the previous line. */
function unfold(text) {
  const raw = text.split(/\r\n|\n|\r/);
  const lines = [];
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

/** Parse a property line into { name, value } (params like ;VALUE=DATE are dropped). */
function parseProp(line) {
  const idx = line.indexOf(':');
  if (idx < 0) return null;
  const left = line.slice(0, idx);
  const value = line.slice(idx + 1);
  const name = left.split(';')[0].toUpperCase();
  return { name, value };
}

function unescapeText(v) {
  return v
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function toISODate(v) {
  if (!v) return '';
  const m = v.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

function parseCalendar(text) {
  const lines = unfold(text);
  const events = [];
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) { cur = {}; continue; }
    if (line.startsWith('END:VEVENT')) {
      if (cur && (cur.SUMMARY || cur.DTSTART)) {
        events.push({
          title: unescapeText(cur.SUMMARY || ''),
          start: toISODate(cur.DTSTART || ''),
          end: toISODate(cur.DTEND || ''),
          description: unescapeText(cur.DESCRIPTION || ''),
          url: (cur.URL || '').trim(),
          location: unescapeText(cur.LOCATION || ''),
        });
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    const p = parseProp(line);
    if (!p) continue;
    if (!(p.name in cur)) cur[p.name] = p.value;
  }
  return events;
}

function readExisting() {
  try {
    if (existsSync(OUT)) return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch { /* ignore */ }
  return null;
}

function write(data) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  let events = [];
  try {
    const res = await fetch(SOURCE, {
      headers: { 'User-Agent': 'aidis-us-site/1.0 (+events sync script)' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    events = parseCalendar(text);
  } catch (err) {
    const existing = readExisting();
    console.warn(`[sync-events] fetch failed (${err.message}); keeping existing data.`);
    if (!existing) write({ syncedAt: null, source: SOURCE, events: [] });
    return;
  }

  // Keep upcoming events (allow same-day), sort ascending by start date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((e) => {
      if (!e.start) return false;
      const d = new Date(`${e.start}T00:00:00Z`);
      return !Number.isNaN(d.getTime()) && d >= new Date(today.getTime() - 86400000);
    })
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  write({
    syncedAt: new Date().toISOString(),
    source: SOURCE,
    events: upcoming,
  });
  console.log(`[sync-events] wrote ${upcoming.length} upcoming event(s) to src/data/aidis-feed.json`);
}

main();
