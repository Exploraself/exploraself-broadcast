// ExploraSelf Broadcast
//
// Inform. Reform. Transform.
//
// The world supplies the moment. We supply the tool. The reader keeps the move.
// Every story is told in three labelled parts — what happened, what it means
// for your trade, your next move — because news that stops at "what happened"
// is somebody else's product.
//
// The home page IS The Leader's Intelligence Report: four quadrants, one per
// domain, two stories each, one question each. The four squares are the grid.

import { whyLine, industryNames, industryGroups, topicNames, overrides, articlesFor, teaserFor, coverage, moveFor } from './content.js';
import { icon, domainIcon, assessments, products } from './icons.js';
import { initWelcome } from './welcome.js';

const $ = (id) => document.getElementById(id);
const domains = ['Self', 'People', 'Work', 'Business'];
const views = ['Today', 'Latest', 'Saved', 'Explore', 'Preferences'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : '#'; } catch { return '#'; } };
const read = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };

// v3: the source list grew from two publishers to twenty-seven, so an empty
// `sources` now means "all of them" rather than a hard allow-list of two.
let prefs = read('broadcast-v3-preferences', { domains: [...domains], topics: [], sources: [], large: false, compact: false, industry: '', askedIndustry: false });
if (typeof prefs.industry !== 'string') prefs.industry = '';
if (!Array.isArray(prefs.sources)) prefs.sources = [];

let bookmarks = read('broadcast-v3-bookmarks', []);
let data = read('broadcast-v3-edition', null);
let view = 'Today', domain = 'All', limit = 12, query = '', busy = false;
if (!Array.isArray(bookmarks)) bookmarks = [];

const bookmarkIcon = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M4 3h12v18l-6-4-6 4z"/></svg>';
const compass = '<svg class="compass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z"/><path d="m12 5.7 2 4.3 4.3 2-4.3 2-2 4.3-2-4.3-4.3-2 4.3-2 2-4.3Z" fill="currentColor" stroke="none"/></svg>';

const PER_DOMAIN = 2;        // two told in full
const MORE_PER_DOMAIN = 6;   // and the rest of the domain as a wire list
const reportTitles = { Self: 'Lead yourself', People: 'Lead people', Work: 'Rethink work', Business: 'Beyond business' };
const descriptions = { Self: 'Clarity, judgement and the person behind your decisions.', People: 'Teams, trust and the relationships that make work possible.', Work: 'Technology, priorities and better ways of getting things done.', Business: 'Markets, customers and the forces shaping your business.' };
const questions = { Self: 'What assumption deserves a second look before your next important decision?', People: 'How might this affect the people you lead — and what conversation would help?', Work: 'Where could this change a process, a priority or a decision in your business?', Business: 'What would this mean for your customers, your offer or your next investment of time?' };

