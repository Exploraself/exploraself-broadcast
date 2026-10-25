import concurrent.futures, datetime, email.utils, html, json, re, urllib.request, xml.etree.ElementTree as ET

SOURCES = [
 ('guardian-self', 'The Guardian', 'Self', 'https://www.theguardian.com/science/psychology/rss'),
 ('guardian-people', 'The Guardian', 'People', 'https://www.theguardian.com/money/work-and-careers/rss'),
 ('bbc-tech', 'BBC News', 'Work', 'https://feeds.bbci.co.uk/news/technology/rss.xml'),
 ('bbc-business', 'BBC News', 'Business', 'https://feeds.bbci.co.uk/news/business/rss.xml'),
]
TOPICS = {'Decision-making':['decision','judgment','think','brain','psycholog','creative'], 'Leadership':['leader','manager','boss','executive'], 'Team & culture':['team','worker','workplace','staff','employee','career','job','leave','work'], 'AI & technology':['ai','artificial intelligence','tech','digital','robot','software','chip'], 'Growth & customers':['customer','sales','brand','consumer','retail','growth','business'], 'Economy':['budget','tax','econom','inflation','rate','market','trade','bank']}
def plain(s):
 return ' '.join(html.unescape(re.sub('<[^>]+>', ' ', s or '')).split())
def load(source):
 sid,name,domain,url=source
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'ExploraSelfBroadcast/1.0 (RSS reader; links to original publishers)'})
  with urllib.request.urlopen(req,timeout=18) as response: root=ET.fromstring(response.read(2000000))
  items=[]
  for item in root.findall('.//item')[:18]:
   title=plain(item.findtext('title')); link=plain(item.findtext('link'))
   if not title or not link.startswith('https://'): continue
   try: date=email.utils.parsedate_to_datetime(item.findtext('pubDate')).isoformat()
   except: date=None
   desc=plain(item.findtext('description'))
   desc=re.sub(r'Continue reading.*','',desc).strip()
   # Display bounded excerpts with original headlines and source links, never full articles.
   desc=desc[:220].rsplit(' ',1)[0]+'…' if len(desc)>220 else desc
   image=None
   for el in item.iter():
    if el.tag.endswith(('thumbnail','content')) and el.get('url','').startswith('https://') and (el.get('type','').startswith('image') or 'thumbnail' in el.tag or el.get('medium')=='image'):
     image=el.get('url');break
   hay=(title+' '+desc).lower()
   topics=[t for t,words in TOPICS.items() if any(w in hay for w in words)]
   if not topics: topics=[{'Self':'Decision-making','People':'Team & culture','Work':'AI & technology','Business':'Economy'}[domain]]
   items.append({'id':link.split('?')[0], 'url':link, 'title':title,'excerpt':desc,'publishedAt':date,'image':image,'domain':domain,'source':name,'sourceId':sid,'topics':topics})
  if not items: raise ValueError('No readable articles')
  return {'id':sid,'name':name,'domain':domain,'url':url,'ok':True},items
 except Exception:
  return {'id':sid,'name':name,'domain':domain,'url':url,'ok':False,'error':'Feed temporarily unavailable'},[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(load,SOURCES))
print(json.dumps({'fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sources':[x[0] for x in results],'articles':[a for x in results for a in x[1]],'refreshHours':3}))
