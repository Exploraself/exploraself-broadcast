// Guardrails for the ExploraSelf Broadcast algorithm.
//
// AGENTS.md states the rules in plain language. This file makes them bite.
// Every assertion here protects something that is easy to "tidy up" without
// knowing why it exists — the free-tier CPU budget, the three-part story, the
// verbatim tools, the honesty rules, the consent boundary.
//
// If one of these fails, you have not found a bug in the test. You have
// changed the product. Read AGENTS.md, then decide deliberately.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHARDS, FILL, TOPICS, TOPIC_DOMAIN, MAX_ITEMS } from '../functions/api/news.js';
import { topics, industries, industryNames, industryGroups, tools, moveFor, whyLine, coverage } from '../exploraself-broadcast/content.js';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const app = read('../exploraself-broadcast/app.js');
const news = read('../functions/api/news.js');
const html = read('../exploraself-broadcast/index.html');
const DOMAINS = ['Self', 'People', 'Work', 'Business'];

// ── The free-tier budget ─────────────────────────────────────────────────────

test('the news endpoint stays sharded: Workers free allows 10ms of CPU per request', () => {
  assert.ok(SHARDS.length >= 3, 'at least three shards; merging them exceeds the CPU budget');
  for (const [i, shard] of SHARDS.entries()) {
    assert.ok(shard.length <= 12, `shard ${i + 1} has ${shard.length} feeds; keep it at or under 12`);
  }
  assert.ok(MAX_ITEMS <= 12, 'the per-feed item cap bounds the parsing work');
  assert.match(news, /MAX_XML\s*=\s*\d+/, 'the per-feed byte cap must stay');
});

