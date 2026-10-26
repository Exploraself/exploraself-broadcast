// ExploraSelf Broadcast — the arrival experience.
//
// The reader sees the news first. Then, once, an overlay: they pick their
// industry, three of today's real stories animate in with what each one means
// for that industry, it fades, and we ask them kindly to join.
//
// Nothing is asked on arrival. The reader gets the news.
//
// After a minute of actual reading we offer the four perspectives. After two,
// we offer the trade lens. After five, and only then, we ask for an email —
// kindly, and with a decline on every single step. There is no wall: Broadcast
// stays readable whatever they choose, because an offer a reader cannot refuse
// is not an offer.

import { industryGroups, whyLine, topicNames, overrides } from './content.js';
import { icon } from './icons.js';

const KEY = 'broadcast-welcome-v1';
const ASK_DOMAINS = 60;      // after a minute, offer the four perspectives
const ASK_INDUSTRY = 120;    // after two, offer the trade lens
const ASK_JOIN = 300;        // after five, and only then, ask for an email
const JOIN_AGAIN = 420;      // one more kind ask, then we stop asking forever
const MAX_ASKS = 2;

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } };

let state = Object.assign({ joined: false, readSeconds: 0, askedDomains: false, askedIndustry: false, joinAsks: 0, lastAskAt: 0, done: false }, load());
let ctx = null, el = null, ticking = false, stage = 'domains', shown = false;

/** The next edition really does replace this one. Say when, truthfully. */
function untilNext() {
  const d = ctx.getData();
  if (!d || !d.fetchedAt) return null;
  const left = Date.parse(d.fetchedAt) + (d.refreshHours || 3) * 3600000 - Date.now();
  if (!Number.isFinite(left) || left <= 0) return null;
  const h = Math.floor(left / 3600000), m = Math.round((left % 3600000) / 60000);
  return h ? `${h}h ${m}m` : `${m} minutes`;
}

