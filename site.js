(function () {
  const data = window.MONAGY_CONTENT;
  const projects = document.getElementById("projects");
  const ref = (id, title, n) => `<a href="https://drive.google.com/file/d/${id}/view?usp=drivesdk" target="_blank" rel="noreferrer" aria-label="${title} visual reference ${n}"><img loading="lazy" src="https://drive.google.com/thumbnail?id=${id}&sz=w900" alt="${title} visual reference ${n}"><span>${String(n).padStart(2,"0")}</span></a>`;
  projects.innerHTML = data.projects.map((p, i) => `
    <article class="modern-project" id="${p.id}">
      <div class="modern-project-number">${String(i + 1).padStart(2,"0")}</div>
      <div class="modern-video-shell"><iframe loading="lazy" src="https://www.youtube.com/embed/${p.videoId}?rel=0" title="${p.titleEn}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
      <div class="modern-project-copy"><p class="modern-project-type">${p.featured ? "FEATURED FILM" : "AI CINEMATIC FILM"}</p><h3>${p.titleEn}</h3><h4 dir="rtl">${p.titleAr}</h4><p>${p.descriptionEn}</p><p class="modern-arabic" dir="rtl">${p.descriptionAr}</p><div class="modern-breakdown-block"><div class="modern-breakdown-label"><span><strong>PROJECT BREAKDOWN PDF</strong><small>دراسة وتفاصيل تنفيذ المشروع</small></span></div><div class="modern-breakdown-actions"><a href="${p.breakdownEn}" target="_blank" rel="noreferrer">ENGLISH PDF ↗</a><a href="${p.breakdownAr}" target="_blank" rel="noreferrer">PDF العربية ↗</a></div></div></div>
      <div class="modern-references-block"><div class="modern-references-title"><span>SAMPLE OF VISUAL REFERENCES</span><small>نماذج من المراجع البصرية</small></div><div class="modern-reference-grid">${p.refs.map((id,n)=>ref(id,p.titleEn,n+1)).join("")}</div></div>
    </article>`).join("");

  const servicesEn = ["Generative AI Filmmaking","Creative Direction","Cinematic Storytelling","Branded Content & Campaigns","Character Consistency & Visual Development","AI Media Production","Virtual Production & Post","Custom AI Production Workflows","AI Music & Sound Design"];
  const servicesAr = ["صناعة الأفلام بالذكاء الاصطناعي","الإخراج الإبداعي","السرد السينمائي","المحتوى الدعائي والحملات","اتساق الشخصيات والتطوير البصري","إنتاج الميديا بالذكاء الاصطناعي","الإنتاج الافتراضي وما بعد الإنتاج","مسارات إنتاج مخصصة بالذكاء الاصطناعي","الموسيقى وتصميم الصوت بالذكاء الاصطناعي"];
  document.getElementById("servicesList").innerHTML = servicesEn.map((s,i)=>`<div><span>${String(i+1).padStart(2,"0")}</span><strong>${s}</strong><em dir="rtl">${servicesAr[i]}</em></div>`).join("");

  let arabic = false;
  document.getElementById("languageButton").addEventListener("click", function () {
    arabic = !arabic;
    document.documentElement.lang = arabic ? "ar" : "en";
    document.getElementById("site").dir = arabic ? "rtl" : "ltr";
    document.querySelectorAll("[data-en][data-ar]").forEach(el => el.textContent = el.dataset[arabic ? "ar" : "en"]);
    this.textContent = arabic ? "English" : "العربية";
  });
})();
