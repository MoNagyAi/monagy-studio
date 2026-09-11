(async function(){
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  const safe=(v='')=>/^(https?:\/\/|mailto:|tel:|\/|\.\/)/i.test(String(v).trim())?String(v).trim():'#';

  let data={};
  try{
    const res=await fetch('data/pricing.json',{cache:'no-store'});
    if(!res.ok) throw new Error('pricing data failed');
    data=await res.json();
  }catch(err){
    console.error(err);
    $('#pricingTable').innerHTML='<tbody><tr><td>Pricing data is unavailable.</td></tr></tbody>';
    return;
  }

  let lang=(localStorage.getItem('monagyPricingLanguage')||data.settings?.defaultLanguage||'en')==='ar'?'ar':'en';
  const page=$('#pricingPage');
  const table=$('#pricingTable');

  function render(){
    const settings=data.settings||{};
    const block=lang==='ar'?(data.arabic||{}):(data.english||{});
    const packages=Array.isArray(block.packages)?block.packages:[];
    const rows=Array.isArray(block.rows)?block.rows:[];
    page.dir=lang==='ar'?'rtl':'ltr';
    document.documentElement.lang=lang;
    $('#pricingEyebrow').textContent=lang==='ar'?(settings.eyebrowAr||''):(settings.eyebrowEn||'');
    $('#pricingTitle').textContent=lang==='ar'?(settings.titleAr||''):(settings.titleEn||'');
    $('#pricingNote').textContent=lang==='ar'?(settings.noteAr||''):(settings.noteEn||'');
    $$('.language-switch button').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));

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
  }

  $$('.language-switch button').forEach(btn=>btn.addEventListener('click',()=>{
    lang=btn.dataset.lang==='ar'?'ar':'en';
    localStorage.setItem('monagyPricingLanguage',lang);
    render();
  }));

  render();
})();
