import eventsData from './data/events.json';

// ── Fallback events (shown when the curated event list is empty) ──
const FALLBACK = [
  {
    chip: 'Chapter Events',
    chipClass: 'chip-conf',
    day: '—',
    monthYear: 'Coming Soon',
    title: 'IAASEE United States Chapter Events',
    desc: 'New chapter events are being scheduled. Contact the chapter to be notified about workshops, webinars, and the next Inter-American Congress.',
    loc: 'United States',
    url: '',
  },
];

const PIN = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtml = (s) =>
  String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Normalise one curated event (from src/data/events.json) into card fields. */
function fromFeed(ev) {
  const d = ev.start ? new Date(ev.start) : null;
  const valid = d && !Number.isNaN(d.getTime());
  const desc = truncate(stripHtml(ev.description), 200);
  return {
    chip: ev.chip || 'IAASEE Event',
    chipClass: 'chip-conf',
    day: valid ? String(d.getUTCDate()).padStart(2, '0') : '—',
    monthYear: valid ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : '',
    title: ev.title || 'Untitled event',
    desc: desc || 'Details available on the AIDIS Inter-American calendar.',
    loc: ev.location || '',
    url: ev.url || '',
  };
}

function cardHtml(e) {
  const locBlock = e.loc
    ? `<div class="event-loc">${PIN} ${esc(e.loc)}</div>`
    : (e.url ? `<a class="event-loc event-link" href="${esc(e.url)}" target="_blank" rel="noopener">View details →</a>` : '');
  const title = e.url
    ? `<a class="event-title-link" href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.title)}</a>`
    : esc(e.title);
  return `
      <div class="event-card reveal">
        <div class="event-header">
          <div class="event-chip ${esc(e.chipClass)}">${esc(e.chip)}</div>
          <div class="event-date-num">${esc(e.day)}</div>
          <div class="event-date-mo">${esc(e.monthYear)}</div>
        </div>
        <div class="event-body">
          <h3>${title}</h3>
          <p>${esc(e.desc)}</p>
          ${locBlock}
        </div>
      </div>`;
}

/** Render the Events section from the curated list, falling back to a static card. */
export function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const feed = Array.isArray(eventsData?.events) ? eventsData.events : [];
  const items = feed.length ? feed.map(fromFeed) : FALLBACK;

  // data-limit="3" on the grid trims the list (home page preview).
  const limitAttr = parseInt(grid.dataset.limit, 10);
  const limit = Number.isFinite(limitAttr) && limitAttr > 0 ? limitAttr : items.length;

  grid.innerHTML = items.slice(0, limit).map(cardHtml).join('');

  // Event cards are injected after main.js sets up its reveal observer,
  // so trigger their entrance transition on the next frame.
  const cards = [...grid.querySelectorAll('.reveal')];
  requestAnimationFrame(() => cards.forEach((c) => c.classList.add('in')));
}
