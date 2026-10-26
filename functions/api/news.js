// ExploraSelf Broadcast — the news endpoint.
//
// Why this is sharded: the Workers free plan allows 10ms of CPU per request
// and 50 external subrequests. Parsing twenty-seven feeds in one invocation
// would exceed the CPU budget and the whole edition would fail. So the feeds
// are split into three shards, each cached separately at the edge for three
// hours, and the browser fetches all three in parallel and merges them.
//
// Scoring and selection are deliberately NOT done here. Choosing the eight
// stories of the day is the expensive part, and the browser does it for free.
//
// We syndicate what RSS is for: headline, short summary, source name, link
// out. We never reproduce an article body.

const TTL = 10800; // three hours
const MAX_XML = 120000; // bound the work per feed
const MAX_ITEMS = 10; // per feed

// [id, publisher, domain hint (fallback only), authority weight, url, ...alternates]
// Alternates are tried in order when the first URL refuses or moves. They must
// be the publisher's own official feed addresses — never a proxy, mirror or
// scraper, and never a way around a publisher that is deliberately saying no.
// Weight 3 = management and research desks, 2 = major newsrooms, 1 = trade press.
//
// Each shard deliberately contains feeds already proven live on this site, so
// no shard can come back completely empty if a newer URL has moved. The list is
// over-provisioned on purpose: twenty-seven feeds to fill eight slots a day.
const SHARDS = [
  [
    ['guardian-psych', 'The Guardian', 'Self', 2, 'https://www.theguardian.com/science/psychology/rss'],
    ['bbc-business', 'BBC News', 'Business', 2, 'https://feeds.bbci.co.uk/news/business/rss.xml'],
    ['guardian-wellbeing', 'The Guardian', 'Self', 2, 'https://www.theguardian.com/lifeandstyle/health-and-wellbeing/rss'],
    ['hbr', 'Harvard Business Review', 'Self', 3, 'https://feeds.hbr.org/harvardbusiness?format=xml', 'https://feeds.hbr.org/harvardbusiness', 'https://hbr.org/feed'],
    ['sloan', 'MIT Sloan Management Review', 'Work', 3, 'https://sloanreview.mit.edu/feed/'],
    ['economist-biz', 'The Economist', 'Business', 3, 'https://www.economist.com/business/rss.xml'],
    ['conversation-biz', 'The Conversation', 'Work', 3, 'https://theconversation.com/uk/business/articles.atom'],
    ['npr-business', 'NPR', 'Business', 2, 'https://feeds.npr.org/1006/rss.xml'],
    ['conversation-all', 'The Conversation', 'Self', 3, 'https://theconversation.com/uk/articles.atom'],
    ['aljazeera', 'Al Jazeera', 'Business', 2, 'https://www.aljazeera.com/xml/rss/all.xml'],
  ],
  [
    ['bbc-tech', 'BBC News', 'Work', 2, 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
    ['guardian-work', 'The Guardian', 'People', 2, 'https://www.theguardian.com/money/work-and-careers/rss'],
    ['guardian-tech', 'The Guardian', 'Work', 2, 'https://www.theguardian.com/uk/technology/rss'],
    ['mit-tech', 'MIT Technology Review', 'Work', 3, 'https://www.technologyreview.com/feed/'],
    ['wharton', 'Knowledge at Wharton', 'Business', 3, 'https://knowledge.wharton.upenn.edu/feed/'],
    ['wired-biz', 'WIRED', 'Work', 2, 'https://www.wired.com/feed/category/business/latest/rss'],
    ['ars', 'Ars Technica', 'Work', 2, 'https://feeds.arstechnica.com/arstechnica/index'],
    ['verge', 'The Verge', 'Work', 2, 'https://www.theverge.com/rss/index.xml'],
    ['fastco', 'Fast Company', 'Work', 1, 'https://www.fastcompany.com/latest/rss'],
    ['weforum', 'World Economic Forum', 'Business', 2, 'https://www.weforum.org/stories/rss.xml', 'https://www.weforum.org/agenda/feed/'],
  ],
  [
    ['guardian-smallbiz', 'The Guardian', 'Business', 2, 'https://www.theguardian.com/business/smallbusiness/rss'],
    ['guardian-biz', 'The Guardian', 'Business', 2, 'https://www.theguardian.com/business/rss'],
    ['ft-home', 'Financial Times', 'Business', 3, 'https://www.ft.com/rss/home'],
    ['cnbc-top', 'CNBC', 'Business', 2, 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114'],
    ['marketwatch', 'MarketWatch', 'Business', 2, 'https://feeds.content.dowjones.io/public/rss/mw_topstories'],
    ['techcrunch', 'TechCrunch', 'Business', 1, 'https://techcrunch.com/feed/'],
    ['entrepreneur', 'Entrepreneur', 'Business', 1, 'https://www.entrepreneur.com/latest.rss'],
    ['inc', 'Inc.', 'Business', 1, 'https://www.inc.com/rss'],
    ['sifted', 'Sifted', 'Business', 1, 'https://sifted.eu/feed'],
    ['eustartups', 'EU-Startups', 'Business', 1, 'https://www.eu-startups.com/feed/'],
  ],
];

// Google News topic searches. Shard 4 is a safety net the browser requests only
// when a domain came back empty, so it normally costs nothing. Not an official
// API, so it is never the backbone.
const FILL = [
  ['gnews-self', 'Google News', 'Self', 1, 'https://news.google.com/rss/search?q=leadership+OR+%22decision+making%22+OR+burnout+when:2d&hl=en-GB&gl=GB&ceid=GB:en'],
  ['gnews-people', 'Google News', 'People', 1, 'https://news.google.com/rss/search?q=%22workplace+culture%22+OR+hiring+OR+%22employee+retention%22+when:2d&hl=en-GB&gl=GB&ceid=GB:en'],
  ['gnews-work', 'Google News', 'Work', 1, 'https://news.google.com/rss/search?q=%22small+business%22+technology+OR+automation+OR+productivity+when:2d&hl=en-GB&gl=GB&ceid=GB:en'],
  ['gnews-business', 'Google News', 'Business', 1, 'https://news.google.com/rss/search?q=%22small+business%22+economy+OR+pricing+OR+customers+when:2d&hl=en-GB&gl=GB&ceid=GB:en'],
];

// One compiled regex per topic keeps the per-item cost to 28 tests, not 190.
const TOPICS = {
  'Decision-making': /\b(decisions?|decision-making|judge?ments?|thinking|brains?|psycholog\w+|creativ\w+|biases?|biased)\b/i,
  'Leadership': /\b(leaders?|leadership|managers?|management|bosses|boss|executives?|chief exec\w*|founders?|board)\b/i,
  'Burnout & wellbeing': /\b(burnout|stress\w*|wellbeing|well-being|mental health|sleep\w*|exhaust\w*)\b/i,
  'Reputation & trust': /\b(reputation\w*|trust\w*|scandal\w*|apolog\w+|backlash|boycott\w*)\b/i,
  'Team & culture': /\b(teams?|workplace\w*|staff|employees?|culture|morale|unions?|unionis\w+)\b/i,
  'Hiring & talent': /\b(hire|hiring|hired|recruit\w*|vacanc\w+|talent|shortages?|apprentice\w*)\b/i,
  'Jobs & careers': /\b(jobs?|careers?|redundan\w+|layoffs?|unemploy\w+|wages?|salar\w+)\b/i,
  'Remote & hybrid work': /\b(remote work\w*|hybrid|work from home|return to (?:the )?office|four-day week|commut\w+)\b/i,
  'Skills & training': /\b(skills?|training|reskill\w*|upskill\w*|qualifications?|graduates?)\b/i,
  'AI & technology': /\b(AI|artificial intelligence|chatbots?|machine learning|technolog\w+|robots?|robotics|chips?)\b/i,
  'Automation & productivity': /\b(automat\w+|productivit\w+|efficien\w+|workflows?)\b/i,
  'Software & tools': /\b(software|apps?|platforms?|cloud|digital|subscriptions?)\b/i,
  'Cybersecurity': /\b(cyber\w*|hacks?|hacked|hacking|breach\w*|ransomware|phishing|data (?:leak|protection|privacy)|frauds?|fraudulent)\b/i,
  'Growth & customers': /\b(customers?|consumers?|retail\w*|growth|demand|shoppers?)\b/i,
  'Marketing & advertising': /\b(marketing|advertis\w+|brands?|branding|campaigns?|social media|influencers?)\b/i,
  'Sales & pricing': /\b(price|prices|pricing|sales|discounts?|revenues?|margins?)\b/i,
  'Consumer confidence': /\b(confidence|sentiment|spending|households?|cost of living)\b/i,
  'Competition': /\b(competit\w+|rivals?|rivalry|market share|monopol\w+|takeovers?|mergers?)\b/i,
  'Innovation & R&D': /\b(innovat\w+|research and development|patents?|breakthroughs?|launch\w*)\b/i,
  'Economy': /\b(econom\w+|inflation|recession\w*|GDP|growth forecasts?|markets?)\b/i,
  'Interest rates': /\b(interest rates?|bank of england|central banks?|federal reserve|mortgages?|borrow\w+|lend\w+)\b/i,
  'Tax & regulation': /\b(tax|taxes|taxation|taxpayers?|budgets?|regulat\w+|chancellor|treasury|levy)\b/i,
  'Energy & costs': /\b(energy|electricit\w+|fuel|oil|gas|bills?|overheads?)\b/i,
  'Supply chain & trade': /\b(supply chains?|tariffs?|imports?|exports?|trade|shipping|freight)\b/i,
  'Funding & investment': /\b(funding|fundrais\w+|invest\w+|venture capital|startups?|valuations?|IPO)\b/i,
  'Property & premises': /\b(propert\w+|rent|rents|rental|landlords?|office space|housing|high street)\b/i,
  'Legal & compliance': /\b(law|laws|lawsuits?|legal|courts?|complian\w+|fine|fined|fines|tribunals?|ruling)\b/i,
  'Sustainability': /\b(sustainab\w+|climate|carbon|net zero|emissions?|recycl\w+|environment\w*)\b/i,
};

// Each topic belongs to one of the four domains, so the quadrants are decided
// by what a story is about, not by which feed happened to carry it.
const TOPIC_DOMAIN = {
  'Decision-making': 'Self', 'Leadership': 'Self', 'Burnout & wellbeing': 'Self',
  'Reputation & trust': 'People', 'Team & culture': 'People', 'Hiring & talent': 'People',
  'Jobs & careers': 'People', 'Skills & training': 'People',
  'Remote & hybrid work': 'Work', 'AI & technology': 'Work', 'Automation & productivity': 'Work',
  'Software & tools': 'Work', 'Cybersecurity': 'Work', 'Innovation & R&D': 'Work',
  'Energy & costs': 'Work', 'Property & premises': 'Work', 'Legal & compliance': 'Work',
  'Growth & customers': 'Business', 'Marketing & advertising': 'Business', 'Sales & pricing': 'Business',
  'Consumer confidence': 'Business', 'Competition': 'Business', 'Economy': 'Business',
  'Interest rates': 'Business', 'Tax & regulation': 'Business', 'Supply chain & trade': 'Business',
  'Funding & investment': 'Business', 'Sustainability': 'Business',
};

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ENT[n])
    .replace(/\s+/g, ' ')
    .trim();
}

