(function editorialScript(){
  const doc=document;
  const dialog=doc.getElementById('media-lightbox');
  if(dialog){
    const screen=dialog.querySelector('img');
    const caption=dialog.querySelector('.media-lightbox-caption');
    const close=dialog.querySelector('.media-close');
    let restoreFocus=null;
    for(const button of doc.querySelectorAll('.media-open[data-media-src]')){
      button.addEventListener('click',()=>{
        restoreFocus=button;
        screen.src=button.dataset.mediaSrc;
        screen.alt=button.dataset.mediaAlt||'Визуальные материалы проекта';
        caption.textContent=screen.alt;
        dialog.showModal();
        doc.body.classList.add('media-is-open');
        close?.focus();
      });
    }
    const finish=()=>{doc.body.classList.remove('media-is-open');screen.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';restoreFocus?.focus({preventScroll:true});};
    close?.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',finish);
  }
  const indicator=doc.querySelector('.case-v4 .case-progress');
  if(indicator){
    let frame=0;
    const update=()=>{
      frame=0;
      const scrolling=doc.documentElement;
      const max=Math.max(1,scrolling.scrollHeight-innerHeight);
      const percent=Math.min(100,Math.max(0,scrollY/max*100));
      indicator.style.width=percent.toFixed(2)+'%';
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    update();
  }
  const home=doc.querySelector('.portfolio-home');
  if(home){
    const art=[...doc.querySelectorAll('.hero-art-tile')];
    let raf=0,pointer={x:0,y:0};
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    const move=()=>{
      raf=0;
      if(reduce.matches)return;
      art.forEach((tile,i)=>{
        const shift=(i+1)*5;
        tile.style.translate=`${(pointer.x*shift).toFixed(2)}px ${(pointer.y*shift).toFixed(2)}px`;
      });
    };
    const hero=doc.querySelector('.hero-stage');
    hero?.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch'||reduce.matches)return;
      const rect=hero.getBoundingClientRect();
      pointer={x:(event.clientX-rect.left)/Math.max(rect.width,1)-.5,y:(event.clientY-rect.top)/Math.max(rect.height,1)-.5};
      if(!raf)raf=requestAnimationFrame(move);
    },{passive:true});
    hero?.addEventListener('pointerleave',()=>{
      pointer={x:0,y:0};
      if(!raf)raf=requestAnimationFrame(move);
    });
  }
})();
