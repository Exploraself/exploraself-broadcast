import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, SHARDS } from '../functions/api/news.js';

const RSS = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[Leaders & teams rethink customer trust]]></title><link>https://example.org/story?ref=rss</link><description><![CDATA[<p>Useful context for a business decision that runs long enough to survive the minimum-length filter.</p>]]></description><pubDate>Sun, 25 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Shoppers cut spending as retail demand softens</title><link rel="alternate" href="https://example.net/atom-story"/><summary>An academic desk explains what the shift in consumer demand means in practice for operators.</summary><published>2026-10-25T09:30:00Z</published></entry></feed>`;

async function call(url, fetcher) {
  const originalFetch = globalThis.fetch, originalCaches = globalThis.caches;
  globalThis.fetch = fetcher;
  globalThis.caches = { default: { match: async () => null, put: async () => {} } };
  const pending = [];
  try {
    const response = await onRequestGet({ request: new Request(url), waitUntil: (p) => pending.push(p) });
    const body = response.status === 200 ? await response.json() : null;
    await Promise.all(pending);
    return { response, body };
  } finally { globalThis.fetch = originalFetch; globalThis.caches = originalCaches; }
}

test('a shard returns linked, dated publisher items', async () => {
  const { response, body } = await call('https://broadcast.example/api/news?s=1', async () => new Response(RSS, { status: 200 }));
  assert.equal(response.status, 200);
  assert.equal(body.shard, 1);
  assert.equal(body.articles.length, SHARDS[0].length, 'one item per feed in the shard');
  for (const a of body.articles) {
    assert.equal(a.url, 'https://example.org/story?ref=rss');
    assert.equal(a.id, 'https://example.org/story');
    assert.equal(a.publishedAt, '2026-10-25T12:00:00.000Z');
    assert.ok(a.excerpt.startsWith('Useful context'));
    assert.ok(a.excerpt.length <= 221, 'excerpts stay capped');
    assert.ok(a.source && a.weight >= 1, 'the publisher is credited and weighted');
  }
});

test('the domain follows the story topic, not the feed that carried it', async () => {
  // Every feed in shard 1 serves the same leadership story, so every article
  // must land in Self even though several of those feeds are business desks.
  const { body } = await call('https://broadcast.example/api/news?s=1', async () => new Response(RSS, { status: 200 }));
  assert.deepEqual(new Set(body.articles.map((a) => a.domain)), new Set(['Self']));
  assert.ok(body.articles[0].topics.includes('Leadership'));
});

test('Atom feeds parse alongside RSS', async () => {
  const { body } = await call('https://broadcast.example/api/news?s=2', async () => new Response(ATOM, { status: 200 }));
  const a = body.articles[0];
  assert.equal(a.url, 'https://example.net/atom-story', 'the Atom link lives in an attribute');
  assert.equal(a.publishedAt, '2026-10-25T09:30:00.000Z');
  assert.ok(a.excerpt.startsWith('An academic desk'));
  // Where a story matches several topics, the first in TOPICS declaration
  // order decides the domain. Keep fixtures unambiguous.
  assert.equal(a.domain, 'Business', 'consumer demand is a Business topic');
});

test('each shard is cached under its own key', async () => {
  const keys = [];
  const originalFetch = globalThis.fetch, originalCaches = globalThis.caches;
  globalThis.fetch = async () => new Response(RSS, { status: 200 });
  globalThis.caches = { default: { match: async () => null, put: async (k) => { keys.push(new URL(k.url).search); } } };
  const pending = [];
  try {
    for (const s of [1, 2, 3]) {
      await onRequestGet({ request: new Request(`https://broadcast.example/api/news?s=${s}`), waitUntil: (p) => pending.push(p) });
    }
    await Promise.all(pending);
  } finally { globalThis.fetch = originalFetch; globalThis.caches = originalCaches; }
  assert.deepEqual(keys, ['?s=1', '?s=2', '?s=3'], 'one cache entry per shard');
});

test('an alternate URL is tried when a publisher feed refuses', async () => {
  const tried = [];
  const { body } = await call('https://broadcast.example/api/news?s=1', async (url) => {
    tried.push(url);
    // The first HBR address refuses; the alternate answers.
    if (url.includes('harvardbusiness?format=xml')) return new Response('nope', { status: 403 });
    return new Response(RSS, { status: 200 });
  });
  assert.ok(tried.some((u) => u.includes('harvardbusiness?format=xml')), 'the first address is tried');
  assert.ok(tried.some((u) => u === 'https://feeds.hbr.org/harvardbusiness'), 'then the alternate');
  const hbr = body.sources.find((s) => s.id === 'hbr');
  assert.equal(hbr.ok, true, 'the publisher survives one refusal');
});

test('a feed that refuses every address degrades instead of breaking the edition', async () => {
  const { response, body } = await call('https://broadcast.example/api/news?s=1', async (url) =>
    url.includes('hbr.org') ? new Response('nope', { status: 403 }) : new Response(RSS, { status: 200 }));
  assert.equal(response.status, 200, 'the edition still ships');
  const hbr = body.sources.find((s) => s.id === 'hbr');
  assert.equal(hbr.ok, false);
  assert.equal(hbr.error, 'Feed temporarily unavailable');
  assert.ok(body.articles.length >= SHARDS[0].length - 1, 'the other publishers still deliver');
});

test('an unreadable shard reports 503 rather than an empty edition', async () => {
  const { response } = await call('https://broadcast.example/api/news?s=3', async () => new Response('', { status: 500 }));
  assert.equal(response.status, 503);
});

test('the shard parameter is validated', async () => {
  const { body } = await call('https://broadcast.example/api/news?s=../../etc', async () => new Response(RSS, { status: 200 }));
  assert.equal(body.shard, 1, 'anything unexpected falls back to the first shard');
});
