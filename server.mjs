import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const run=promisify(execFile), root=path.resolve('exploraself-broadcast'), ttl=3*60*60*1000;
let snapshot=null, pending=null;
try{snapshot=JSON.parse(await readFile('.cache/news.json','utf8'));}catch{}
async function refresh(force=false){
 if(pending)return pending;
 if(!force&&snapshot&&Date.now()-Date.parse(snapshot.fetchedAt)<ttl)return snapshot;
 pending=(async()=>{try{
  const {stdout}=await run('python',['scripts/fetch_news.py'],{timeout:25000,maxBuffer:2000000});
  const fresh=JSON.parse(stdout);
  if(!fresh.articles.length)throw Error('Feeds unavailable');
  for(const s of fresh.sources.filter(s=>!s.ok)){
   fresh.articles.push(...(snapshot?.articles||[]).filter(a=>a.sourceId===s.id).map(a=>({...a,stale:true})));
  }
  snapshot=fresh;await mkdir('.cache',{recursive:true});await writeFile('.cache/news.json',JSON.stringify(snapshot));
  return snapshot;
 }catch(error){if(snapshot)return {...snapshot,stale:true,error:'Refresh unavailable. Showing the last saved edition.'};throw error;}finally{pending=null;}})();
 return pending;
}
refresh().catch(()=>{});
setInterval(()=>refresh(true).catch(()=>{}),ttl).unref();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/news'){
   const data=await refresh();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));return;
  }
  const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const body=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':url.pathname==='/sw.js'?'no-cache':'no-cache','X-Content-Type-Options':'nosniff'});res.end(body);
 }catch(error){console.error('Broadcast request error:',error);res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'This content is temporarily unavailable. Please try again.'}));}
}).listen(Number(process.argv[process.argv.indexOf('--port')+1]||process.env.PORT||3000),'0.0.0.0',()=>console.log('Broadcast preview ready'));
