const menu=document.querySelector('#menu');
const menuButton=document.querySelector('.menu-button');
menuButton?.addEventListener('click',()=>{menu.showModal();document.body.classList.add('menu-is-open');menuButton.setAttribute('aria-expanded','true');});
const closeMenu=()=>menu.close();
document.querySelector('.menu-close')?.addEventListener('click',closeMenu);
menu?.addEventListener('close',()=>{document.body.classList.remove('menu-is-open');menuButton.setAttribute('aria-expanded','false');menuButton.focus();});
menu?.addEventListener('click',event=>{if(event.target===menu)closeMenu();});
const params=new URLSearchParams(location.search);
function filterProjects(category){
 const valid=['all','digital','brand','events'];if(!valid.includes(category))category='all';
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
 let count=0;document.querySelectorAll('.catalogue [data-category]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden)count++;});
 const status=document.querySelector('.filter-count');if(status)status.textContent=`${count} ${count===1?'проект':count>1&&count<5?'проекта':'проектов'}`;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filterProjects(button.dataset.filter);const next=new URL(location.href);if(button.dataset.filter==='all')next.searchParams.delete('category');else next.searchParams.set('category',button.dataset.filter);history.replaceState(null,'',next);}));
if(document.querySelector('.catalogue'))filterProjects(params.get('category')||'all');
const toast=document.querySelector('.toast');let toastTimer;
function notify(text){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);}
document.querySelector('.copy-email')?.addEventListener('click',async event=>{const button=event.currentTarget;try{await navigator.clipboard.writeText(button.dataset.email);notify('Адрес скопирован');button.textContent='Скопировано ✓';setTimeout(()=>button.textContent='Скопировать ↗',2500);}catch{notify('Адрес почты: '+button.dataset.email);const range=document.createRange();range.selectNodeContents(document.querySelector('.email'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}});
document.querySelector('.back-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
