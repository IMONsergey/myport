import Lenis from './vendor/lenis.js';
import {initWave} from './wave.js';
// Native reconstruction of Uncoded's published motion components.
// Parameters, source components and responsive differences: docs/motion-map.md.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const tween='cubic-bezier(.16,.37,.56,1)';
const enterEase='cubic-bezier(.08,.37,.56,1)';
export function initMotion(isPaused){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const animations=new Set();let menuWave;
  const smoothScroll=new Lenis({smoothWheel:!isPaused(),infinite:false,orientation:'vertical',gestureOrientation:'vertical',autoRaf:true,anchors:true,allowNestedScroll:true,syncTouch:false,stopInertiaOnNavigate:true});
  function animate(el,frames,options){
    if(!el||isPaused())return null;
    const animation=el.animate(frames,options);animations.add(animation);
    animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));return animation;
  }
  // Each word is kept intact while its letters reveal independently.
  function splitText(el){
    if(el.dataset.split)return [...el.querySelectorAll('.motion-char')];
    el.dataset.split='true';const readable=el.innerText.replace(/\s+/g,' ').trim();
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const fragment=document.createDocumentFragment();
      for(const token of node.textContent.split(/(\s+)/)){
        if(!token)continue;
        if(/^\s+$/.test(token)){fragment.append(document.createTextNode(token));continue;}
        const word=document.createElement('span');word.className='motion-word';word.setAttribute('aria-hidden','true');
        for(const letter of token){const char=document.createElement('span');char.className='motion-char';char.textContent=letter;word.append(char);}
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    const sr=document.createElement('span');sr.className='sr-only';sr.textContent=readable;el.prepend(sr);
    return [...el.querySelectorAll('.motion-char')];
  }
  const scrubs=$$('[data-scrub]').map((el,j)=>{
    const chars=splitText(el),order=chars.map((_,i)=>i);let seed=43+j*17;
    for(let i=order.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const k=seed%(i+1);[order[i],order[k]]=[order[k],order[i]];}
    const rank=[];order.forEach((n,i)=>rank[n]=i/Math.max(1,order.length-1));
    return {el,chars,rank,target:el.dataset.scrubTarget?document.getElementById(el.dataset.scrubTarget):el,anchor:Number(el.dataset.scrub)/100,previous:-1};
  });
  const revealTargets=$$('[data-reveal],.case-story h2,.case-story p,.case-heading p,.case-heading dl,.process-grid h2,.process-grid>div>p,.process-step,.principle-grid article,.author-description,.bio-copy,.about-intro p,.contact-layout>*,.footer-columns>*,.footer-legal,.more-works>h2');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;revealObserver.unobserve(target);
    if(target.hasAttribute('data-reveal')){
      const chars=splitText(target);
      chars.forEach((char,i)=>animate(char,[{opacity:.001,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:600,delay:i*7.5,easing:tween,fill:'backwards'}));
    }else if(target.closest('.site-footer'))animate(target,[{opacity:0},{opacity:1}],{duration:800,delay:Math.max(0,[...target.parentElement.children].indexOf(target))*100,easing:tween,fill:'backwards'});
    else animate(target,[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:600,easing:tween,fill:'backwards'});
  }),{threshold:0});
  revealTargets.forEach(el=>revealObserver.observe(el));
  // Preserve full natural images in case galleries; parallax only on cropped media.
  const media=$$('.process-images>img,.contact-images>img,.portrait-wrap>img,.bio-image>img,.case-cover>img').map(img=>{
    const wrap=document.createElement('div');wrap.className='parallax-media';img.before(wrap);wrap.append(img);return {wrap,img};
  });
  // Mount entrance and scroll movement live on separate nested elements.
  $$('.hero-line,.hero-middle>span').forEach((el,i)=>{
    const inner=document.createElement('span');inner.className='hero-entry';while(el.firstChild)inner.append(el.firstChild);el.append(inner);
    animate(inner,[{opacity:.001,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:700,delay:75+(i===0?0:i===3?200:100),easing:enterEase,fill:'backwards'});
  });
  animate($('.film-tilt'),[{opacity:.001,scale:.8},{opacity:1,scale:1}],{duration:700,delay:100,easing:enterEase,fill:'backwards'});
  $$('.hero-bottom>*,.hero-meta').forEach((el,i)=>animate(el,[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:700,delay:200+i*100,easing:enterEase,fill:'backwards'}));
  $$('.works-heading h1,.about-heading h1,.contact-heading h1,.case-heading h1').forEach(el=>{
    // Explicit line breaks preserve the reference's independently timed lines.
    const parts=el.innerHTML.split(/<br\s*\/?\s*>/i);el.innerHTML=parts.map(t=>`<span class="entrance-line"><span>${t}</span></span>`).join('');
    [...el.querySelectorAll('.entrance-line>span')].forEach((line,i)=>animate(line,[{opacity:.001,transform:'translateY(32px)'},{opacity:1,transform:'none'}],{duration:700,delay:i*100,easing:enterEase,fill:'backwards'}));
  });
  const hero=$('.hero-stack'),heroStage=$('.hero-stage'),heroLines=$$('.hero-content h1>.hero-line,.hero-middle'),heroBottom=$('.hero-bottom'),heroMeta=$('.hero-meta');
  const services=$('.services-scene'),serviceIntro=$('.services-intro'),practice=$('.practice'),practiceHeading=$('.practice-content>h2'),vision=$('.vision');
  const crosses=$$('.cross-title').map(el=>({el,left:el.querySelector('.crosses'),right:el.querySelector('.crosses:last-child')}));
  let scheduled=0;
  function render(){
    scheduled=0;const paused=isPaused(),vh=innerHeight,mobile=innerWidth<810;
    if(hero){
      const rect=hero.getBoundingClientRect(),travel=clamp(-rect.top/800),move=paused?0:travel;
      document.body.classList.toggle('past-hero',$('.selected').getBoundingClientRect().top<=64);
      heroLines.forEach(el=>el.style.transform=`translate3d(0,${-700*move}px,0)`);
      for(const el of [heroBottom,heroMeta])if(el){el.style.transform=`translate3d(0,${-200*move}px,0)`;el.style.opacity=1-move;}
      heroStage.dataset.progress=travel.toFixed(3);
    }
    for(const scene of [services,practice])if(scene){
      const top=scene.getBoundingClientRect().top,range=mobile?300:500;
      const progress=paused?1:clamp((vh-top)/range);
      scene.style.setProperty('--section-scale',(.5+progress*.5).toFixed(4));
      if(scene===services)serviceIntro.style.transform=`translate3d(0,${400*(1-progress)}px,0)`;
    }
    if(practiceHeading){const top=practice.getBoundingClientRect().top;const p=paused||mobile?0:clamp((-top+80)/(vh*.8));practiceHeading.style.transform=`scale(${1-.6*p})`;}
    if(vision){const hide=$('#vision-hide-trigger').getBoundingClientRect();$('.vision-first').style.opacity=paused?1:1-clamp((vh-hide.top)/hide.height);}
    for(const item of scrubs){
      const rect=item.target.getBoundingClientRect();
      const triggerTop=item.el.classList.contains('vision-first')?$('.vision-track').getBoundingClientRect().top+(vh-item.el.offsetHeight)/2:rect.top;
      let p=paused?1:clamp((vh*item.anchor-triggerTop)/Math.max(1,rect.height));
      // Reduced motion shows both messages in regular document flow.
      if(Math.abs(p-item.previous)<.0005)continue;item.previous=p;
      item.el.dataset.progress=p.toFixed(3);
      item.chars.forEach((char,i)=>{const local=clamp((p-item.rank[i]*2/3)*3),ease=1-Math.pow(1-local,3);char.style.opacity=ease;char.style.filter=`blur(${10*(1-ease)}px)`;char.style.transform=`scale(${1.2-.2*ease})`;});
    }
    for(const {el,left,right} of crosses){
      if(!left||mobile)continue;const rect=el.closest('section').getBoundingClientRect();const p=paused?.5:clamp((vh-rect.top)/vh);
      const travel=innerWidth<1200?80:160,extra=innerWidth<1200?60:100;
      [left,right].forEach((group,side)=>{const sign=side===0?1:-1;group.style.transform=`translateX(${sign*travel*(1-2*p)}px)`;[...group.children].forEach((char,i)=>{char.style.transform=(i===1||i===4)?`translateX(${sign*extra*(1-2*p)}px)`:'none';});});
    }
    for(const {wrap,img} of media){
      const rect=wrap.getBoundingClientRect();if(rect.bottom<0||rect.top>vh)continue;
      const travel=clamp(rect.height*.25,40,480),p=clamp((vh-rect.top)/(vh+rect.height));
      img.style.transform=paused?'none':`translate3d(0,${(p-.5)*travel}px,0) scale(${1+travel/Math.max(1,rect.height)})`;
    }
  }
  function refresh(){smoothScroll.options.smoothWheel=!isPaused();menuWave?.setPaused(isPaused()||!$('#menu').open);if(isPaused())animations.forEach(a=>a.finish());if(!scheduled)scheduled=requestAnimationFrame(render);}
  addEventListener('scroll',refresh,{passive:true});addEventListener('resize',refresh,{passive:true});
  document.fonts.ready.then(refresh);new ResizeObserver(refresh).observe(document.body);
  // Dialogs keep focus trapping active throughout their exit animation.
  let savedScroll=0,lockCount=0;
  function lock(){if(lockCount++===0){smoothScroll.stop();savedScroll=scrollY;document.documentElement.style.setProperty('--scrollbar-width',`${innerWidth-document.documentElement.clientWidth}px`);document.body.style.setProperty('--locked-top',`${-savedScroll}px`);document.body.classList.add('dialog-is-open');}}
  function unlock(){if(--lockCount<=0){lockCount=0;document.body.classList.remove('dialog-is-open');window.scrollTo({top:savedScroll,behavior:'instant'});smoothScroll.start();smoothScroll.scrollTo(savedScroll,{immediate:true,force:true});}}
  function setupDialog(dialog,trigger,closeButton,reel=false){
    if(!dialog||!trigger)return;let closing=false;
    function open(){if(dialog.open)return;lock();dialog.showModal();trigger.setAttribute('aria-expanded','true');
      animate(dialog,reel?[{opacity:0,transform:'translateY(1100px)'},{opacity:1,transform:'none'}]:[{opacity:0,transform:'translateY(-300px)'},{opacity:1,transform:'none'}],{duration:600,easing:reel?'cubic-bezier(.06,.6,.4,.98)':'cubic-bezier(.04,.44,.56,1)'});
      if(reel){const video=dialog.querySelector('video'),source=video.querySelector('source');if(source.dataset.src){source.src=source.dataset.src;delete source.dataset.src;video.load();}video.play().catch(()=>{});}
      else {
        if(!menuWave)menuWave=initWave(dialog.querySelector('canvas'),{colors:[[165,197,209],[255,255,255]],speed:.2,frequency:5.4,angle:-42});
        menuWave.setPaused(isPaused());
        animate(dialog.querySelector('canvas'),[{opacity:0,transform:'rotateX(90deg)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.2,1.2,.6,1)'});
        [...dialog.querySelectorAll('.menu-links>a')].forEach((el,i)=>animate(el,[{translate:'0 80px'},{translate:'0 0'}],{duration:600,delay:100+i*50,easing:'cubic-bezier(.04,.44,.56,1)',fill:'backwards'}));
        animate(dialog.querySelector('.menu-portrait img'),[{opacity:0,translate:'0 80px'},{opacity:1,translate:'0 0'}],{duration:600,delay:100,easing:'cubic-bezier(.04,.44,.56,1)',fill:'backwards'});
        [...dialog.querySelectorAll('.menu-portrait>a,.menu-social')].forEach(el=>animate(el,[{opacity:0,translate:'0 30px'},{opacity:1,translate:'0 0'}],{duration:600,delay:250,easing:'cubic-bezier(.04,.44,.56,1)',fill:'backwards'}));
      }
    }
    async function close(){if(closing||!dialog.open)return;closing=true;
      const a=animate(dialog,reel?[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-1100px) scale(.6)'}]:[{transform:'translateY(0) rotateX(0deg)'},{transform:'translateY(-700px) rotateX(90deg)'}],{duration:500,easing:reel?'cubic-bezier(.63,.02,.93,.37)':'cubic-bezier(.56,.02,1,.4)',fill:'forwards'});
      if(a)await a.finished.catch(()=>{});dialog.close();a?.cancel();closing=false;
    }
    trigger.addEventListener('click',open);closeButton.addEventListener('click',close);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
    dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();if(!reel)menuWave?.setPaused(true);trigger.setAttribute('aria-expanded','false');unlock();trigger.focus({preventScroll:true});});
  }
  setupDialog($('#menu'),$('.menu-button'),$('.menu-close'));
  setupDialog($('#showreel'),$('.hero-film'),$('.reel-close'),true);
  const film=$('.hero-film'),tilt=$('.film-tilt');
  film?.addEventListener('pointermove',event=>{if(isPaused()||event.pointerType==='touch')return;const rect=film.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;tilt.style.transform=`perspective(500px) rotateX(${y*18}deg) rotateY(${-x*18}deg)`;});
  film?.addEventListener('pointerleave',()=>{tilt.style.transform='perspective(500px) rotateX(0deg) rotateY(0deg)';});
  // Restore pages from the back/forward cache without a stuck overlay.
  addEventListener('pageshow',()=>{document.documentElement.classList.remove('page-leaving');refresh();});
  render();return {refresh};
}
