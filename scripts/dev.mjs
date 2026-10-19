import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const args=process.argv.slice(2);const get=(arg,fallback)=>args.includes(arg)?args[args.indexOf(arg)+1]:fallback;
const port=Number(get('--port',4173));const host=get('--host','0.0.0.0');
const result=spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});if(result.status)process.exit(result.status);
const root=path.resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://local');if(u.pathname==='/__qa'){
 const width=Math.max(320,Math.min(1440,Number(u.searchParams.get('width'))||390));
 const target=u.searchParams.get('target')==='reference'?'https://uncoded.framer.website/'+(u.searchParams.get('page')==='works'?'works':''):'/'+(u.searchParams.get('page')||'').replace(/[^a-z0-9/~-]/gi,'');
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#ddd;font-family:Arial"><nav style="height:44px;display:flex;gap:20px;align-items:center;padding:0 12px"><a href="/__qa?width=390&target=reference">Reference 390</a><a href="/__qa?width=390">Site 390</a><a href="/__qa?width=768">Site 768</a><a href="/">Desktop</a></nav><iframe title="Responsive preview" src="${target}" style="border:0;width:${width}px;height:844px;background:white;display:block"></iframe></body></html>`);return;}
 let name=decodeURIComponent(u.pathname);let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}let info;try{info=await stat(file);}catch{}if(info?.isDirectory()){file=path.join(file,'index.html');}let data;try{data=await readFile(file);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(400).end('Bad request');}}).listen(port,host,()=>console.log(`Portfolio ready on port ${port}`));
