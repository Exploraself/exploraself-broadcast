const TTL=10800;
const sources=[
 ['guardian-self','The Guardian','Self','https://www.theguardian.com/science/psychology/rss'],
 ['guardian-people','The Guardian','People','https://www.theguardian.com/money/work-and-careers/rss'],
 ['bbc-tech','BBC News','Work','https://feeds.bbci.co.uk/news/technology/rss.xml'],
 ['bbc-business','BBC News','Business','https://feeds.bbci.co.uk/news/business/rss.xml']
];
const TOPICS={'Decision-making':[/(?:^|\W)decision\w*\b/i,/(?:^|\W)judg(?:e)?ment\w*\b/i,/(?:^|\W)think\w*\b/i,/(?:^|\W)brain\w*\b/i,/(?:^|\W)psycholog\w*\b/i,/(?:^|\W)creativ\w*\b/i],'Leadership':[/(?:^|\W)leader\w*\b/i,/(?:^|\W)manager\w*\b/i,/(?:^|\W)boss\w*\b/i,/(?:^|\W)executive\w*\b/i],'Team & culture':[/(?:^|\W)team\w*\b/i,/(?:^|\W)worker\w*\b/i,/(?:^|\W)workplace\w*\b/i,/(?:^|\W)staff\b/i,/(?:^|\W)employee\w*\b/i,/(?:^|\W)career\w*\b/i,/(?:^|\W)job\w*\b/i,/(?:^|\W)leave\b/i,/(?:^|\W)work\b/i],'AI & technology':[/(?:^|\W)AI(?:\W|$)/i,/(?:^|\W)artificial intelligence\b/i,/(?:^|\W)technolog\w*\b/i,/(?:^|\W)tech\b/i,/(?:^|\W)digital\b/i,/(?:^|\W)robot\w*\b/i,/(?:^|\W)software\b/i,/(?:^|\W)chip\w*\b/i],'Growth & customers':[/(?:^|\W)customer\w*\b/i,/(?:^|\W)sales\b/i,/(?:^|\W)brand\w*\b/i,/(?:^|\W)consumer\w*\b/i,/(?:^|\W)retail\w*\b/i,/(?:^|\W)growth\b/i,/(?:^|\W)business\w*\b/i],'Economy':[/(?:^|\W)budget\w*\b/i,/(?:^|\W)tax(?:es|ation)?\b/i,/(?:^|\W)econom\w*\b/i,/(?:^|\W)inflation\b/i,/(?:^|\W)interest rates?\b/i,/(?:^|\W)market\w*\b/i,/(?:^|\W)trade\b/i,/(?:^|\W)bank\w*\b/i]};
function decode(s){return String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[n])).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function field(item,tag){return decode(item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,'i'))?.[1]);}
function parse(xml,source){const [id,name,domain,url]=source;const articles=[];for(const match of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)){
 const item=match[1],title=field(item,'title'),link=field(item,'link');if(!title||!link.startsWith('https://'))continue;
 let excerpt=field(item,'description').replace(/Continue reading.*/i,'').trim();if(excerpt.length>220)excerpt=excerpt.slice(0,220).replace(/\s+\S*$/,'')+'…';
 const date=Date.parse(field(item,'pubDate')),image=item.match(/<(?:media:thumbnail|media:content)[^>]*\surl=["'](https:\/\/[^"']+)["']/i)?.[1]||null;
 const hay=title+' '+excerpt;let topics=Object.entries(TOPICS).filter(([,patterns])=>patterns.some(pattern=>pattern.test(hay))).map(([name])=>name);
 if(!topics.length)topics=[{Self:'Decision-making',People:'Team & culture',Work:'AI & technology',Business:'Economy'}[domain]];
 articles.push({id:link.split('?')[0],url:link,title,excerpt,publishedAt:Number.isFinite(date)?new Date(date).toISOString():null,image,domain,source:name,sourceId:id,topics});if(articles.length>=18)break;
 }if(!articles.length)throw Error('No readable items');return articles;}
export async function onRequestGet({request,waitUntil}){
 const key=new Request(new URL('/api/news',request.url),{method:'GET'}),cache=caches.default;
 const cached=await cache.match(key);if(cached)return cached;
 const results=await Promise.all(sources.map(async source=>{try{const r=await fetch(source[3],{headers:{'User-Agent':'ExploraSelfBroadcast/1.0 RSS reader'}});if(!r.ok)throw Error('Feed unavailable');const xml=await r.text();return {status:{id:source[0],name:source[1],domain:source[2],url:source[3],ok:true},articles:parse(xml,source)};}catch{return {status:{id:source[0],name:source[1],domain:source[2],url:source[3],ok:false,error:'Feed temporarily unavailable'},articles:[]};}}));
 const payload={fetchedAt:new Date().toISOString(),sources:results.map(r=>r.status),articles:results.flatMap(r=>r.articles),refreshHours:3};
 const response=new Response(JSON.stringify(payload),{status:payload.articles.length?200:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':payload.articles.length?`public, max-age=0, s-maxage=${TTL}`:'no-store','X-Content-Type-Options':'nosniff'}});
 if(payload.articles.length)waitUntil(cache.put(key,response.clone()));return response;
}