function persist() {
  try {
    localStorage.setItem('broadcast-v3-preferences', JSON.stringify(prefs));
    localStorage.setItem('broadcast-v3-bookmarks', JSON.stringify(bookmarks));
  } catch { toast('Device storage is unavailable. Changes will last for this visit.'); }
}
function toast(msg) {
  $('toast').textContent = msg; $('toast').classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2500);
}
function dateLabel(s) { const d = new Date(s); return Number.isFinite(d.valueOf()) ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Date not supplied'; }
function isSaved(id) { return bookmarks.some((a) => a.id === id); }

// ── Selection ────────────────────────────────────────────────────────────────
// Twenty-seven feeds offer a few hundred stories a day and the edition keeps
// eight. The rejection is what makes it feel edited, so it is scored, not
// sliced. This runs in the browser because Workers' free CPU budget is 10ms.

function clarityOf(a) {
  const n = (a.topics || []).length;
  if (!n) return 0.2;              // nothing recognised
  if (n <= 3) return 1;            // focused on something we can speak to
  if (n <= 5) return 0.7;
  return 0.4;                      // matches everything, so it is about nothing
}
function score(a) {
  const hours = (Date.now() - Date.parse(a.publishedAt || 0)) / 3600000;
  const fresh = Number.isFinite(hours) ? Math.max(0, 1 - Math.max(0, hours) / 48) : 0.25;
  const authority = ((a.weight || 1) - 1) / 2;
  let extra = 0;
  if (a.excerpt) extra += 0.5;
  if (a.image) extra += 0.2;
  // A story we can speak to precisely for this reader's trade earns its place.
  if (prefs.industry && (a.topics || []).some((t) => overrides[t] && overrides[t][prefs.industry])) extra += 0.3;
  return fresh * 0.4 + authority * 0.3 + clarityOf(a) * 0.2 + Math.min(1, extra) * 0.1;
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 70);
function dedupe(list) {
  const byId = new Set(), byTitle = new Set(), out = [];
  for (const a of list) {
    const t = norm(a.title);
    if (!a.id || byId.has(a.id) || byTitle.has(t)) continue;
    byId.add(a.id); byTitle.add(t); out.push(a);
  }
  return out;
}
const sourceAllowed = (a) => !prefs.sources.length || prefs.sources.includes(a.source);

/** Two stories told in full per domain, plus the rest of the domain as a list.
 *  Broadcast is a news app before it is anything else: the reader should see
 *  far more headlines than commentary. */
function edition() {
  const pool = dedupe((data?.articles || []).filter(sourceAllowed)).map((a) => ({ a, s: score(a) })).sort((x, y) => y.s - x.s);
  const out = {};
  for (const d of domains) {
    const all = pool.filter((p) => p.a.domain === d).map((p) => p.a);
    out[d] = { lead: all.slice(0, PER_DOMAIN), more: all.slice(PER_DOMAIN, PER_DOMAIN + MORE_PER_DOMAIN), total: all.length };
  }
  return out;
}
function editionList() { const e = edition(); return domains.flatMap((d) => e[d].lead); }

// ── Promotion as banners, never as another paragraph ─────────────────────────
// Three fixed sizes, each filling exactly one grid slot so the rhythm holds.
// Artwork, a short title, one button. No body copy competing with the news.

const promoPool = [...assessments, ...products];
function pickPromo(i) { return promoPool[((i % promoPool.length) + promoPool.length) % promoPool.length]; }

function banner(p, size = 'tile') {
  return `<a class="bn bn-${size}" href="${esc(p.url)}" target="_blank" rel="noopener">
    <span class="bn-art" aria-hidden="true">${icon(p.icon)}</span>
    <span class="bn-body">
      <span class="bn-tag">ExploraSelf${p.price ? ' · ' + esc(p.price) : ''}</span>
      <strong class="bn-title">${esc(p.title)}</strong>
    </span>
    <span class="bn-go">${esc(p.label || 'Open')}<em aria-hidden="true">→</em></span>
  </a>`;
}
const tileBanner = (i) => banner(pickPromo(i), 'tile');
const stripBanner = (i) => banner(pickPromo(i), 'strip');

/** The one full-width band: the paid audit, stated plainly, once per page. */
function bandBanner() {
  const u = assessments[0];
  return `<a class="bn bn-band" href="${esc(u.url)}" target="_blank" rel="noopener">
    <span class="bn-art" aria-hidden="true">${icon('compass')}</span>
    <span class="bn-body">
      <span class="bn-tag">ExploraSelf · ${esc(u.price)} · ${esc(u.worth || '')}</span>
      <strong class="bn-title">${esc(u.title)}</strong>
      <span class="bn-sub">24 questions · four domains · a 30/60/90-day plan</span>
    </span>
    <span class="bn-go">${esc(u.label)}<em aria-hidden="true">→</em></span>
  </a>`;
}

// ── A story, in three labelled parts ─────────────────────────────────────────

function topicFor(a) {
  const list = (a.topics || []).filter((t) => topicNames.includes(t));
  if (!list.length) return null;
  return list.find((t) => overrides[t] && overrides[t][prefs.industry]) || list[0];
}
function saveButton(a, full = false) {
  return `<button class="bookmark" data-save="${esc(a.id)}" aria-pressed="${isSaved(a.id)}" aria-label="${isSaved(a.id) ? 'Remove bookmark:' : 'Bookmark:'} ${esc(a.title)}">${bookmarkIcon}${full ? `<span>${isSaved(a.id) ? 'Saved' : 'Save article'}</span>` : ''}</button>`;
}
function meta(a) {
  return `<div class="meta">${icon('clock')}<span>${esc(a.source)}</span><span>·</span><time datetime="${esc(a.publishedAt)}">${dateLabel(a.publishedAt)}</time>${a.stale ? '<span>· Cached</span>' : ''}${saveButton(a)}</div>`;
}

/** REFORM — where this kind of news usually lands in the reader's trade.
 *  On a card this is ONE line folded under the story, not a section with a
 *  heading of its own. The fuller read waits in the reader. */
function meansLine(a) {
  const t = topicFor(a);
  const line = t ? whyLine(t, prefs.industry) : '';
  if (!line) return '';
  return `<p class="st-means">${icon('market')}<span><b>What it means for you${prefs.industry ? ' · ' + esc(prefs.industry) : ''}:</b> ${esc(line)}</span></p>`;
}

/** The fuller version, used only inside the reader. */
function meansBlock(a) {
  const t = topicFor(a);
  const line = t ? whyLine(t, prefs.industry) : '';
  if (!line) return '';
  return `<div class="part means"><p class="partlabel">${icon('market')}What it means for you${prefs.industry ? ' · ' + esc(prefs.industry) : ''}</p><p>${esc(line)}</p>${prefs.industry ? '' : '<button class="textbtn" data-askindustry>Name your trade to sharpen this →</button>'}</div>`;
}

/** TRANSFORM — the move itself. No codename, no "tool 004 of 100": the reader
 *  has never heard of the field guide, and jargon they cannot place reads as
 *  noise. Where the move comes from is revealed later, as a discovery. */
function moveBlock(a, provenance = false) {
  const t = topicFor(a);
  if (!t) return '';
  const m = moveFor(t, a.id);
  if (!m) return '';
  return `<div class="part move"><p class="partlabel">${icon('target')}Your next move</p>
    <p class="moveline">${esc(m.line)}</p>
    <p class="moveask">${esc(m.ask)}</p>
    ${provenance ? `<p class="movefrom">${icon('book')}<span>One of a hundred practical tools in Alexandru&rsquo;s field guide. This one is called <b>${esc(m.n)}</b>.</span></p>` : ''}</div>`;
}

function storyCard(a, size = 'card') {
  return `<article class="story st-${size}">
    <div class="st-news">
      <div class="st-head"><span class="domainlabel">${domainIcon(a.domain)}${esc(a.domain)}</span>${meta(a)}</div>
      <h3><button class="headline" data-article="${esc(a.id)}">${esc(a.title)}</button></h3>
      ${a.excerpt ? `<p class="st-excerpt">${esc(a.excerpt)}</p>` : ''}
      <div class="st-foot"><button class="textbtn" data-article="${esc(a.id)}">Open this story →</button><a class="textbtn" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">${esc(a.source)} ↗</a></div>
    </div>
    ${meansLine(a)}
  </article>`;
}

/** A compact wire row: headline, publisher, time. This is what makes it read
 *  like a news service rather than a column. */
function newsRow(a) {
  return `<button class="nrow" data-article="${esc(a.id)}">
    <span class="nrow-t">${esc(a.title)}</span>
    <span class="nrow-m">${esc(a.source)} · ${dateLabel(a.publishedAt)}</span>
  </button>`;
}

document.addEventListener('error', (e) => {
  if (e.target.matches?.('.reader-image')) e.target.remove();
}, true);

// ── The industry choice, six doors instead of thirty ─────────────────────────

function industryPicker(open = false) {
  if (prefs.industry) {
    return `<div class="indline"><span>${icon('compass')}Read through <b>${esc(prefs.industry)}</b></span><button class="textbtn" data-askindustry>Change</button></div>`;
  }
  if (!open && prefs.askedIndustry) {
    return `<div class="indline"><span>${icon('compass')}Every story can tell you where this lands in your own trade.</span><button class="textbtn" data-askindustry>Name your trade</button></div>`;
  }
  return `<section class="indpick" aria-label="Choose your industry">
    <p class="eyebrow">ONE CHOICE, EVERY STORY</p>
    <h2>I work in…</h2>
    <p class="indlede">Pick the closest. Every story then tells you where that kind of news usually lands in your trade — ${coverage()} combinations are written and waiting.</p>
    <div class="indgroups">${industryGroups.map((g, i) => `<details class="indgroup"${i === 0 ? ' open' : ''}><summary>${esc(g.label)}<span>${g.items.length}</span></summary><div class="indchips">${g.items.map((n) => `<button class="indchip" data-industry="${esc(n)}">${esc(n)}</button>`).join('')}</div></details>`).join('')}</div>
    <button class="textbtn" data-skipindustry>Not now, just show me the news</button>
  </section>`;
}

// ── The Leader's Intelligence Report: the home page ──────────────────────────

function reportBar() {
  const live = (data?.sources || []).filter((s) => s.ok).length;
  const count = dedupe((data?.articles || []).filter(sourceAllowed)).length;
  const when = data ? new Date(data.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
  return `<section class="rptbar">
    <div class="rb-left">
      <p class="eyebrow">${compass}THE LEADER&rsquo;S INTELLIGENCE REPORT · FREE, NO EMAIL</p>
      <h2 class="rb-triad"><b>Inform.</b> <b>Reform.</b> <b>Transform.</b></h2>
    </div>
    <p class="rb-meta">${count} stories today${live ? ` from ${live} publishers` : ''}${when ? ` · updated ${esc(when)}` : ''}</p>
  </section>`;
}

/** The four perspectives, visible the moment you arrive, in one short row. */
function perspectives(e) {
  return `<nav class="persp" aria-label="The four perspectives">${domains.map((d, i) => {
    const n = e[d]?.total || 0;
    return `<a class="pcard" href="#chapter-${i}">
      <span class="p-top"><span class="p-n">0${i + 1}</span>${domainIcon(d)}</span>
      <strong class="p-t">${reportTitles[d]}</strong>
      <span class="p-c">${n ? `${n} ${n === 1 ? 'story' : 'stories'}` : 'nothing today'}</span>
    </a>`;
  }).join('')}</nav>`;
}

function chapter(d, i, block) {
  const lead = block.lead || [], more = block.more || [];
  return `<section class="chapter" id="chapter-${i}">
    <header class="ch-head">
      <span class="ch-n">0${i + 1}</span>
      <div><p class="eyebrow">${d.toUpperCase()} · ${esc(descriptions[d])}</p><h3>${reportTitles[d]}</h3></div>
      ${domainIcon(d)}
    </header>
    ${lead.length ? `<div class="ch-grid">${lead.map((a) => storyCard(a)).join('')}</div>` : `<p class="ch-none">Nothing in this domain cleared the bar today. The next edition lands within three hours.</p>`}
    ${more.length ? `<div class="morelist">
      <p class="morehead"><span>More in ${esc(d.toLowerCase())}</span><span>${more.length} ${more.length === 1 ? 'story' : 'stories'}</span></p>
      ${more.map(newsRow).join('')}
    </div>` : ''}
  </section>`;
}

function todayReport() {
  if (!data) return `<div class="loading">Preparing your edition…</div>`;
  const e = edition();
  const total = domains.reduce((n, d) => n + (e[d]?.lead?.length || 0), 0);
  if (!total) return empty('Your next edition is on its way.', 'No publisher feed answered in time. You can still set your preferences and explore the free tools.');
  return `${reportBar()}
    ${prefs.industry ? industryPicker() : ''}
    ${perspectives(e)}
    ${domains.map((d, i) => chapter(d, i, e[d] || {}) + (i === 1 ? bandBanner() : '')).join('')}
    <div class="rpt-actions"><button class="goldbtn" id="downloadReport">Save today’s report ↓</button><button class="textbtn" data-view="Latest">See everything the feeds carried →</button></div>
    ${newsletter()}`;
}

// ── Latest / Saved: one honest grid ──────────────────────────────────────────

function listFor() {
  let list = view === 'Saved' ? [...bookmarks] : dedupe([...(data?.articles || [])]).filter(sourceAllowed);
  if (domain !== 'All') list = list.filter((a) => a.domain === domain);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((a) => (a.title + ' ' + (a.excerpt || '') + ' ' + a.source).toLowerCase().includes(q));
  }
  if (view === 'Latest') list.sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  return list;
}
function empty(title, body) {
  return `<div class="empty"><h2>${title}</h2><p>${body}</p><button class="goldbtn" data-view="Today">Read today’s report →</button></div>`;
}
function feed() {
  const list = listFor();
  if (!data && view !== 'Saved') return `<div class="loading">Preparing your edition…</div>`;
  if (!list.length) {
    return empty(view === 'Saved' ? 'Keep a good idea close.' : 'Nothing matches those choices.',
      view === 'Saved' ? 'Bookmark a story to return to it here. Saved stories stay on this device.' : 'Try another domain, clear the search, or widen your publishers in Preferences.');
  }
  const shown = list.slice(0, limit);
  const cells = [];
  shown.forEach((a, i) => {
    cells.push(storyCard(a));
    if (i % 5 === 4) cells.push(tileBanner(Math.floor(i / 5))); // one banner per five, always one slot
  });
  return `<div class="sectionhead"><span>${view.toUpperCase()}</span><span>${list.length} ${list.length === 1 ? 'story' : 'stories'} · ${view === 'Latest' ? 'newest first' : 'on this device'}</span></div>
    <div class="toolbar"><input class="search" id="search" type="text" value="${esc(query)}" placeholder="Search this edition" aria-label="Search this edition"></div>
    <div class="grid">${cells.join('')}</div>
    ${list.length > limit ? '<button class="loadmore" id="loadmore">More stories ↓</button>' : ''}`;
}

// ── Explore / Preferences ────────────────────────────────────────────────────

function explore() {
  return `<section class="explore">
    <div class="sectionhead"><span>EXPLORASELF · FIVE ASSESSMENTS</span><span>Reading is not the same as knowing where you stand</span></div>
    <div class="grid">${assessments.map((a) => banner(a, 'tile')).join('')}</div>
    ${bandBanner()}
    <div class="sectionhead"><span>GO FURTHER</span><span>When reading stops being enough</span></div>
    <div class="grid">${products.map((p) => banner(p, 'tile')).join('')}</div>
    <div class="sectionhead"><span>THE FOUR DOMAINS</span><span>Where leadership actually happens</span></div>
    <div class="grid">${domains.map((d, i) => `<article class="domaincard"><span class="number">0${i + 1}</span>${domainIcon(d)}<h2>${d}</h2><p>${descriptions[d]}</p><button class="textbtn" data-browse="${d}">Read ${d.toLowerCase()} stories →</button></article>`).join('')}</div>
    ${newsletter()}</section>`;
}

function newsletter() {
  return `<section class="newsletter"><p class="eyebrow">${icon('compass')}OPTIONAL · PREFER IT IN YOUR INBOX?</p>
    <h2>One tool a week. Yours to keep.</h2>
    <p>Join and you get the whole free library the moment you arrive: five leadership assessments, the complete ebook and workbook collection, and one practical tool every week — drawn from Alexandru's field guide of 100.</p>
    <p class="nl-kind">Broadcast stays free to read here with no email, always. This is only for people who would rather it came to them.</p>
    <form class="mcform" data-mc="oneIdea"><div class="formrow">
      <label class="sr-only" for="nlName">First name</label><input id="nlName" name="FNAME" type="text" autocomplete="given-name" placeholder="First name">
      <label class="sr-only" for="nlEmail">Email address</label><input id="nlEmail" type="email" required autocomplete="email" placeholder="Your email address">
      <button class="goldbtn" type="submit">Send me the library ↗</button></div>
    <label class="consent"><input type="checkbox" class="mcconsent" required><span>I agree to receive the weekly ExploraSelf idea and relevant emails. I can unsubscribe at any time. <a href="https://exploraself.com/privacy" target="_blank" rel="noopener">Privacy policy</a>.</span></label>
    <small>Mailchimp (Intuit) processes your name and email. Submission opens the official Mailchimp form to confirm; no subscription is asserted here.</small></form></section>`;
}

function preferences() {
  const publishers = [...new Set((data?.sources || []).map((s) => s.name))].sort();
  return `<section class="preferences">
    <div class="prefblock"><h2>Your perspective, your choice.</h2><p>Preferences and bookmarks are saved on this device. No account needed.</p>
      <div class="checkgrid">${domains.map((d) => `<label><input type="checkbox" data-pref-domain="${d}" ${prefs.domains.includes(d) ? 'checked' : ''}><span>${d}<br><small class="muted">${descriptions[d]}</small></span></label>`).join('')}</div></div>
    <div class="prefblock"><h2>Your trade</h2>${industryPicker(true)}</div>
    <div class="prefblock"><h2>Your publishers</h2><p>Leave all unticked to read every publisher. ${publishers.length} answered in this edition.</p>
      <div class="checkgrid">${publishers.map((s) => `<label><input type="checkbox" data-pref-source="${esc(s)}" ${prefs.sources.includes(s) ? 'checked' : ''}>${esc(s)}</label>`).join('')}</div>
      <ul class="sourceslist">${(data?.sources || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} · ${esc(s.domain)}</a> — <span class="src-${s.ok ? 'ok' : s.declined ? 'declined' : 'down'}">${s.ok ? 'Connected' : esc(s.error || 'Temporarily unavailable')}</span></li>`).join('')}</ul>
      <p class="sourcefine">Original headlines and short publisher excerpts, with a link to the full story at its source. ExploraSelf material is always labelled.</p></div>
    <div class="prefblock"><h2>Make space for reading.</h2>
      <div class="settingsrow"><div><strong>Text size</strong><p>A little more room for each idea.</p></div><select id="textsize" aria-label="Text size"><option value="normal" ${!prefs.large ? 'selected' : ''}>Standard</option><option value="large" ${prefs.large ? 'selected' : ''}>Larger</option></select></div>
      <div class="settingsrow"><div><strong>News refresh</strong><p>Every three hours while the app is open.</p></div><span class="statusbadge">Every 3 hours</span></div>
      <div class="settingsrow"><div><strong>Push notifications</strong><p>Requires separate setup and delivery verification.</p></div><span class="statusbadge">Not configured</span></div>
      <div class="settingsrow"><div><strong>Install Broadcast</strong><p>Open it like an app. Cached editions can be read offline.</p></div><button class="outline" data-install>Install ↗</button></div></div>
    ${newsletter()}</section>`;
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  $('mainnav').innerHTML = views.map((v) => `<button data-view="${v}" ${view === v ? 'aria-current="page"' : ''}>${v}${v === 'Saved' && bookmarks.length ? `<span class="count">${bookmarks.length}</span>` : ''}</button>`).join('');

  const copy = {
    Today: ['TODAY’S EDITION · FOUR PERSPECTIVES', 'The news, and what you<br class="mobile-only"> do about it.'],
    Latest: ['EVERYTHING THE FEEDS CARRIED', 'The full picture.'],
    Saved: ['YOUR READING LIST', 'Ideas worth coming back to.'],
    Explore: ['EXPAND YOUR PERSPECTIVE', 'A better leader starts with curiosity.'],
    Preferences: ['MAKE IT YOURS', 'A little more you.'],
  };
  $('viewEyebrow').textContent = copy[view][0];
  $('viewTitle').innerHTML = copy[view][1];

  // The sticky bar: on the Report it jumps between domains; elsewhere it leads back.
  // The sticky bar he liked: on the Report it jumps between the four domains,
  // everywhere else it is the way back to it.
  const bar = $('reportbar');
  if (bar) {
    bar.dataset.mode = view === 'Today' ? 'jumps' : 'cta';
    bar.innerHTML = view === 'Today'
      ? `<nav class="wrap rb-jumps" aria-label="Jump to a domain">${domains.map((d, i) => `<a class="rb-pill" href="#chapter-${i}" data-chapter="${i}"><span class="rp-i">${domainIcon(d)}</span><span class="rp-t">${reportTitles[d]}</span></a>`).join('')}</nav>`
      : `<button class="wrap rb-cta-btn" data-view="Today"><span class="rb-mark" aria-hidden="true">${compass}</span><span class="rb-text"><strong>The Leader’s Intelligence Report</strong><small>Four perspectives on today. Four questions for your business. Free, no email.</small></span><span class="rb-cta">Read it →</span></button>`;
  }

  $('domainbar').hidden = !['Latest', 'Saved'].includes(view);
  $('domainbar').innerHTML = ['All', ...domains].map((d, i) => `<button data-domain="${d}" aria-pressed="${domain === d}">${i ? domainIcon(d) : icon('compass')}${d === 'All' ? 'All perspectives' : d}</button>`).join('');

  $('screen').innerHTML = view === 'Explore' ? explore() : view === 'Preferences' ? preferences() : view === 'Today' ? todayReport() : feed();
  document.body.classList.toggle('large-text', prefs.large);
  watchChapters();
  updateFreshness();
}

function updateFreshness() {
  if (busy) { $('freshness').textContent = 'Checking publisher feeds…'; return; }
  if (!data) return;
  const d = new Date(data.fetchedAt);
  $('freshness').textContent = `${data.stale ? 'Saved edition' : 'Retrieved'} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · ${dateLabel(d)} · 3h refresh`;
  const failed = (data.sources || []).filter((s) => !s.ok);
  $('notice').hidden = !data.stale;
  $('notice').textContent = data.stale ? 'You’re reading a cached edition. Live refresh is currently unavailable.' : '';
  // A handful of quiet feeds is normal with twenty-seven publishers; it belongs
  // in Preferences, not as an alarm across the top of the news.
  void failed;
}

// The pills mark where the reader actually is, and the bar glows gently now
// and then so it keeps offering itself without ever shouting.
let spy = null, glow = null;
function watchChapters() {
  if (spy) { spy.disconnect(); spy = null; }
  clearInterval(glow); glow = null;
  if (view !== 'Today' || !('IntersectionObserver' in window)) return;
  const bar = $('reportbar');
  const pills = [...bar.querySelectorAll('.rb-pill')];
  const chapters = [...document.querySelectorAll('.chapter')];
  if (!pills.length || !chapters.length) return;
  spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = chapters.indexOf(e.target);
      pills.forEach((p, n) => p.setAttribute('aria-current', String(n === i)));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach((c) => spy.observe(c));
  if (reducedMotion()) return;
  glow = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    bar.classList.add('alive');
    setTimeout(() => bar.classList.remove('alive'), 2200);
  }, 19000);
}

function navigate(v) { view = v; domain = 'All'; query = ''; limit = 12; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }

function article(id) {
  const a = [...(data?.articles || []), ...bookmarks].find((x) => x.id === id);
  if (!a) return;
  const means = meansBlock(a), move = moveBlock(a, true);
  // Open calm: the story and nothing else. The read is offered afterwards,
  // one step at a time, and only if they want it.
  $('readerBody').innerHTML = `<div class="rd-news">
      <span class="domainlabel">${domainIcon(a.domain)}${esc(a.domain)}</span>
      <h2 id="readerTitle">${esc(a.title)}</h2>
      <div class="reader-meta">${esc(a.source)} · ${dateLabel(a.publishedAt)} · Publisher excerpt</div>
      ${a.image ? `<img class="reader-image" src="${esc(safeUrl(a.image))}" alt="">` : ''}
      <p class="rd-body">${esc(a.excerpt || 'Read the original report for the full story and context.')}</p>
      <div class="reader-actions"><a class="goldbtn" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">Read at ${esc(a.source)} ↗</a>${saveButton(a, true)}</div>
    </div>
    ${means ? `<div class="rd-offer" hidden><button class="rd-step" data-reveal="means"><span class="rd-art">${compass}</span><span><strong>What this means for you</strong><small>Take it one step further, if you want to.</small></span><em aria-hidden="true">→</em></button></div>
    <div class="rd-means" hidden><p class="readhead">${compass}<span>The ExploraSelf read</span></p>${means}
      ${move ? `<div class="rd-offer2"><button class="rd-step" data-reveal="move"><span class="rd-art">${icon('target')}</span><span><strong>Your next move</strong><small>One tool, and the single question it asks.</small></span><em aria-hidden="true">→</em></button></div>` : ''}</div>
    <div class="rd-move" hidden>${move}</div>` : ''}
    <div class="rd-tail"${means ? ' hidden' : ''}>${relatedArticles(a)}${topicTeaser(a)}
    <p class="sourcefine">The question is an ExploraSelf prompt, not a claim made by the publisher. Full reporting remains at the original source.</p></div>`;
  $('reader').showModal();
  $('reader').scrollTop = 0;
  // Let the story have the screen to itself for a beat.
  clearTimeout(window.readerOffer);
  const offer = $('readerBody').querySelector('.rd-offer');
  if (offer) {
    if (reducedMotion()) offer.hidden = false;
    else window.readerOffer = setTimeout(() => { offer.hidden = false; offer.classList.add('in'); }, 2600);
  }
}
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function relatedArticles(a) {
  const t = topicFor(a); if (!t) return '';
  const list = articlesFor([t]).slice(0, 2); if (!list.length) return '';
  return `<div class="relatedblock"><p class="partlabel">${icon('book')}From ExploraSelf · goes deeper</p>${list.map((r) => `<a class="relatedrow" href="https://exploraself.com/resources/${esc(r.slug)}" target="_blank" rel="noopener"><span><strong>${esc(r.title)}</strong><small>${esc(r.dek)}</small></span><em>${r.minutes} min ↗</em></a>`).join('')}</div>`;
}
function topicTeaser(a) {
  const t = topicFor(a); if (!t) return '';
  const o = teaserFor(t); const full = assessments.find((x) => x.name === o.name) || o;
  return banner({ ...full, url: o.url, label: o.label, price: o.price }, 'strip');
}

// ── Fetching: three shards in parallel, merged here ──────────────────────────

async function shard(s) {
  try {
    const r = await fetch(`/api/news?s=${s}`, { cache: 'no-store', signal: AbortSignal.timeout(28000) });
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j.articles) ? j : null;
  } catch { return null; }
}
async function refresh() {
  if (busy) return;
  busy = true; $('refresh').disabled = true; updateFreshness();
  try {
    const parts = (await Promise.all([1, 2, 3].map(shard))).filter(Boolean);
    if (!parts.length) throw Error('Unavailable');
    let articles = dedupe(parts.flatMap((p) => p.articles));
    let sources = parts.flatMap((p) => p.sources || []);

    // Only if a domain came up empty do we ask the Google News safety net.
    const thin = domains.filter((d) => articles.filter((a) => a.domain === d).length < PER_DOMAIN);
    if (thin.length) {
      const fill = await shard(4);
      if (fill) { articles = dedupe([...articles, ...fill.articles]); sources = [...sources, ...(fill.sources || [])]; }
    }

    data = { fetchedAt: new Date().toISOString(), refreshHours: 3, sources, articles };
    try { localStorage.setItem('broadcast-v3-edition', JSON.stringify(data)); } catch { /* private mode */ }
    render();
  } catch {
    if (data) { data.stale = true; render(); }
    else {
      $('notice').hidden = false;
      $('notice').textContent = 'Publisher feeds are temporarily unavailable. Please refresh to try again.';
      $('screen').innerHTML = empty('Your next edition is on its way.', 'You can still explore the free tools and set your preferences.');
    }
  } finally { busy = false; $('refresh').disabled = false; updateFreshness(); }
}

// ── Events ───────────────────────────────────────────────────────────────────

document.addEventListener('click', (e) => {
  const b = e.target.closest('button,a');
  if (!b) return;
  if (b.dataset.reveal) {
    const body = $('readerBody');
    const step = b.dataset.reveal;
    b.closest('.rd-offer, .rd-offer2')?.remove();
    const panel = body.querySelector(step === 'means' ? '.rd-means' : '.rd-move');
    if (panel) { panel.hidden = false; panel.classList.add('in'); panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' }); }
    // Everything else waits until they have actually gone deeper.
    if (step === 'move') { const tail = body.querySelector('.rd-tail'); if (tail) { tail.hidden = false; tail.classList.add('in'); } }
    return;
  }
  if (b.dataset.article) { article(b.dataset.article); return; }
  if (b.dataset.view) { navigate(b.dataset.view); return; }
  if (b.dataset.domain) { domain = b.dataset.domain; limit = 12; render(); return; }
  if (b.dataset.browse) { view = 'Latest'; domain = b.dataset.browse; limit = 12; render(); window.scrollTo({ top: 0 }); return; }
  if (b.dataset.save) {
    const a = [...(data?.articles || []), ...bookmarks].find((x) => x.id === b.dataset.save);
    if (!a) return;
    const saved = isSaved(a.id);
    bookmarks = saved ? bookmarks.filter((x) => x.id !== a.id) : [a, ...bookmarks];
    persist();
    if ($('reader').open) {
      b.setAttribute('aria-pressed', String(!saved));
      b.setAttribute('aria-label', (!saved ? 'Remove bookmark: ' : 'Bookmark: ') + a.title);
      const s = b.querySelector('span'); if (s) s.textContent = saved ? 'Save article' : 'Saved';
    } else render();
    toast(saved ? 'Removed from saved stories' : 'Saved for a little later');
    return;
  }
  if (b.dataset.industry) { prefs.industry = b.dataset.industry; prefs.askedIndustry = true; persist(); render(); toast(`Reading through ${prefs.industry}`); return; }
  if (b.hasAttribute('data-askindustry')) { prefs.industry = ''; prefs.askedIndustry = false; persist(); render(); return; }
  if (b.hasAttribute('data-skipindustry')) { prefs.askedIndustry = true; persist(); render(); return; }
  if (b.hasAttribute('data-install')) { install(); return; }
  if (b.classList.contains('close')) b.closest('dialog').close();
  if (b.id === 'refresh') refresh();
  if (b.id === 'loadmore') { limit += 12; render(); }
  if (b.id === 'downloadReport') downloadReport();
});

function downloadReport() {
  const src = $('screen');
  const content = src.cloneNode(true);
  content.querySelectorAll('.newsletter,.rpt-actions,.bn,.indpick,.indline,.bookmark,.st-foot,.rm-side').forEach((x) => x.remove());
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>The Leader’s Intelligence Report — ExploraSelf</title><style>
body{max-width:780px;margin:40px auto;padding:20px;font:16px/1.7 Georgia,serif;color:#01233B;background:#FBF7EE}
h2{font-size:34px;line-height:1.1}h3{font-size:24px}.eyebrow,.partlabel{color:#7A5C16;font:12px/1.5 Arial;letter-spacing:1.5px;text-transform:uppercase}
.chapter{border-top:1px solid #C9A24A;padding:22px 0}.quads,.ch-grid{display:block}.quad,.story{border:1px solid #E4D9BF;padding:16px;margin:12px 0;display:block}
.part{margin:12px 0}.moveask{font-style:italic}svg{display:none}a{color:#01233B}
</style>${content.innerHTML}</html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'ExploraSelf-Leaders-Intelligence-Report.html'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Report saved. No email required.');
}

document.addEventListener('input', (e) => {
  if (e.target.id !== 'search') return;
  const pos = e.target.selectionStart;
  query = e.target.value;
  render();
  const input = $('search');
  if (input) { input.focus(); if (typeof input.setSelectionRange === 'function' && pos !== null) input.setSelectionRange(pos, pos); }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  let k, val;
  if (el.dataset.prefDomain) { k = 'domains'; val = el.dataset.prefDomain; }
  if (el.dataset.prefTopic) { k = 'topics'; val = el.dataset.prefTopic; }
  if (el.dataset.prefSource) { k = 'sources'; val = el.dataset.prefSource; }
  if (k) { prefs[k] = el.checked ? [...new Set([...prefs[k], val])] : prefs[k].filter((x) => x !== val); persist(); toast('Preferences saved on this device'); }
  if (el.id === 'textsize') { prefs.large = el.value === 'large'; persist(); document.body.classList.toggle('large-text', prefs.large); }
});

// Public audience form identifiers are not API credentials. No server API key is shipped.
// Mailchimp handles validation and confirmation on its own page. No success is asserted here.
const MC = {
  base: 'https://exploraselfmba.us8.list-manage.com/subscribe/post?u=ab5e056ba759e867cde44f4da&id=41448b6750',
  oneIdea: { fid: '005b1ae1f0', tag: '3359660' },   // Broadcast · one idea a week
  broadcast: { fid: '00541ae1f0', tag: '3359659' },  // Broadcast · general subscriber
};
document.addEventListener('submit', (e) => {
  const f = e.target;
  if (!(f instanceof HTMLFormElement) || !f.classList.contains('mcform')) return;
  e.preventDefault();
  const consent = f.querySelector('.mcconsent');
  if (consent && !consent.checked) return;
  const cfg = MC[f.dataset.mc] || MC.oneIdea;
  const email = f.querySelector('input[type=email]');
  if (!email || !email.value.trim()) return;
  const form = document.createElement('form');
  form.method = 'POST'; form.target = '_blank'; form.action = `${MC.base}&f_id=${cfg.fid}`;
  const add = (n, v) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.append(i); };
  add('EMAIL', email.value.trim());
  const first = f.querySelector('input[name=FNAME]');
  if (first && first.value.trim()) add('FNAME', first.value.trim());
  add('tags', cfg.tag);
  document.body.append(form); form.submit(); form.remove();
  toast('Continue on Mailchimp to confirm. Subscription is not yet verified.');
});

let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
async function install() {
  if (installPrompt) {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;
    if (choice.outcome === 'accepted') toast('Installation requested');
  } else $('installDialog').showModal();
}
window.addEventListener('appinstalled', () => toast('Broadcast installed'));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
document.addEventListener('visibilitychange', () => { if (!document.hidden && (!data || Date.now() - Date.parse(data.fetchedAt) >= 10800000)) refresh(); });
setInterval(refresh, 10800000);

$('editionDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
render(); refresh();
initWelcome({ getData: () => data, getEdition: () => editionList(), prefs, persist, render, openedCount: () => bookmarks.length });
