import {initWave} from './wave.js';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reduceMotion.matches;
const wave=initWave(document.querySelector('.wave-canvas'));
const videos=[...document.querySelectorAll('video')], visibleVideos=new Set();
function playVideo(video){
 if(motionPaused||document.hidden||!visibleVideos.has(video)){video.pause();return;}
 const source=video.querySelector('source[data-src]');
 if(source){source.src=source.dataset.src;delete source.dataset.src;video.load();}
 video.play().catch(()=>{});
}
const videoObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting)visibleVideos.add(target);else visibleVideos.delete(target);playVideo(target);}),{rootMargin:'100px'});
videos.forEach(video=>videoObserver.observe(video));
const motionButton=document.querySelector('.motion-toggle');
function applyMotion(){
 wave.setPaused(motionPaused);
 document.body.classList.toggle('motion-paused',motionPaused);
 motionButton?.setAttribute('aria-pressed',String(motionPaused));
 if(motionButton)motionButton.textContent=motionPaused?'Включить анимацию':'Пауза анимации';
 videos.forEach(playVideo);updateScroll();
}
motionButton?.addEventListener('click',()=>{motionPaused=!motionPaused;applyMotion();});
reduceMotion.addEventListener('change',()=>{motionPaused=reduceMotion.matches;applyMotion();});
document.addEventListener('visibilitychange',()=>videos.forEach(playVideo));

const menu=document.querySelector('#menu'),menuButton=document.querySelector('.menu-button');
menuButton?.addEventListener('click',()=>{menu.showModal();document.body.classList.add('menu-is-open');menuButton.setAttribute('aria-expanded','true');});
const closeMenu=()=>menu.close();
document.querySelector('.menu-close')?.addEventListener('click',closeMenu);
menu?.addEventListener('close',()=>{document.body.classList.remove('menu-is-open');menuButton.setAttribute('aria-expanded','false');menuButton.focus();});
menu?.addEventListener('click',event=>{if(event.target===menu)closeMenu();});

function filterProjects(category){
 const valid=['all','digital','brand','events'];if(!valid.includes(category))category='all';
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
 let count=0;document.querySelectorAll('.catalogue [data-category]').forEach(row=>{row.hidden=category!=='all'&&row.dataset.category!==category;if(!row.hidden)count++;});
 const status=document.querySelector('.filter-count');if(status)status.textContent=`${count} ${count===1?'проект':count>1&&count<5?'проекта':'проектов'}`;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filterProjects(button.dataset.filter);const next=new URL(location.href);if(button.dataset.filter==='all')next.searchParams.delete('category');else next.searchParams.set('category',button.dataset.filter);history.replaceState(null,'',next);}));
if(document.querySelector('.catalogue'))filterProjects(new URLSearchParams(location.search).get('category')||'all');

const stage=document.querySelector('.services-stage');
function selectService(button){
 stage.classList.add('is-active');
 document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-service-image]').forEach(image=>image.classList.toggle('active',image.dataset.serviceImage===button.dataset.service));
 stage.querySelector('.service-description p').textContent=button.dataset.description;
}
document.querySelectorAll('[data-service]').forEach(button=>{['pointerenter','focus','click'].forEach(event=>button.addEventListener(event,()=>selectService(button)));});
stage?.addEventListener('pointerleave',()=>stage.classList.remove('is-active'));

const hero=document.querySelector('.hero-content'),heroStack=document.querySelector('.hero-stack'),vision=document.querySelector('.vision');
let scrollFrame=0;
function updateScroll(){
 scrollFrame=0;
 if(heroStack)document.body.classList.toggle('past-hero',heroStack.getBoundingClientRect().bottom<=64);
 if(hero){const progress=motionPaused?0:Math.max(0,Math.min(1,-heroStack.getBoundingClientRect().top/(heroStack.offsetHeight-innerHeight)));hero.style.opacity=String(1-progress*.7);hero.style.transform=`translateY(${-progress*80}px)`;}
 if(vision){const rect=vision.getBoundingClientRect();vision.style.setProperty('--word-shift',motionPaused?'0px':`${Math.max(-180,Math.min(0,(rect.top-innerHeight)*.12))}px`);}
}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;revealObserver.unobserve(target);if(!motionPaused)target.animate([{opacity:.3,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});}),{threshold:.15});
document.querySelectorAll('[data-reveal]').forEach(el=>revealObserver.observe(el));
const glow=document.querySelector('.cursor-glow');
if(matchMedia('(pointer:fine)').matches){document.addEventListener('pointermove',event=>{if(!glow||motionPaused)return;glow.style.left=`${event.clientX}px`;glow.style.top=`${event.clientY}px`;glow.style.opacity='.55';},{passive:true});document.addEventListener('pointerleave',()=>{if(glow)glow.style.opacity='0';});}

const toast=document.querySelector('.toast');let toastTimer;
function notify(text){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
document.querySelector('.copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget,original=button.textContent;try{await navigator.clipboard.writeText(button.dataset.email);notify('Адрес скопирован');button.textContent='Скопировано ✓';setTimeout(()=>button.textContent=original,2500);}catch{notify('Адрес почты: '+button.dataset.email);}});
document.querySelector('.contact-form')?.addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const data=new FormData(form),subject=`Проект / ${data.get('name')}`;
 const body=`Имя: ${data.get('name')}\nEmail: ${data.get('email')}\nБюджет: ${data.get('budget')}\n\n${data.get('message')}`;
 location.href=`mailto:cdo@imon.agency?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 form.querySelector('.form-note').textContent='Письмо подготовлено для почтового приложения. Если оно не открылось, напишите на cdo@imon.agency или в Telegram.';
});
document.querySelector('.back-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:motionPaused?'instant':'smooth'}));
applyMotion();