/** How many of today's stories they have not opened yet. Counted, not invented. */
function unread() {
  const d = ctx.getData();
  if (!d) return 0;
  const seen = ctx.openedCount ? ctx.openedCount() : 0;
  return Math.max(0, Math.min(8, (d.articles || []).length) - seen);
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Three of today's real stories, one per domain where possible. */
function sample() {
  const source = ctx.getEdition ? ctx.getEdition() : (ctx.getData()?.articles || []);
  const list = source.filter((a) => (a.topics || []).some((t) => topicNames.includes(t)));
  const seen = new Set(), out = [];
  for (const a of list) {
    if (seen.has(a.domain)) continue;
    seen.add(a.domain); out.push(a);
    if (out.length === 3) break;
  }
  return out.length ? out : list.slice(0, 3);
}

function topicOf(a) {
  const list = (a.topics || []).filter((t) => topicNames.includes(t));
  return list.find((t) => overrides[t] && overrides[t][ctx.prefs.industry]) || list[0];
}

function domainsStage() {
  const names = { Self: 'Lead yourself', People: 'Lead people', Work: 'Rethink work', Business: 'Beyond business' };
  const lines = { Self: 'Clarity, judgement and the person deciding.', People: 'Teams, trust and the conversations that carry them.', Work: 'Technology, priorities and how the work actually gets done.', Business: 'Markets, customers and what is moving around you.' };
  const on = ctx.prefs.domains || [];
  return `<div class="wc-stage wc-domains">
    <p class="wc-eyebrow">${icon('compass')}A minute in</p>
    <h2>Four perspectives.<br>Which ones are <em>yours</em>?</h2>
    <p class="wc-lede">Every edition is read through these four. Keep all of them, or narrow it — you can change this whenever you like.</p>
    <div class="wc-domaingrid">${Object.keys(names).map((d) => `<button class="wc-domain${on.includes(d) ? ' on' : ''}" data-wc-domain="${d}"><span class="wd-top">${icon({ Self: 'self', People: 'people', Work: 'work', Business: 'business' }[d])}<em>${on.includes(d) ? 'Keeping' : 'Add'}</em></span><strong>${names[d]}</strong><small>${lines[d]}</small></button>`).join('')}</div>
    <button class="wc-go" data-wc-next>Keep reading →</button>
    <button class="wc-skip" data-wc-dismiss>Not now</button>
  </div>`;
}

function industryStage() {
  return `<div class="wc-stage wc-industry">
    <p class="wc-eyebrow">${icon('compass')}Before you read on</p>
    <h2>Everyone read the same headlines today.<br>Almost nobody worked out <em>what they meant</em>.</h2>
    <p class="wc-lede">Name the work you are in. Every story then tells you where that kind of news usually lands in your trade — the part the headline leaves out. Six groups, one choice.</p>
    <div class="indgroups">${industryGroups.map((g, i) => `<details class="indgroup"${i === 0 ? ' open' : ''}><summary>${esc(g.label)}<span>${g.items.length}</span></summary><div class="indchips">${g.items.map((n) => `<button class="indchip" data-wc-industry="${esc(n)}">${esc(n)}</button>`).join('')}</div></details>`).join('')}</div>
    <button class="wc-skip" data-wc-dismiss>Skip for now — I&rsquo;ll read as I am</button>
  </div>`;
}

function animationStage() {
  const stories = sample();
  if (!stories.length) return joinStage();
  const ind = ctx.prefs.industry;
  return `<div class="wc-stage wc-anim">
    <p class="wc-eyebrow">${icon('spark')}Today, through your lens${ind ? ' · ' + esc(ind) : ''}</p>
    ${stories.map((a, i) => {
      const t = topicOf(a);
      return `<div class="wc-item" style="--d:${i * 1.9}s">
        <span class="wc-domain">${esc(a.domain)}</span>
        <h3>${esc(a.title)}</h3>
        <p class="wc-why">${esc(t ? whyLine(t, ind) : '')}</p>
      </div>`;
    }).join('')}
    <div class="wc-progress" style="--total:${stories.length * 1.9 + 1.6}s"><i></i></div>
  </div>`;
}

function joinStage() {
  const ind = ctx.prefs.industry;
  const left = untilNext(), rest = unread();
  const lens = ind ? `read through ${esc(ind.toLowerCase())}` : 'read through your own trade';
  return `<div class="wc-stage wc-join">
    <p class="wc-eyebrow">${icon('clock')}This edition is not kept</p>
    <h2>${left ? `This edition is replaced in <em>${esc(left)}</em>.` : `Tomorrow&rsquo;s eight land in the morning.`}</h2>
    <p class="wc-lede">Broadcast keeps no back issues.${rest ? ` ${rest} ${rest === 1 ? 'story' : 'stories'} in today's edition you have not opened yet.` : ''} Tomorrow, eight more, ${lens} — five minutes, and you walk in knowing what moved.</p>
    <p class="wc-offer">${icon('book')}<span>Join and the whole free library opens now: <b>five assessments</b>, <b>every ebook and workbook</b>, and <b>one tool a week</b> from the field guide of 100.</span></p>
    <form class="wc-form mcform" data-mc="broadcast">
      <label class="wc-sr" for="wcName">First name</label>
      <input id="wcName" name="FNAME" type="text" autocomplete="given-name" placeholder="First name" required>
      <label class="wc-sr" for="wcEmail">Email address</label>
      <input id="wcEmail" type="email" autocomplete="email" placeholder="Your email address" required>
      <button class="wc-go" type="submit">Send me the library →</button>
      <label class="wc-consent"><input type="checkbox" class="mcconsent"><span>Also send me the weekly ExploraSelf ideas. Optional, and you can stop any time.</span></label>
      <p class="wc-fine">Mailchimp (Intuit) processes them. <a href="https://exploraself.com/privacy" target="_blank" rel="noopener">Privacy policy</a>.</p>
    </form>
    ${hard ? '' : '<button class="wc-skip" data-wc-later>No thank you — let me keep reading</button>'}
  </div>`;
}

function paint() {
  const body = el.querySelector('.wc-body');
  body.innerHTML = stage === 'domains' ? domainsStage() : stage === 'industry' ? industryStage() : stage === 'anim' ? animationStage() : joinStage();
  // The close button is always there. There is no stage you cannot leave, and
  // there is one at the foot too, so nobody has to scroll back up to escape.
  const close = el.querySelector('.wc-close');
  if (close) close.hidden = false;
  const stageEl = body.querySelector('.wc-stage');
  if (stageEl && !stageEl.querySelector('.footclose')) {
    const b = document.createElement('button');
    b.className = 'footclose wc-close';
    b.innerHTML = '<span aria-hidden="true">×</span><span>Close and keep reading</span>';
    stageEl.append(b);
  }
  if (stage === 'anim') {
    const ms = (sample().length * 1.9 + 1.6) * 1000;
    clearTimeout(el._t);
    el._t = setTimeout(() => { stage = 'join'; paint(); }, reduced() ? 900 : ms);
  }
}

const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function open(which) {
  if (state.joined || state.done || shown) return;
  stage = which;
  shown = true;
  paint();
  if (!el.open) el.showModal();
  state.lastAskAt = state.readSeconds; save(state);
}

function close() {
  shown = false;
  clearTimeout(el._t);
  if (el.open) el.close();
}

/** Whatever they just declined, we do not ask for again in that form. */
function record() {
  if (stage === 'domains') state.askedDomains = true;
  if (stage === 'industry' || stage === 'anim') state.askedIndustry = true;
  if (stage === 'join') state.joinAsks = (state.joinAsks || 0) + 1;
  if (state.joinAsks >= MAX_ASKS) state.done = true;
  state.lastAskAt = state.readSeconds;
  save(state);
}

/** Counts reading time only while the tab is actually visible. */
function tick() {
  if (ticking) return;
  ticking = true;
  setInterval(() => {
    if (document.visibilityState !== 'visible' || state.joined) return;
    state.readSeconds += 1;
    if (state.readSeconds % 10 === 0) save(state);
    if (shown) return;
    const t = state.readSeconds;
    // News first. Then, slowly, three offers — each one declinable.
    if (!state.askedDomains && t >= ASK_DOMAINS) open('domains');
    else if (!state.askedIndustry && !ctx.prefs.industry && t >= ASK_INDUSTRY) open('industry');
    else if (state.joinAsks < MAX_ASKS && t >= (state.joinAsks ? JOIN_AGAIN : ASK_JOIN) && t - state.lastAskAt >= 90) open('join');
  }, 1000);
}

/** Open the trade chooser on demand, from anywhere in the app. */
export function openIndustry() {
  if (!el) return false;
  shown = true;
  stage = 'industry';
  paint();
  if (!el.open) el.showModal();
  return true;
}

export function initWelcome(context) {
  ctx = context;
  // The dialog is built even for a reader who has joined, because the trade
  // chooser is reachable from the story reader at any time.
  el = document.createElement('dialog');
  el.id = 'welcome';
  el.innerHTML = '<button class="wc-close" aria-label="Close">×</button><div class="wc-body"></div>';
  document.body.append(el);

  el.addEventListener('cancel', () => { record(); close(); });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('wc-close')) { record(); return close(); }
    if (b.dataset.wcDomain) {
      const d = b.dataset.wcDomain, list = ctx.prefs.domains || [];
      ctx.prefs.domains = list.includes(d) ? list.filter((x) => x !== d) : [...list, d];
      if (!ctx.prefs.domains.length) ctx.prefs.domains = [d];
      ctx.persist(); ctx.render(); paint(); return;
    }
    if (b.hasAttribute('data-wc-next') || b.hasAttribute('data-wc-dismiss')) { record(); return close(); }
    if (b.dataset.wcIndustry) {
      ctx.prefs.industry = b.dataset.wcIndustry;
      state.askedIndustry = true; save(state);
      ctx.persist(); ctx.render();
      // Asked for on purpose from inside the app: confirm and get out of the
      // way. The arrival animation belongs to arrival only.
      if (state.joined || state.done) { record(); return close(); }
      stage = 'anim'; paint(); return;
    }
    if (b.hasAttribute('data-wc-later')) { record(); return close(); }
  });

  // The shared .mcform handler in app.js does the Mailchimp submit; we only
  // record that they joined and get out of their way.
  el.addEventListener('submit', () => {
    state.joined = true; state.done = true; save(state);
    setTimeout(close, 400);
  });

  tick();
}
