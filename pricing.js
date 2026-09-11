(async function(){
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  const safe=(v='')=>/^(https?:\/\/|mailto:|tel:|\/|\.\/)/i.test(String(v).trim())?String(v).trim():'#';

  let data={};
  let faqData={};
  try{
    const [pricingRes,faqRes]=await Promise.all([
      fetch('data/pricing.json',{cache:'no-store'}),
      fetch('data/faq.json',{cache:'no-store'})
    ]);
    if(!pricingRes.ok) throw new Error('pricing data failed');
    data=await pricingRes.json();
    if(faqRes.ok) faqData=await faqRes.json();
  }catch(err){
    console.error(err);
    $('#pricingTable').innerHTML='<tbody><tr><td>Pricing data is unavailable.</td></tr></tbody>';
    return;
  }

  let lang=(localStorage.getItem('monagyPricingLanguage')||data.settings?.defaultLanguage||'en')==='ar'?'ar':'en';
  const categoryKeys=['cinematic','threeD','lipSync'].filter(key=>data[key]);
  let category=localStorage.getItem('monagyPricingCategory')||data.settings?.defaultCategory||categoryKeys[0]||'cinematic';
  if(!categoryKeys.includes(category)) category=categoryKeys[0]||'cinematic';

  const page=$('#pricingPage');
  const table=$('#pricingTable');

  function ensureCategorySwitch(){
    let switcher=$('#pricingCategorySwitch');
    if(switcher) return switcher;
    switcher=document.createElement('div');
    switcher.id='pricingCategorySwitch';
    switcher.className='pricing-category-switch';
    switcher.setAttribute('role','tablist');
    switcher.setAttribute('aria-label','Pricing categories');
    const hero=$('.pricing-hero');
    if(hero) hero.appendChild(switcher);
    return switcher;
  }

  function renderFaq(){
    const title=$('#faqTitle');
    const intro=$('#faqIntro');
    const list=$('#faqList');
    if(!title||!intro||!list) return;
    title.textContent=lang==='ar'?(faqData.titleAr||'الأسئلة الشائعة'):(faqData.titleEn||'Frequently Asked Questions');
    intro.textContent=lang==='ar'?(faqData.introAr||''):(faqData.introEn||'');
    const items=lang==='ar'?(faqData.arabic||[]):(faqData.english||[]);
    list.innerHTML=items.map((item,index)=>
      '<details class="faq-item"'+(index===0?' open':'')+'><summary>'+esc(item.question||'')+'</summary><div class="faq-answer">'+esc(item.answer||'')+'</div></details>'
    ).join('');
  }

  function render(){
    const settings=data.settings||{};
    const categoryData=data[category]||{};
    const block=lang==='ar'?(categoryData.arabic||{}):(categoryData.english||{});
    const packages=Array.isArray(block.packages)?block.packages:[];
    const rows=Array.isArray(block.rows)?block.rows:[];

    page.dir=lang==='ar'?'rtl':'ltr';
    document.documentElement.lang=lang;
    $('#pricingEyebrow').textContent=lang==='ar'?(settings.eyebrowAr||''):(settings.eyebrowEn||'');
    $('#pricingTitle').textContent=lang==='ar'?(settings.titleAr||''):(settings.titleEn||'');
    $('#pricingNote').textContent=lang==='ar'?(categoryData.noteAr||settings.noteAr||''):(categoryData.noteEn||settings.noteEn||'');
    $$('.language-switch button').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));

    const categorySwitch=ensureCategorySwitch();
    categorySwitch.innerHTML=categoryKeys.map(key=>{
      const item=data[key]||{};
      const label=lang==='ar'?(item.labelAr||key):(item.labelEn||key);
      return '<button type="button" role="tab" data-category="'+esc(key)+'" class="'+(key===category?'active':'')+'">'+esc(label)+'</button>';
    }).join('');
    $$('button[data-category]',categorySwitch).forEach(btn=>btn.addEventListener('click',()=>{
      category=btn.dataset.category;
      localStorage.setItem('monagyPricingCategory',category);
      render();
    }));

    let html='<thead><tr><th>'+esc(block.firstColumnLabel||'')+'</th>';
    packages.forEach(pkg=>{
      html+='<th class="package-head">'+
        '<span class="package-price">'+esc(pkg.price||'')+'</span>'+
        '<span class="package-name">'+esc(pkg.name||'')+'</span>'+
        '<span class="package-tagline">'+esc(pkg.tagline||'')+'</span>'+
        '<span class="package-summary">'+esc(pkg.summary||'')+'</span>'+
      '</th>';
    });
    html+='</tr></thead><tbody>';

    rows.forEach(row=>{
      const cells=Array.isArray(row.cells)?row.cells:[];
      html+='<tr class="'+(row.emphasis?'emphasis-row':'')+'"><td class="feature-label">'+esc(row.label||'')+'</td>';
      packages.forEach((_,i)=>{html+='<td>'+esc(cells[i]??'—')+'</td>';});
      html+='</tr>';
    });

    html+='<tr class="pricing-select-row"><td></td>';
    packages.forEach(pkg=>{
      html+='<td><a class="select-btn" target="_blank" rel="noreferrer" href="'+esc(safe(pkg.buttonUrl||''))+'">'+esc(pkg.buttonLabel||(lang==='ar'?'اختيار':'Select'))+'</a></td>';
    });
    html+='</tr></tbody>';
    table.dir=page.dir;
    table.innerHTML=html;
    renderFaq();
  }

  $$('.language-switch button').forEach(btn=>btn.addEventListener('click',()=>{
    lang=btn.dataset.lang==='ar'?'ar':'en';
    localStorage.setItem('monagyPricingLanguage',lang);
    render();
  }));

  render();
})();