function field(item, tags) {
  for (const tag of tags) {
    const m = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (m) { const v = decode(m[1]); if (v) return v; }
  }
  return '';
}

/** RSS <item> and Atom <entry>, so research and tech desks are both readable. */
function parse(xml, source) {
  const [id, name, hint, weight] = source;
  const body = xml.length > MAX_XML ? xml.slice(0, MAX_XML) : xml;
  const out = [];
  for (const match of body.matchAll(/<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi)) {
    const item = match[1];
    const title = field(item, ['title']);
    // Atom puts the URL in an attribute; RSS puts it in the element.
    const link = field(item, ['link']) || item.match(/<link[^>]*\shref=["'](https?:\/\/[^"']+)["']/i)?.[1] || '';
    if (!title || !/^https:\/\//.test(link)) continue;

    let excerpt = field(item, ['description', 'summary', 'content']).replace(/Continue reading.*/i, '').trim();
    // Google News descriptions are link markup, not prose. Better empty than noise.
    if (/^(?:<|&lt;)?a\s|^View Full Coverage/i.test(excerpt) || excerpt.length < 40) excerpt = '';
    if (excerpt.length > 220) excerpt = excerpt.slice(0, 220).replace(/\s+\S*$/, '') + '…';

    const date = Date.parse(field(item, ['pubDate', 'published', 'updated']));
    const image = item.match(/<(?:media:thumbnail|media:content|enclosure)[^>]*\s(?:url)=["'](https:\/\/[^"']+)["']/i)?.[1] || null;

    const hay = title + ' ' + excerpt.slice(0, 200);
    const topics = [];
    for (const key in TOPICS) if (TOPICS[key].test(hay)) topics.push(key);

    // Domain from the strongest topic signal; the feed's hint is only a fallback.
    let domain = hint;
    for (const t of topics) { const d = TOPIC_DOMAIN[t]; if (d) { domain = d; break; } }

    out.push({
      id: link.split('?')[0], url: link, title, excerpt,
      publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : null,
      image, domain, source: name, sourceId: id, weight,
      topics: topics.length ? topics : [],
    });
    if (out.length >= MAX_ITEMS) break;
  }
  if (!out.length) throw Error('No readable items');
  return out;
}

async function readFeed(source) {
  const urls = source.slice(4);
  const status = { id: source[0], name: source[1], domain: source[2], url: urls[0] };
  for (let i = 0; i < urls.length; i++) {
    const last = i === urls.length - 1;
    try {
      return { status: { ...status, url: urls[i], ok: true }, articles: parse(await fetchFeed(urls[i]), source) };
    } catch {
      if (last) return { status: { ...status, ok: false, error: 'Feed temporarily unavailable' }, articles: [] };
    }
  }
  return { status: { ...status, ok: false, error: 'Feed temporarily unavailable' }, articles: [] };
}

async function fetchFeed(url) {
  {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ExploraSelfBroadcast/2.1; +https://broadcast.exploraself.com)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.9, */*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    });
    if (!r.ok) throw Error('Feed unavailable');
    return r.text();
  }
}

export { SHARDS, FILL, TOPICS, TOPIC_DOMAIN, MAX_ITEMS, TTL };

export async function onRequestGet({ request, waitUntil }) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('s');
  const shard = /^[1-4]$/.test(raw || '') ? Number(raw) : 1;
  const sources = shard === 4 ? FILL : SHARDS[shard - 1];

  const key = new Request(new URL(`/api/news?s=${shard}`, url), { method: 'GET' });
  const cache = caches.default;
  const cached = await cache.match(key);
  if (cached) return cached;

  const results = await Promise.all(sources.map(readFeed));
  const payload = {
    shard,
    shards: SHARDS.length,
    fetchedAt: new Date().toISOString(),
    refreshHours: 3,
    sources: results.map((r) => r.status),
    articles: results.flatMap((r) => r.articles),
  };

  const ok = payload.articles.length > 0;
  const response = new Response(JSON.stringify(payload), {
    status: ok ? 200 : 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': ok ? `public, max-age=0, s-maxage=${TTL}` : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
  if (ok) waitUntil(cache.put(key, response.clone()));
  return response;
}
