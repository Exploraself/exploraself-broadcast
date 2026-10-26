// Feeds escape their own markup. This file exists because we once shipped a
// decoder that stripped tags before resolving entities, so &lt;p&gt; became a
// literal <p> in the page with nothing left to remove it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/news.js';

// A feed that escapes its own markup — exactly what produced the stray <p>.
const ESCAPED = `<?xml version="1.0"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item>
<title>Incoming leader to walk away from top job as law firms face talent crisis</title>
<link>https://example.org/law</link>
<description>&lt;p&gt;The firm said the decision was &amp;ldquo;mutual&amp;rdquo;.&lt;/p&gt;&lt;p&gt;Partners had raised concerns for months about retention and pay.&lt;/p&gt;</description>
<content:encoded>&lt;p&gt;The firm said the decision was mutual, after months of concern.&lt;/p&gt;&lt;p&gt;Partners describe a market where juniors leave within two years, and where the cost of replacing them has started to show up in client fees.&lt;/p&gt;&lt;p&gt;A third of mid-sized firms report the same pattern, according to the survey published alongside the announcement this morning.&lt;/p&gt;</content:encoded>
<pubDate>Sun, 26 Oct 2026 08:00:00 GMT</pubDate></item></channel></rss>`;

test('escaped publisher markup never reaches the page as text', async () => {
  const of = globalThis.fetch, oc = globalThis.caches;
  globalThis.fetch = async () => new Response(ESCAPED, { status: 200 });
  globalThis.caches = { default: { match: async () => null, put: async () => {} } };
  const pending = [];
  try {
    const r = await onRequestGet({ request: new Request('https://b.example/api/news?s=1'), waitUntil: (p) => pending.push(p) });
    const { articles } = await r.json();
    const a = articles[0];
    for (const t of ['<p>', '</p>', '&lt;', '&gt;', '&amp;', '&ldquo;']) {
      assert.ok(!a.excerpt.includes(t), `excerpt still contains ${t}: ${a.excerpt}`);
      for (const para of a.body || []) assert.ok(!para.includes(t), `body still contains ${t}: ${para}`);
    }
    assert.equal(a.excerpt.startsWith('The firm said the decision was'), true);
    assert.ok(Array.isArray(a.body) && a.body.length >= 3, 'paragraph breaks are preserved');
    assert.ok(a.body.join(' ').length <= 1100, 'the syndicated body stays capped');
    assert.ok(a.excerpt.includes('\u201cmutual\u201d'), 'named entities become real characters');
    await Promise.all(pending);
  } finally { globalThis.fetch = of; globalThis.caches = oc; }
});
