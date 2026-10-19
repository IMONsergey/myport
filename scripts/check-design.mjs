import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';

const read=p=>readFile(p,'utf8');
const [template,css,motionStyles,motionScript,siteScript,projects]=await Promise.all([
  read('scripts/build.mjs'),
  read('src/site.css'),
  read('src/motion.css'),
  read('src/motion.js'),
  read('src/site.js'),
  read('content/projects.json').then(JSON.parse)
]);
const contains=(body,needle,label)=>{
  assert.ok(body.includes(needle),label+': expected '+needle);
};
for(const token of [
  "--ink:#000","--paper:#fff","--line:#dedede","--blue:#90d2eb",
  "Instrument Serif","Oranienbaum","Geist","Golos Text","--gutter:40px",
  "--gutter:30px","--gutter:16px",
  "@media(max-width:1199px)","@media(max-width:809px)"
])contains(css,token,'Design tokens');
for(const section of [
  'hero-stack','wave-background','hero-film','hero-scroll','selected section',
  'services-scene','services-stage','author-section','vision section',
  'practice-stories','process section','cta-scene',
  'works-heading','works-section','contact-layout','case-heading','case-cover',
  'case-story','case-gallery','case-source','more-works'
])contains(template,section,'Page composition');
for(const element of [
  'menu-wave wave-canvas','showreel','motion-toggle','menu-portrait',
  "video('cta')","video('hero')","data-scrub","data-reveal"
])contains(template,element,'Interaction and motion');
for(const selector of [
  '.hero-stage','.hero-content','.project-row','.service-buttons',
  '.vision-sticky','.practice-content','.case-cover','.dialog-is-open'
])contains(motionStyles,selector,'Original motion geometry');
for(const code of ['initMotion','splitText','scrubs','setupDialog','smoothScroll','menuWave'])
  contains(motionScript,code,'Motion source');
for(const code of ['initWave','filterProjects','selectService','.contact-form','.copy-email'])
  contains(siteScript,code,'Client behavior');
for(const file of [
  'public/reference/hero.mp4',
  'public/reference/cta.mp4',
  'public/reference/wave-desktop.webp',
  'public/reference/wave-mobile.webp',
  'public/fonts/instrument-serif-normal-400.woff2',
  'public/fonts/geist-normal-400.woff2'
])await access(file);
assert.equal(projects.projects.length,16,'All 16 original projects must remain available');
assert.equal(new Set(projects.projects.map(p=>p.id)).size,16,'Project identifiers must be unique');
for(const project of projects.projects){
  for(const medium of [...(project.cover?[project.cover]:[]),...project.media]){
    assert.ok(medium.src&&medium.width>0&&medium.height>0,'Incomplete media metadata for '+project.id);
    assert.ok(medium.alt?.trim(),'Missing alternative text for '+medium.src);
  }
  const labels=project.media.map(m=>m.alt);
  assert.equal(new Set(labels).size,labels.length,'Repeated image descriptions in '+project.id);
}
console.log('PASS: original typography, palette, grid, motion scenes, composition, reference assets and 16 projects.');
