import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist');const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
async function files(dir){const result=[];for(const d of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,d.name);result.push(...d.isDirectory()?await files(p):[p]);}return result;}
const all=await files(root);let links=0,images=0;const errors=[];
for(const file of all.filter(p=>p.endsWith('.html'))){const html=await readFile(file,'utf8');const rel=path.relative(root,file);if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${rel}: expected one H1`);if(!html.includes('lang="ru"'))errors.push(`${rel}: missing language`);if(!html.includes('name="description"'))errors.push(`${rel}: missing description`);
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){let target=m[1];if(!target.startsWith('/'))continue;links++;if(base){if(!target.startsWith(base+'/'))errors.push(`${rel}: link outside base ${target}`);target=target.slice(base.length);}target=target.split(/[?#]/)[0];let dest=path.join(root,target);try{if((await stat(dest)).isDirectory())dest=path.join(dest,'index.html');await stat(dest);}catch{errors.push(`${rel}: missing ${target}`);}}
 for(const m of html.matchAll(/<img\b[^>]+>/g)){images++;if(!/alt="[^"]+"/.test(m[0])||!m[0].includes('width=')||!m[0].includes('height='))errors.push(`${rel}: image needs alt/dimensions`);}
 for(const m of html.matchAll(/srcset="([^"]+)"/g)){for(const item of m[1].split(',')){let target=item.trim().split(' ')[0];if(base)target=target.slice(base.length);try{await stat(path.join(root,target));}catch{errors.push(`${rel}: missing responsive image ${target}`);}}}
 for(const m of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)){try{JSON.parse(m[1]);}catch{errors.push(`${rel}: invalid structured data`);}}
}
const data=JSON.parse(await readFile('content/projects.json','utf8'));assert.equal(data.projects.length,16);assert.equal(new Set(data.projects.map(p=>p.id)).size,16);assert.equal(all.filter(p=>p.endsWith('.html')).length,21);if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`PASS: 21 pages, 16 projects, ${links} local references, ${images} images, responsive sources, metadata and structured data.`);
