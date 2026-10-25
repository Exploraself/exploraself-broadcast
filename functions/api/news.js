const TTL=10800;
const sources=[
 ['guardian-self','The Guardian','Self','https://www.theguardian.com/science/psychology/rss'],
 ['guardian-people','The Guardian','People','https://www.theguardian.com/money/work-and-careers/rss'],
 ['bbc-tech','BBC News','Work','https://feeds.bbci.co.uk/news/technology/rss.xml'],
 ['bbc-business','BBC News','Business','https://feeds.bbci.co.uk/news/business/rss.xml'],
 ['guardian-smallbiz','The Guardian','Business','https://www.theguardian.com/business/smallbusiness/rss']
];
const TOPICS={
 'Decision-making':[/(?:^|\W)decision\w*\b/i,/(?:^|\W)judg(?:e)?ment\w*\b/i,/(?:^|\W)think\w*\b/i,/(?:^|\W)brain\w*\b/i,/(?:^|\W)psycholog\w*\b/i,/(?:^|\W)creativ\w*\b/i,/(?:^|\W)bias(?:ed|es)?\b/i],
 'Leadership':[/(?:^|\W)leader\w*\b/i,/(?:^|\W)manager\w*\b/i,/(?:^|\W)boss\w*\b/i,/(?:^|\W)executive\w*\b/i,/(?:^|\W)chief exec\w*\b/i,/(?:^|\W)founder\w*\b/i,/(?:^|\W)board\b/i],
 'Burnout & wellbeing':[/(?:^|\W)burnout\b/i,/(?:^|\W)stress\w*\b/i,/(?:^|\W)wellbeing\b/i,/(?:^|\W)mental health\b/i,/(?:^|\W)sleep\w*\b/i,/(?:^|\W)exhaust\w*\b/i],
 'Reputation & trust':[/(?:^|\W)reputation\w*\b/i,/(?:^|\W)trust\w*\b/i,/(?:^|\W)scandal\w*\b/i,/(?:^|\W)apolog\w*\b/i,/(?:^|\W)backlash\b/i,/(?:^|\W)boycott\w*\b/i],
 'Team & culture':[/(?:^|\W)team\w*\b/i,/(?:^|\W)workplace\w*\b/i,/(?:^|\W)staff\b/i,/(?:^|\W)employee\w*\b/i,/(?:^|\W)culture\b/i,/(?:^|\W)morale\b/i,/(?:^|\W)union\w*\b/i],
 'Hiring & talent':[/(?:^|\W)hir(?:e|ing|ed)\b/i,/(?:^|\W)recruit\w*\b/i,/(?:^|\W)vacanc\w*\b/i,/(?:^|\W)talent\b/i,/(?:^|\W)shortage\w*\b/i,/(?:^|\W)apprentice\w*\b/i],
 'Jobs & careers':[/(?:^|\W)job\w*\b/i,/(?:^|\W)career\w*\b/i,/(?:^|\W)redundan\w*\b/i,/(?:^|\W)layoff\w*\b/i,/(?:^|\W)unemploy\w*\b/i,/(?:^|\W)wage\w*\b/i,/(?:^|\W)salar\w*\b/i],
 'Remote & hybrid work':[/(?:^|\W)remote work\w*\b/i,/(?:^|\W)hybrid\b/i,/(?:^|\W)work from home\b/i,/(?:^|\W)return to (?:the )?office\b/i,/(?:^|\W)four-day week\b/i,/(?:^|\W)commut\w*\b/i],
 'Skills & training':[/(?:^|\W)skill\w*\b/i,/(?:^|\W)training\b/i,/(?:^|\W)reskill\w*\b/i,/(?:^|\W)upskill\w*\b/i,/(?:^|\W)qualification\w*\b/i,/(?:^|\W)graduate\w*\b/i],
 'AI & technology':[/(?:^|\W)AI(?:\W|$)/i,/(?:^|\W)artificial intelligence\b/i,/(?:^|\W)chatbot\w*\b/i,/(?:^|\W)machine learning\b/i,/(?:^|\W)technolog\w*\b/i,/(?:^|\W)robot\w*\b/i,/(?:^|\W)chip\w*\b/i],
 'Automation & productivity':[/(?:^|\W)automat\w*\b/i,/(?:^|\W)productivit\w*\b/i,/(?:^|\W)efficien\w*\b/i,/(?:^|\W)workflow\w*\b/i],
 'Software & tools':[/(?:^|\W)software\b/i,/(?:^|\W)app\b/i,/(?:^|\W)platform\w*\b/i,/(?:^|\W)cloud\b/i,/(?:^|\W)digital\b/i,/(?:^|\W)subscription\w*\b/i],
 'Cybersecurity':[/(?:^|\W)cyber\w*\b/i,/(?:^|\W)hack\w*\b/i,/(?:^|\W)breach\w*\b/i,/(?:^|\W)ransomware\b/i,/(?:^|\W)phishing\b/i,/(?:^|\W)data (?:leak|protection|privacy)\b/i,/(?:^|\W)fraud\w*\b/i],
 'Growth & customers':[/(?:^|\W)customer\w*\b/i,/(?:^|\W)consumer\w*\b/i,/(?:^|\W)retail\w*\b/i,/(?:^|\W)growth\b/i,/(?:^|\W)demand\b/i,/(?:^|\W)shopper\w*\b/i],
 'Marketing & advertising':[/(?:^|\W)marketing\b/i,/(?:^|\W)advertis\w*\b/i,/(?:^|\W)brand\w*\b/i,/(?:^|\W)campaign\w*\b/i,/(?:^|\W)social media\b/i,/(?:^|\W)influencer\w*\b/i],
 'Sales & pricing':[/(?:^|\W)pric(?:e|es|ing)\b/i,/(?:^|\W)sales\b/i,/(?:^|\W)discount\w*\b/i,/(?:^|\W)revenue\w*\b/i,/(?:^|\W)margin\w*\b/i],
 'Consumer confidence':[/(?:^|\W)confidence\b/i,/(?:^|\W)sentiment\b/i,/(?:^|\W)spending\b/i,/(?:^|\W)household\w*\b/i,/(?:^|\W)cost of living\b/i],
 'Competition':[/(?:^|\W)competit\w*\b/i,/(?:^|\W)rival\w*\b/i,/(?:^|\W)market share\b/i,/(?:^|\W)monopol\w*\b/i,/(?:^|\W)takeover\w*\b/i,/(?:^|\W)merger\w*\b/i],
 'Innovation & R&D':[/(?:^|\W)innovat\w*\b/i,/(?:^|\W)research and development\b/i,/(?:^|\W)patent\w*\b/i,/(?:^|\W)breakthrough\w*\b/i,/(?:^|\W)launch\w*\b/i],
 'Economy':[/(?:^|\W)econom\w*\b/i,/(?:^|\W)inflation\b/i,/(?:^|\W)recession\w*\b/i,/(?:^|\W)GDP\b/i,/(?:^|\W)growth forecast\w*\b/i,/(?:^|\W)market\w*\b/i],
 'Interest rates':[/(?:^|\W)interest rates?\b/i,/(?:^|\W)bank of england\b/i,/(?:^|\W)central bank\w*\b/i,/(?:^|\W)mortgage\w*\b/i,/(?:^|\W)borrow\w*\b/i,/(?:^|\W)lend\w*\b/i],
 'Tax & regulation':[/(?:^|\W)tax(?:es|ation|payer\w*)?\b/i,/(?:^|\W)budget\w*\b/i,/(?:^|\W)regulat\w*\b/i,/(?:^|\W)chancellor\b/i,/(?:^|\W)treasury\b/i,/(?:^|\W)levy\b/i],
 'Energy & costs':[/(?:^|\W)energy\b/i,/(?:^|\W)electricit\w*\b/i,/(?:^|\W)fuel\b/i,/(?:^|\W)oil\b/i,/(?:^|\W)gas\b/i,/(?:^|\W)bills?\b/i,/(?:^|\W)overhead\w*\b/i],
 'Supply chain & trade':[/(?:^|\W)supply chain\w*\b/i,/(?:^|\W)tariff\w*\b/i,/(?:^|\W)import\w*\b/i,/(?:^|\W)export\w*\b/i,/(?:^|\W)trade\b/i,/(?:^|\W)shipping\b/i,/(?:^|\W)freight\b/i],
 'Funding & investment':[/(?:^|\W)fund(?:ing|raise|raising)\b/i,/(?:^|\W)invest\w*\b/i,/(?:^|\W)venture capital\b/i,/(?:^|\W)startup\w*\b/i,/(?:^|\W)valuation\w*\b/i,/(?:^|\W)IPO\b/i],
 'Property & premises':[/(?:^|\W)propert\w*\b/i,/(?:^|\W)rent\w*\b/i,/(?:^|\W)landlord\w*\b/i,/(?:^|\W)office space\b/i,/(?:^|\W)housing\b/i,/(?:^|\W)high street\b/i],
 'Legal & compliance':[/(?:^|\W)law(?:s|suit\w*)?\b/i,/(?:^|\W)legal\b/i,/(?:^|\W)court\w*\b/i,/(?:^|\W)complian\w*\b/i,/(?:^|\W)fine[ds]?\b/i,/(?:^|\W)tribunal\w*\b/i,/(?:^|\W)ruling\b/i],
 'Sustainability':[/(?:^|\W)sustainab\w*\b/i,/(?:^|\W)climate\b/i,/(?:^|\W)carbon\b/i,/(?:^|\W)net zero\b/i,/(?:^|\W)emission\w*\b/i,/(?:^|\W)recycl\w*\b/i,/(?:^|\W)environment\w*\b/i]
};
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
