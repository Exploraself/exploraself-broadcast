import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/api/news.js';

test('Cloudflare feed endpoint yields linked, dated publisher items in all four domains',async()=>{
 const originalFetch=globalThis.fetch, originalCaches=globalThis.caches;
 const xml=`<?xml version="1.0"?><rss><channel><item><title><![CDATA[Leaders & teams rethink customer trust]]></title><link>https://example.org/story?ref=rss</link><description><![CDATA[<p>Useful context for a business decision.</p>]]></description><pubDate>Sun, 25 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`;
 globalThis.fetch=async()=>new Response(xml,{status:200});
 globalThis.caches={default:{match:async()=>null,put:async()=>{}}};
 try{
  const pending=[],response=await onRequestGet({request:new Request('https://broadcast.example/api/news'),waitUntil:p=>pending.push(p)});
  assert.equal(response.status,200);
  const body=await response.json();assert.equal(body.articles.length,4);
  assert.deepEqual(new Set(body.articles.map(a=>a.domain)),new Set(['Self','People','Work','Business']));
  for(const article of body.articles){assert.equal(article.url,'https://example.org/story?ref=rss');assert.equal(article.excerpt,'Useful context for a business decision.');assert.equal(article.publishedAt,'2026-10-25T12:00:00.000Z');}
  await Promise.all(pending);
 }finally{globalThis.fetch=originalFetch;globalThis.caches=originalCaches;}
});