test('scoring and selection stay in the browser, never in the Worker', () => {
  assert.doesNotMatch(news, /function score\b/, 'scoring belongs in app.js where CPU is free');
  assert.match(app, /function score\(/, 'app.js must own the scoring');
  assert.match(app, /PER_DOMAIN = 2\b/, 'the edition is two stories per domain');
});

test('each shard carries more feeds than the edition needs, so publishers can go dark', () => {
  const total = SHARDS.flat().length;
  assert.ok(total >= 24, `${total} feeds for 8 slots; the list is over-provisioned on purpose`);
});

test('every shard is reachable and the fill shard stays a safety net', () => {
  assert.match(news, /shard === 4 \? FILL/, 'shard 4 is the Google News safety net');
  assert.match(app, /if \(thin\.length\)/, 'the browser asks for it only when a domain came back empty');
  assert.ok(FILL.length === 4, 'one fill query per domain');
});

// ── Sources ──────────────────────────────────────────────────────────────────

test('every feed is a publisher URL over https, with unique ids', () => {
  const ids = new Set();
  for (const s of [...SHARDS.flat(), ...FILL]) {
    const [id, name, hint, weight, ...urls] = s;
    assert.ok(!ids.has(id), `duplicate source id ${id}`);
    ids.add(id);
    assert.ok(name && typeof name === 'string', `${id} needs a publisher name to credit`);
    assert.ok(DOMAINS.includes(hint), `${id} hint must be one of the four domains`);
    assert.ok(weight >= 1 && weight <= 3, `${id} weight must be 1..3`);
    assert.ok(urls.length >= 1, `${id} needs at least one URL`);
    for (const u of urls) assert.ok(u.startsWith('https://'), `${id} must use https`);
  }
});

test('we identify ourselves honestly and do not impersonate a browser', () => {
  assert.match(news, /ExploraSelfBroadcast\/[\d.]+/, 'the user agent names us');
  assert.match(news, /\+https:\/\/broadcast\.exploraself\.com/, 'and links to us');
  // A real browser UA would carry a rendering-engine token it has no right to.
  assert.doesNotMatch(news, /AppleWebKit|Gecko\/|Chrome\/\d|Safari\/\d/, 'no browser impersonation');
});

// ── Syndication, not republication ───────────────────────────────────────────

test('excerpts stay capped and the link to the publisher survives', () => {
  assert.match(news, /excerpt\.length > 220/, 'the 220-character card excerpt cap must stay');
  assert.match(app, /(?:Read|Continue) at \$\{esc\(a\.source\)\}/, 'the reader always links out to the publisher');
  assert.match(app, /sourcefine/, 'the note separating our prompt from the publisher must stay');
});

test('in-app reading uses only what the publisher syndicated', () => {
  // content:encoded is the publisher's own decision to syndicate. We never
  // fetch or scrape the article page, and we cap what we carry.
  assert.match(news, /MAX_BODY\s*=\s*\d+/, 'the syndicated body is capped');
  assert.match(news, /content:encoded/, 'we read the publisher-provided field');
  assert.doesNotMatch(news, /fetch\(\s*(?:a|article)\.url|fetch\(link/, 'never fetch the article page itself');
  assert.match(app, /rd-cont/, 'and say plainly that the full piece continues at the source');
});

test('nothing from a feed is rendered as markup', () => {
  // Feeds routinely escape their own HTML; everything is escaped on the way
  // out, and the decoder resolves entities before stripping tags so a literal
  // <p> can never survive into the page.
  assert.match(app, /a\.body\.map\(\(para\) => `<p>\$\{esc\(para\)\}<\/p>`\)/, 'syndicated paragraphs are escaped');
  assert.doesNotMatch(app, /innerHTML\s*=\s*[^;]*\ba\.(?:excerpt|body)\b(?![^;]*esc\()/, 'no unescaped feed text');
  assert.match(news, /function entities\(/, 'entities are decoded separately');
  const d = news.slice(news.indexOf('function decode(s)'), news.indexOf('function decodeBlocks'));
  assert.ok(d.indexOf('entities(t)') < d.indexOf("replace(/<[^>]+>/g"), 'entities are decoded before tags are stripped');
});

// ── Every story is told in three parts ───────────────────────────────────────

test('the card carries the news and one line, never a block of our commentary', () => {
  const card = app.slice(app.indexOf('function storyCard('), app.indexOf('/** A compact wire row'));
  assert.match(card, /st-excerpt/, 'the publisher excerpt is on the card');
  assert.match(card, /meansLine\(a\)/, 'and one line of what it means');
  assert.doesNotMatch(card, /moveBlock|st-read|readhead/, 'the tool and the headed read belong in the reader, not the scroll');
  const reader = app.slice(app.indexOf('function article(id)'), app.indexOf('function relatedArticles'));
  assert.match(reader, /meansBlock\(a\)/, 'the fuller read lives in the reader');
  assert.match(reader, /moveBlock\(a, true\)/, 'with the tool, and its provenance, once they have gone deeper');
});

test('each domain shows a wire list, so the edition reads as news', () => {
  assert.match(app, /function newsRow\(/);
  assert.match(app, /MORE_PER_DOMAIN = \d+/);
  const chapter = app.slice(app.indexOf('function chapter(d, i, block)'), app.indexOf('function todayReport()'));
  assert.match(chapter, /morelist/, 'the remaining headlines are listed under each domain');
  assert.doesNotMatch(chapter, /ch-q|Write one fact you can verify/, 'the reflection exercise was removed from the scroll on instruction');
});

test('a domain comes from the story topic, not from the feed that carried it', () => {
  for (const name of Object.keys(TOPICS)) {
    assert.ok(DOMAINS.includes(TOPIC_DOMAIN[name]), `topic "${name}" has no domain`);
  }
  for (const d of DOMAINS) {
    const n = Object.values(TOPIC_DOMAIN).filter((x) => x === d).length;
    assert.ok(n >= 3, `${d} has only ${n} topics; a quadrant with too few can come back empty`);
  }
});

// ── The tools are Alexandru's, verbatim ──────────────────────────────────────

test('every tool is a real entry from 99 Built to Lead', () => {
  const families = Object.keys(tools);
  assert.ok(families.length >= 5, 'one set per topic family');
  const seen = new Set();
  for (const fam of families) {
    assert.ok(tools[fam].length >= 3, `${fam} needs enough tools to vary`);
    for (const t of tools[fam]) {
      assert.match(t.n, /^[A-Z.]{3,10}$/, `tool name ${t.n} should be the guide's short name`);
      assert.ok(t.no >= 1 && t.no <= 100, `tool ${t.n} number ${t.no} is outside the guide`);
      assert.ok(!seen.has(t.no), `tool number ${t.no} used twice`);
      seen.add(t.no);
      assert.ok(t.line && t.line.length > 10, `tool ${t.n} needs its line from the guide`);
      assert.ok(t.ask && t.ask.trim().endsWith('?'), `tool ${t.n} must end on a question`);
    }
  }
});

test('the tool for a story is stable, so it never jumps between renders', () => {
  const a = moveFor('Economy', 'https://example.org/story-1');
  const b = moveFor('Economy', 'https://example.org/story-1');
  assert.deepEqual(a, b, 'moveFor must be deterministic for a given story');
  assert.ok(a && a.ask, 'and must always return a usable tool');
});

test('every topic family can speak to every industry', () => {
  assert.equal(coverage(), Object.keys(topics).length * Object.keys(industries).length);
  for (const industry of industryNames) {
    for (const topic of Object.keys(topics)) {
      const line = whyLine(topic, industry);
      assert.ok(line && line.length > 20, `no line for ${topic} / ${industry}`);
    }
  }
});

// ── Honesty ──────────────────────────────────────────────────────────────────

test('no invented social proof, scarcity or activity', () => {
  const files = { app, news, welcome: read('../exploraself-broadcast/welcome.js') };
  const banned = [
    /\bpeople are reading\b/i,
    /\bothers are (?:reading|viewing|looking)\b/i,
    /\breaders? (?:just|are) (?:joined|joining)\b/i,
    /\bonly \d+ (?:left|remaining|spots?|places?)\b/i,
    /\bselling fast\b/i,
    /\blast chance\b/i,
    /Math\.random\(\)[^;]{0,80}(?:reader|subscriber|viewer|spot|seat)/i,
  ];
  for (const [name, src] of Object.entries(files)) {
    for (const re of banned) {
      assert.doesNotMatch(src, re, `${name}: invented proof or scarcity — see AGENTS.md §7`);
    }
  }
});

test('urgency comes from a real mechanism', () => {
  const welcome = read('../exploraself-broadcast/welcome.js');
  assert.match(welcome, /function untilNext\(/, 'the countdown counts to the real next edition');
  assert.match(welcome, /refreshHours/, 'and uses the real refresh window');
  assert.match(welcome, /function unread\(/, 'the unread figure is counted, not invented');
});

test('no success is asserted that has not been verified', () => {
  assert.match(app, /Subscription is not yet verified/, 'Mailchimp confirms its own subscriptions');
  assert.doesNotMatch(app, /You(?:'| a)re subscribed|Subscription confirmed|Payment (?:received|successful)/i);
});

// ── Consent ──────────────────────────────────────────────────────────────────

test('reading never requires marketing consent, and the checkbox is separate', () => {
  const welcome = read('../exploraself-broadcast/welcome.js');
  assert.match(welcome, /class="mcconsent"(?![^>]*\brequired\b)/, 'the wall must not force marketing consent');
  assert.match(welcome, /Optional/i, 'and must say so');
  assert.match(app, /consent && !consent\.checked/, 'an unticked consent box blocks only the marketing submit');
});

test('the Mailchimp audience identifiers are fixed', () => {
  assert.ok(app.includes('exploraselfmba.us8.list-manage.com'), 'audience base URL');
  for (const id of ['005b1ae1f0', '00541ae1f0', '3359660', '3359659']) {
    assert.ok(app.includes(id), `Mailchimp identifier ${id} maps to a real audience; do not change it`);
  }
});

test('no secrets in the repo', () => {
  for (const [name, src] of Object.entries({ app, news })) {
    assert.doesNotMatch(src, /\b(?:api[_-]?key|secret|bearer|authorization)\s*[:=]\s*['"][A-Za-z0-9_\-]{12,}/i, `${name} looks like it carries a credential`);
  }
});

// ── Interface ────────────────────────────────────────────────────────────────

test('the industry picker is six groups and covers every industry exactly once', () => {
  assert.ok(industryGroups.length >= 4 && industryGroups.length <= 8, 'groups, not a flat list of thirty');
  const flat = industryGroups.flatMap((g) => g.items);
  assert.equal(flat.length, new Set(flat).size, 'an industry appears in one group only');
  assert.deepEqual([...flat].sort(), [...industryNames].sort(), 'every industry is reachable');
  assert.doesNotMatch(app, /industryNames\.map\(/, 'never render all thirty as a flat wall');
});

test('promotion is a banner, never a paragraph', () => {
  const css = read('../exploraself-broadcast/style.css');
  for (const size of ['band', 'tile', 'strip']) {
    assert.match(css, new RegExp(`\\.bn-${size}\\{`), `the bn-${size} banner size must stay styled`);
    // Either rendered through banner(p, size) or written out as bn-<size>.
    assert.ok(app.includes(`'${size}'`) || app.includes(`bn-${size}`), `the bn-${size} banner size must stay used`);
  }
  assert.match(app, /function banner\(/);
  assert.match(app, /bn-art/, 'a banner leads with artwork, not a paragraph');
  assert.doesNotMatch(app, /class="bn [^"]*"[^`]*<p>/, 'no body paragraph inside a banner');
  // One banner per five stories in the list view.
  assert.match(app, /i % 5 === 4/, 'at most one banner per five stories');
});

test('nothing stands between the reader and the first headline', () => {
  // The report bar and the perspectives row are both compact by design; the
  // old full-screen masthead and 2x2 hero were a wall.
  const today = app.slice(app.indexOf('function todayReport()'), app.indexOf('// ── Latest / Saved'));
  const first = today.indexOf('chapter(d, i,');
  assert.ok(first > 0, 'the chapters render');
  assert.ok(today.indexOf('bandBanner()') > first, 'the gold band comes after the news has started');
  assert.doesNotMatch(today, /industryPicker\(\)(?!\s*:\s*'')/, 'no picker is imposed before the news');
});

test('the Report is the home page and the grid holds', () => {
  assert.match(app, /function todayReport\(/);
  assert.match(app, /function perspectives\(/, 'the four perspectives are visible on arrival');
  assert.ok(app.includes("views = ['Today'"), 'Today is the first view');
  assert.ok(html.includes('reportbar'), 'the sticky bar stays');
  const css = read('../exploraself-broadcast/style.css');
  assert.match(css, /\.persp\{[^}]*repeat\(4,minmax\(0,1fr\)\)/, 'the four perspectives sit in one row');
  assert.match(css, /\.ch-grid,\.ch-foot\{[^}]*repeat\(2,minmax\(0,1fr\)\)/, 'full width or exactly half');
});

test('the triad is on the page', () => {
  assert.ok(html.includes('Inform.') && html.includes('Reform.') && html.includes('Transform.'));
  assert.match(app, /rb-triad/, 'and in the report bar');
});
