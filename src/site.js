import {initMotion} from './motion.js';
import {initWave} from './wave.js';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=reduceMotion.matches;
const wave=initWave(document.querySelector('.hero-stage .wave-canvas'));
const motion=initMotion(()=>motionPaused);
const videos=[...document.querySelectorAll('video:not(#showreel video)')], visibleVideos=new Set();
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
 videos.forEach(playVideo);motion.refresh();
}
motionButton?.addEventListener('click',()=>{motionPaused=!motionPaused;applyMotion();});
reduceMotion.addEventListener('change',()=>{motionPaused=reduceMotion.matches;applyMotion();});
document.addEventListener('visibilitychange',()=>videos.forEach(playVideo));

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
 if(button.getAttribute('aria-pressed')==='true'&&stage.classList.contains('is-active'))return;
 stage.classList.add('is-active');
 document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-service-image]').forEach(image=>image.classList.toggle('active',image.dataset.serviceImage===button.dataset.service));
 const copy=stage.querySelector('.service-description');copy.textContent=button.dataset.description;
 if(!motionPaused)copy.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.16,.37,.56,1)'});
}
document.querySelectorAll('[data-service]').forEach(button=>{['pointerenter','focus','click'].forEach(event=>button.addEventListener(event,()=>selectService(button)));});
stage?.addEventListener('pointerleave',event=>{if(event.pointerType==='touch')return;stage.classList.remove('is-active');document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed','false'));});

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
