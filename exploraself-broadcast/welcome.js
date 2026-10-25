// ExploraSelf Broadcast — the arrival experience.
//
// The reader sees the news first. Then, once, an overlay: they pick their
// industry, three of today's real stories animate in with what each one means
// for that industry, it fades, and we ask them kindly to join.
//
// "Not yet" is respected. We wait five minutes of actual reading before asking
// again, and at eight minutes the ask becomes a wall.
//
// The wall asks for a name and an email to keep reading. That is a fair
// exchange. Marketing consent stays a SEPARATE, UNTICKED box, because consent
// has to be freely given — tying it to access would not be.
//
// The gate is client-side, so it is a courtesy, not security. It keeps honest
// readers in the habit; it will not stop anyone determined.

import { industryNames, whyLine, topicNames, overrides } from './content.js';
import { icon } from './icons.js';

const KEY = 'broadcast-welcome-v1';
const SOFT_AGAIN = 5 * 60;   // ask again after five minutes of reading
const HARD_WALL = 8 * 60;    // after eight, the ask becomes a wall
const FIRST_DELAY = 6;       // let them read for six seconds before we appear

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ } };

let state = Object.assign({ joined: false, seen: false, readSeconds: 0, lastAskAt: 0 }, load());
let ctx = null, el = null, ticking = false, stage = 'industry', shown = false;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Three of today's real stories, one per domain where possible. */
function sample() {
  const list = (ctx.getData()?.articles || []).filter((a) => (a.topics || []).some((t) => topicNames.includes(t)));
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

function industryStage() {
  return `<div class="wc-stage wc-industry">
    <p class="wc-eyebrow">${icon('compass')}Welcome to Broadcast</p>
    <h2>The news is the easy part.<br>What it means for <em>you</em> is not.</h2>
    <p class="wc-lede">Tell us the work you are in. Every story will then say where that kind of news usually lands in your trade.</p>
    <div class="wc-chips">${industryNames.map((n) => `<button class="wc-chip" data-wc-industry="${esc(n)}">${esc(n)}</button>`).join('')}</div>
    <button class="wc-skip" data-wc-skip>Skip for now</button>
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

function joinStage(hard = false) {
  const ind = ctx.prefs.industry;
  return `<div class="wc-stage wc-join">
    <p class="wc-eyebrow">${icon('compass')}${hard ? 'Keep reading' : 'One last thing'}</p>
    <h2>${hard ? 'You have read a while. Make it yours.' : 'Tomorrow morning, eight stories.<br>And what each one means for you.'}</h2>
    <p class="wc-lede">${ind
      ? `Two from each domain, every day, read through ${esc(ind.toLowerCase())}. Five minutes, and you walk in knowing what moved.`
      : 'Two stories from each of the four domains, every day. Five minutes, and you walk in knowing what moved.'}</p>
    <form class="wc-form mcform" data-mc="broadcast">
      <label class="wc-sr" for="wcName">First name</label>
      <input id="wcName" name="FNAME" type="text" autocomplete="given-name" placeholder="First name" required>
      <label class="wc-sr" for="wcEmail">Email address</label>
      <input id="wcEmail" type="email" autocomplete="email" placeholder="Your email address" required>
      <button class="wc-go" type="submit">Join Broadcast →</button>
      <label class="wc-consent"><input type="checkbox" class="mcconsent"><span>Also send me the weekly ExploraSelf ideas. Optional, and you can stop any time.</span></label>
      <p class="wc-fine">${hard ? 'Your name and email keep Broadcast free to read. ' : ''}Mailchimp (Intuit) processes them. <a href="https://exploraself.com/privacy" target="_blank" rel="noopener">Privacy policy</a>.</p>
    </form>
    ${hard ? '' : '<button class="wc-skip" data-wc-later>Not yet, let me read</button>'}
  </div>`;
}

function paint() {
  const body = el.querySelector('.wc-body');
  body.innerHTML = stage === 'industry' ? industryStage() : stage === 'anim' ? animationStage() : joinStage(stage === 'hard');
  el.classList.toggle('hardwall', stage === 'hard');
  const close = el.querySelector('.wc-close');
  if (close) close.hidden = stage === 'hard';
  if (stage === 'anim') {
    const ms = (sample().length * 1.9 + 1.6) * 1000;
    clearTimeout(el._t);
    el._t = setTimeout(() => { stage = 'join'; paint(); }, reduced() ? 900 : ms);
  }
}

const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function open(which) {
  if (state.joined || shown) return;
  stage = which;
  shown = true;
  paint();
  if (!el.open) el.showModal();
  state.seen = true; state.lastAskAt = state.readSeconds; save(state);
}

function close() {
  shown = false;
  clearTimeout(el._t);
  if (el.open) el.close();
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
    if (state.readSeconds >= HARD_WALL) open('hard');
    else if (state.seen && state.readSeconds - state.lastAskAt >= SOFT_AGAIN) open('join');
    else if (!state.seen && state.readSeconds >= FIRST_DELAY) open(ctx.prefs.industry ? 'anim' : 'industry');
  }, 1000);
}

export function initWelcome(context) {
  ctx = context;
  if (state.joined) return;
  el = document.createElement('dialog');
  el.id = 'welcome';
  el.innerHTML = '<button class="wc-close" aria-label="Close">×</button><div class="wc-body"></div>';
  document.body.append(el);

  el.addEventListener('cancel', (e) => { if (stage === 'hard') e.preventDefault(); else close(); });
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('wc-close') && stage !== 'hard') return close();
    if (b.dataset.wcIndustry) {
      ctx.prefs.industry = b.dataset.wcIndustry;
      ctx.persist(); ctx.render();
      stage = 'anim'; paint(); return;
    }
    if (b.hasAttribute('data-wc-skip')) { stage = 'anim'; paint(); return; }
    if (b.hasAttribute('data-wc-later')) return close();
  });

  // The shared .mcform handler in app.js does the Mailchimp submit; we only
  // record that they joined and get out of their way.
  el.addEventListener('submit', () => {
    state.joined = true; save(state);
    setTimeout(close, 400);
  });

  tick();
}
