await (async function runPortfolioChecks(){
 const assert=await import('node:assert/strict');
 const fs=await import('node:fs/promises');
 const path=await import('node:path');
 const root=path.resolve('dist');
 const rawBase=(process.env.BASE_PATH||'').replace(/^\/+|\/+$/g,'');
 const base=rawBase?'/'+rawBase+'/':'/';
 const projects=JSON.parse(await fs.readFile('content/projects.json','utf8')).projects;
 const stories=JSON.parse(await fs.readFile('content/stories.json','utf8'));
 const errors=[];let refs=0,images=0,ogCount=0;
 const check=(yes,msg)=>{if(!yes)errors.push(msg)};
 async function walk(dir){
  let a=[];
  for(const item of await fs.readdir(dir,{withFileTypes:true})){
   const f=path.join(dir,item.name);
   a.push(...(item.isDirectory()?await walk(f):[f]));
  }
  return a;
 }
 async function local(from,link){
  if(!link.startsWith('/'))return;
  refs++;
  if(!link.startsWith(base)){errors.push(`${from}: escapes base: ${link}`);return}
  let file=path.join(root,link.slice(base.length).split(/[?#]/)[0]);
  try{
   if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
   await fs.stat(file);
  }catch{errors.push(`${from}: missing ${link}`)}
 }
 const all=await walk(root),html=all.filter(f=>f.endsWith('.html'));
 assert.equal(projects.length,16);assert.equal(html.length,21);
 assert.equal(Object.keys(stories).length,16);
 assert.equal(new Set(projects.map(p=>p.id)).size,16);
 for(const p of projects){
  const s=stories[p.id];
  check(Boolean(s?.context&&s?.approach&&Array.isArray(s?.features)),`${p.id}: incomplete story`);
  for(const m of [...(p.cover?[p.cover]:[]),...p.media]){
   check(Boolean(m.src?.endsWith('.webp')),`${p.id}: invalid asset format`);
   check(Boolean(m.alt?.trim().length>2),`${p.id}: missing alt`);
   check(Boolean(m.width>0&&m.height>0),`${p.id}: missing image dimensions`);
   try{await fs.stat(path.join(root,m.src))}catch{errors.push(`${p.id}: missing ${m.src}`)}
  }
  try{await fs.stat(path.join(root,'og',p.id+'.webp'))}catch{errors.push(`${p.id}: missing social image`)}
 }
 try{await fs.stat(path.join(root,'og/profile.webp'))}catch{errors.push('missing profile preview')}
 for(const file of html){
  const rel=path.relative(root,file),src=await fs.readFile(file,'utf8');
  check((src.match(/<h1(?:\s|>)/g)||[]).length===1,`${rel}: expected one H1`);
  check(src.includes('lang="ru"'),`${rel}: language`);
  check(src.includes('name="description"'),`${rel}: description`);
  check(src.includes('rel="canonical"'),`${rel}: canonical`);
  check(src.includes('rel="stylesheet" href="'+base+'portfolio.css"'),`${rel}: compiled CSS`);
  check(!src.includes('/reference/'),`${rel}: obsolete visual source`);
  const og=src.match(/<meta property="og:image" content="([^"]+)"/);
  check(Boolean(og),`${rel}: social preview`);
  if(og){ogCount++;await local(rel,new URL(og[1]).pathname);}
  for(const m of src.matchAll(/\b(?:href|src)="([^"]+)"/g))await local(rel,m[1]);
  for(const m of src.matchAll(/<img\b[^>]+>/g)){
   images++;
   check(/alt="[^"]+"/.test(m[0]),`${rel}: missing img alt`);
   check(/\bwidth="\d+"/.test(m[0])&&/\bheight="\d+"/.test(m[0]),`${rel}: missing img dimensions`);
  }
  for(const m of src.matchAll(/\bsrcset="([^"]+)"/g))for(const item of m[1].split(','))await local(rel,item.trim().split(/\s+/)[0]);
  for(const m of src.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)){
   try{JSON.parse(m[1])}catch{errors.push(`${rel}: invalid JSON-LD`)}
  }
  if(rel.startsWith('work/')){
   check(src.includes('class="case case-v4 '),`${rel}: case layout`);
   check(src.includes('id="media-lightbox"'),`${rel}: image viewer`);
   check(src.includes('case-overview-grid'),`${rel}: story context`);
  }
 }
 if(errors.length){console.error(errors.slice(0,70).join('\n'));process.exit(1);}
 console.log(`PASS: ${html.length} pages, 16 projects, ${refs} local references, ${images} images, ${ogCount} social previews, editorial content, media sources and structured data.`);
})();
