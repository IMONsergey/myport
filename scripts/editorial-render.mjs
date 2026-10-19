export function createEditorial({url,e,img,cover,cats,projects,route,stories,workTable,portrait}) {
  const sOf=(p)=>stories[p.id]||{};
  const numbered=i=>String(i+1).padStart(2,'0');
  const asset=(m,cls='',sizes='100vw')=>img(m,{cls,sizes});
  const projectLink=p=>url(route(p));
  const caseTags=(p,s)=>`<div class="case-tags">${[cats[p.category],...(s.features||[]).slice(0,3)].map(t=>`<span>${e(t)}</span>`).join('')}</div>`;
  function imageFigure(m,p,n,layout='half'){
    const text=m.alt||`${p.title}: визуальные материалы проекта`;
    return `<figure class="editorial-media editorial-media--${layout}">
      <button type="button" class="media-open" data-media-src="${url(m.src)}" data-media-alt="${e(text)}" aria-label="Увеличить изображение: ${e(text)}">
        ${asset(m,'editorial-media-image',layout==='half'?'(max-width: 809px) 100vw, 48vw':'100vw')}
        <span class="media-expand" aria-hidden="true">↗</span>
      </button>
      <figcaption><span>${numbered(n)} / ${String(p.media.length).padStart(2,'0')}</span><span>${e(text)}</span></figcaption>
    </figure>`;
  }
  function casePage(p,i){
    const s=sOf(p),archived=s.kind==='archive',media=p.media||[];
    const related=projects.filter(x=>x.id!==p.id).map((x,j)=>({p:x,score:(x.category===p.category?5:0)+(stories[x.id]?.priority?2:0)+(x.cover?1:0),j})).sort((a,b)=>b.score-a.score||a.j-b.j).slice(0,3).map(x=>x.p);
    const next=projects[(i+1)%projects.length];
    const summary=p.summary||s.short||'';
    const meta=[['Проект',p.kicker],['Направление',cats[p.category]],['Участие',p.credit],...(p.year?[['Год',p.year]]:[])];
    const hero=`<header class="case-heading section" id="case-intro">
      <div class="case-intro-main">
        <div class="case-overline"><span>ПОРТФОЛИО / ${numbered(i)} — ${String(projects.length).padStart(2,'0')}</span><a href="${url('works/')}" class="case-back">← Все проекты</a></div>
        <p class="case-intro-kind">${e(s.priority||'Выбранная работа')}</p>
        <h1>${e(p.title)}</h1>
        <p class="case-intro-lead">${e(s.lead||summary)}</p>
        ${caseTags(p,s)}
      </div>
      <dl class="case-meta">${meta.map(([title,value])=>`<div><dt>${title}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
    </header>`;
    const image=`<div class="editorial-cover editorial-cover--${s.kind||p.category}" style="--case-accent:${e(s.accent||'#bac7c9')}">
      <div class="editorial-cover-top"><span>OTCHESKOV. / SELECTED WORK</span><span>${e(p.kicker)} ↘</span></div>
      <div class="editorial-cover-art">${cover(p,{eager:true,sizes:'100vw'})}</div>
      <div class="editorial-cover-bottom"><span>${e(p.title)}</span><span>${e(s.short||cats[p.category])}</span></div>
    </div>`;
    const overview=`<section class="case-overview section">
      <div class="case-section-index"><span>01 / КОНТЕКСТ И РЕШЕНИЕ</span><span>CASE STUDY</span></div>
      <div class="case-overview-grid">
        <div><span class="eyebrow">ЗАДАЧА</span><h2>${e(p.sections[0]?.title||'Понять задачу.')}</h2><p>${e(s.context||p.sections[0]?.text||'')}</p></div>
        <div><span class="eyebrow">ПОДХОД</span><p class="case-pull">${e(s.approach||p.sections[1]?.text||summary)}</p></div>
      </div>
    </section>`;
    const details=`<section class="case-decisions section">
      <div class="case-section-index"><span>02 / СИСТЕМА</span><span>${e(cats[p.category]).toUpperCase()}</span></div>
      <div class="case-decisions-grid">
        <div class="case-decisions-intro"><span class="eyebrow">ОСНОВНЫЕ ЭЛЕМЕНТЫ</span><h2>${e(p.sections[1]?.title||'Визуальная система.')}</h2><p>${e(p.sections[1]?.text||s.approach||'')}</p></div>
        <div class="case-decisions-list">${(s.features||[]).map((f,j)=>`<div><span>${numbered(j)}</span><h3>${e(f)}</h3><span class="decision-arrow" aria-hidden="true">↗</span></div>`).join('')}</div>
      </div>
    </section>`;
    const gallery=media.length?`<section class="case-visual-story">
       <div class="section case-section-index"><span>03 / ВИЗУАЛЬНЫЕ МАТЕРИАЛЫ</span><span>${media.length} ${media.length===1?'КАДР':'КАДРОВ'}</span></div>
       <div class="case-gallery-editorial">${media.map((m,j)=>{
         const phase=j%5,layout=phase===0?'full':phase===3?'wide':'half';
         return imageFigure(m,p,j,layout);
       }).join('')}</div>
     </section>`:'';
    const archive=archived?`<section class="archive-note section"><span class="eyebrow">АРХИВНАЯ ЗАПИСЬ</span><h2>Материалы — в оригинальной публикации.</h2><p>${e(s.note||'Галерея проекта пока не перенесена в портфолио.')}</p></section>`:'';
    const links=[
      ...(p.live?[{url:p.live,title:'Открыть работающий сайт',external:true}]:[]),
      ...p.sources.filter((source,j,all)=>j===all.findIndex(x=>new URL(x.url).hostname===new URL(source.url).hostname)).map(source=>({url:source.url,title:source.url.includes('dprofile.ru')?'Посмотреть публикацию на Dprofile':source.url.includes('github.com')?'Посмотреть репозиторий':'Исходный кейс I’MON'}))
    ];
    const source=`<section class="case-summary section">
      <div class="case-section-index"><span>${archived?'02':'04'} / ИТОГ И ИСТОЧНИКИ</span><span>PROJECT RECORD</span></div>
      <div class="case-summary-grid">
        <div><span class="eyebrow">ЧТО ПОКАЗАНО</span><h2>${archived?'Запись в портфолио.':'От идеи к системе.'}</h2><p>${e(s.note||'Материалы демонстрируют визуальный язык проекта, структуру решения и реализованные форматы.')}</p></div>
        <div class="case-summary-meta"><span class="eyebrow">УЧАСТИЕ И ССЫЛКИ</span><p>${e(p.credit)}</p>${links.map(l=>`<a href="${e(l.url)}" target="_blank" rel="noopener noreferrer">${e(l.title)} <span aria-hidden="true">↗</span></a>`).join('')}</div>
      </div>
    </section>`;
    const relatedHTML=`<section class="case-more section"><div class="case-section-index"><span>ДАЛЬШЕ</span><a href="${url('works/')}">Все проекты ↗</a></div><h2>Возможно, вам будет интересно.</h2><div class="case-more-grid">${related.map(x=>`<a href="${projectLink(x)}" class="case-more-card"><div class="case-more-image">${cover(x,{sizes:'(max-width:809px) 100vw,33vw'})}</div><div><h3>${e(x.title)}</h3><span>${e(cats[x.category])} ↗</span></div></a>`).join('')}</div></section><a class="case-next" href="${projectLink(next)}"><span>СЛЕДУЮЩАЯ РАБОТА <span aria-hidden="true">↗</span></span><strong>${e(next.title)}</strong></a>`;
    const dialog=`<dialog id="media-lightbox" aria-label="Просмотр изображения"><button type="button" class="media-close" aria-label="Закрыть просмотр">Закрыть <span aria-hidden="true">×</span></button><div class="media-lightbox-content"><img alt="Увеличенное изображение" width="1200" height="800" loading="eager" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="><p class="media-lightbox-caption"></p></div></dialog>`;
    return `<article class="case case-v4 case-v4--${e(s.kind||p.category)}" style="--case-accent:${e(s.accent||'#78c6b5')}" data-project="${e(p.id)}"><div class="case-progress" aria-hidden="true"></div>${hero}${image}${overview}${gallery}${archived?archive:details}${source}${relatedHTML}</article>${dialog}`;
  }
  const selectedIds=['apcosys','debt-tech','orla','avito-avto'];
  function featureSection(){
    const selected=selectedIds.map(id=>projects.find(p=>p.id===id)).filter(Boolean);
    return `<section class="feature-stories section" id="featured">
      <div class="section-header"><span>01 / ИЗБРАННЫЕ ПРОЕКТЫ</span><span>ПРОЕКТ / СИСТЕМА / РЕЗУЛЬТАТ</span></div>
      <h2>Не просто изображения.<br><em>Решения в действии.</em></h2>
      <div class="feature-grid">${selected.map((p,i)=>{
        const s=sOf(p);
        return `<a class="feature-card feature-card--${i%2?'alt':'primary'}" href="${projectLink(p)}" style="--feature-color:${e(s.accent||'#9ecfc6')}"><div class="feature-image">${cover(p,{sizes:'(max-width:809px) 100vw,55vw'})}</div><div class="feature-detail"><span>${numbered(i)} / ${e(cats[p.category])}</span><h3>${e(p.title)}</h3><p>${e(s.lead||p.summary)}</p><span class="feature-cta">Изучить кейс <span aria-hidden="true">↗</span></span></div></a>`;
      }).join('')}</div>
    </section>`;
  }
  function portfolioCta(){
    return `<section class="cta-scene portfolio-cta">
      <div class="portfolio-cta-grid" aria-hidden="true"><span>O.</span><span>∕</span><span>D.</span></div>
      <div class="portfolio-cta-content section"><div class="section-header"><span>06 / НОВЫЙ ПРОЕКТ</span><span>LET'S MAKE IT REAL</span></div>
      <h2>Есть сложная<br>задача? <em>Обсудим.</em></h2>
      <div class="portfolio-cta-bottom"><p>Стратегия, бренд, цифровой продукт или вся система целиком. Начнём с задачи, а не с готового шаблона.</p>
      <a href="${url('contact/')}" class="portfolio-cta-link">Написать о проекте <span aria-hidden="true">↗</span></a></div></div>
    </section>`;
  }
  function homePage(){
    const heroArt=['apcosys','debt-tech','serenity'].map(id=>projects.find(p=>p.id===id)).filter(Boolean);
    const services=[
      ['01','Стратегия & бренд','Позиционирование, визуальная идентичность, система коммуникации.',projects.find(x=>x.id==='serenity')],
      ['02','Digital & UX','Сайты, интерфейсы, продуктовая архитектура и дизайн-системы.',projects.find(x=>x.id==='apcosys')],
      ['03','Experience & motion','Сценические истории, анимация, интерактивные проекты.',projects.find(x=>x.id==='debt-tech')],
      ['04','Creative development','От дизайн-концепции до работающего цифрового продукта.',projects.find(x=>x.id==='apcosys')]
    ];
    return `<div class="portfolio-home">
      <section class="hero-stack portfolio-hero">
        <div class="hero-stage">
          <div class="hero-art" aria-hidden="true">${heroArt.map((p,i)=>`<div class="hero-art-tile hero-art-tile--${i}">${cover(p,{eager:i<2,sizes:'40vw'})}</div>`).join('')}</div>
          <div class="hero-content">
            <div class="hero-topline"><span>СЕРГЕЙ ОТЧЕСКОВ</span><span>ДИЗАЙН / ТЕХНОЛОГИИ / СИСТЕМЫ</span></div>
            <h1 aria-label="Бренды. Продукты. Системы."><span class="hero-line">БРЕНДЫ.</span><span class="hero-middle"><span>ПРОДУКТЫ.</span></span><span class="hero-line">СИСТЕМЫ.</span></h1>
            <div class="hero-bottom"><div><span class="eyebrow">АРХИТЕКТУРА БРЕНДОВ И ЦИФРОВЫХ СИСТЕМ</span><p>Соединяю стратегию, визуальный язык и разработку. От первой идеи — до работающего продукта.</p></div>
            <button class="hero-film" type="button" aria-label="Смотреть работы" aria-haspopup="dialog" aria-controls="showreel"><span class="film-tilt"><span class="hero-film-label">Смотреть<br>работы <span aria-hidden="true">↗</span></span>${cover(projects.find(p=>p.id==='avito-avto'),{sizes:'260px'})}</span></button>
            <div class="hero-disciplines"><span>НАПРАВЛЕНИЯ</span><span>Брендинг<br>Цифровые продукты<br>Презентационные системы<br>Интерактивные решения</span></div></div>
            <div class="hero-meta"><span>SAINT PETERSBURG / WORLDWIDE</span><a href="${url('works/')}">ЛИСТАЙТЕ ВНИЗ <span aria-hidden="true">↓</span></a></div>
          </div>
          <button class="motion-toggle" type="button" aria-pressed="false">Пауза анимации</button>
        </div>
        <div class="hero-scroll"><section class="selected">${featureSection()}</section></div>
      </section>
      <dialog id="showreel" aria-label="Избранные работы"><div class="showreel-slides">${selectedIds.map((id,i)=>{const p=projects.find(x=>x.id===id);return `<div class="showreel-slide" style="--slide:${i}">${cover(p,{sizes:'100vw'})}<span class="showreel-label">${e(p.title)} <small>0${i+1} / 04</small></span></div>`;}).join('')}</div><div class="showreel-instructions">OTCHESKOV.DIGITAL / SELECTED WORK</div><button class="reel-close" type="button" aria-label="Закрыть просмотр">Закрыть <i aria-hidden="true"></i></button></dialog>
      <section class="home-index section"><div class="section-header"><span>02 / INDEX</span><span>16 ВЫБРАННЫХ РАБОТ</span></div><div class="home-index-intro"><h2>Работы<span class="serif-dot">.</span></h2><p>Каждый проект — отдельный контекст, задачи и решения. Ниже — полный каталог.</p></div>${workTable(projects.slice(0,8),'ПРОЕКТЫ')}<a class="home-all-works" href="${url('works/')}">Смотреть все 16 проектов <span aria-hidden="true">↗</span></a></section>
      <section class="home-practice"><div class="section home-practice-inner"><div class="section-header"><span>03 / ПОДХОД</span><span>DESIGN / ARCHITECTURE / EXECUTION</span></div><h2>Дизайн имеет смысл,<br>когда <em>всё связано.</em></h2><div class="practice-notes"><p>Я смотрю на проект целиком: от бизнес-задачи и сценария человека до визуальной системы, движения и реализации.</p><p>Не разделяю красоту и работу интерфейса. Структура, типографика и код должны поддерживать одну идею.</p></div><div class="home-practice-art">${cover(projects.find(p=>p.id==='apcosys'),{sizes:'50vw'})}${cover(projects.find(p=>p.id==='prp'),{sizes:'50vw'})}</div></div></section>
      <section class="home-services section"><div class="section-header"><span>04 / ЧТО Я ДЕЛАЮ</span><span>ОТ ИДЕИ ДО ЗАПУСКА</span></div><h2>Один подход.<br><em>Разные масштабы.</em></h2><div class="home-service-list">${services.map(([n,t,d,p])=>`<a href="${projectLink(p)}"><span>${n}</span><h3>${t}</h3><p>${d}</p><span class="home-service-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>
      <section class="home-about"><div class="home-about-photo">${img(portrait,{sizes:'(max-width:809px) 100vw,40vw'})}</div><div class="home-about-copy"><div class="section-header"><span>05 / ОБ АВТОРЕ</span><span>OTCHESKOV. / I’MON</span></div><h2>Личное<br><em>внимание.</em><br>Системный<br>подход.</h2><p>Дизайнер, арт-директор и основатель I’MON. Работаю самостоятельно или с командой под конкретную задачу. Важны не только первые кадры, но и то, как решение работает после запуска.</p><a href="${url('about/')}">Обо мне и моём подходе <span aria-hidden="true">↗</span></a></div></section>
      ${portfolioCta()}
    </div>`;
  }
  return {casePage,homePage,portfolioCta,featureSection};
}
