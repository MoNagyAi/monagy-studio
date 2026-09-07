(async function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
  const safeUrl = (value = "") => {
    const url = String(value).trim();
    return /^(https?:\/\/|mailto:|assets\/|breakdowns\/|\/)/i.test(url) ? url : "#";
  };
  const setText = (selector, value, root = document) => {
    const element = $(selector, root);
    if (element && value !== undefined) element.textContent = value;
  };
  const setBilingual = (selector, en, ar) => {
    const element = $(selector);
    if (!element) return;
    element.dataset.en = en || "";
    element.dataset.ar = ar || "";
    element.textContent = en || "";
  };

  let data = window.MONAGY_CONTENT || {};
  try {
    const response = await fetch("data/content.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.warn("Using bundled content fallback.", error);
  }

  const settings = data.settings || {};
  const site = $("#site");
  if (site) {
    site.style.setProperty("--studio-bg", settings.background || "#070707");
    site.style.setProperty("--studio-accent", settings.accent || "#d9a52a");
  }
  if (settings.pageTitle) document.title = settings.pageTitle;
  const meta = $('meta[name="description"]');
  if (meta && settings.metaDescription) meta.content = settings.metaDescription;
  setText(".classic-brand span:last-child", settings.brandName);

  const cover = $(".classic-hero .cover");
  if (cover && settings.cover) cover.src = safeUrl(settings.cover);
  document.querySelectorAll(".portrait, #about > img").forEach(image => {
    if (settings.profile) image.src = safeUrl(settings.profile);
  });

  setBilingual(".classic-hero .classic-eyebrow", settings.heroRoleEn, settings.heroRoleAr);
  setBilingual(".hero-bottom > p", settings.heroTextEn, settings.heroTextAr);
  setText("#about h2", settings.aboutTitleEn);
  setText("#about h3", settings.aboutTitleAr);
  setText("#about > div > p:not(.classic-eyebrow):not(.modern-arabic)", settings.aboutTextEn);
  setText("#about .modern-arabic", settings.aboutTextAr);
  setText(".producer-role-section h2", settings.roleTitleEn);
  setText(".producer-role-copy p:first-child", settings.roleTextEn);
  setText(".producer-role-copy p[dir='rtl']", settings.roleTextAr);
  setText("#contact h2", settings.contactTitleEn);
  setText("#contact > p:not(.classic-eyebrow):not([dir='rtl'])", settings.contactTextEn);
  setText("#contact > p[dir='rtl']", settings.contactTextAr);
  setText(".modern-footer h2", settings.brandName);

  document.querySelectorAll('a[href*="youtube.com"]').forEach(link => {
    if (settings.youtube) link.href = safeUrl(settings.youtube);
  });
  if (settings.email) {
    const emailLink = document.createElement("a");
    emailLink.className = "contact-secondary";
    emailLink.href = `mailto:${settings.email}`;
    emailLink.textContent = settings.email;
    const contactActions = $("#contact > div");
    if (contactActions) contactActions.prepend(emailLink);
  }

  const projects = $("#projects");
  const driveId = value => {
    const text = String(value || "").trim();
    const match = text.match(/\/d\/([^/]+)|[?&]id=([^&]+)/);
    return match ? (match[1] || match[2]) : (/^[\w-]{20,}$/.test(text) ? text : "");
  };
  const reference = (value, title, number) => {
    const id = driveId(value);
    const link = id ? `https://drive.google.com/file/d/${id}/view?usp=drivesdk` : safeUrl(value);
    const image = id ? `https://drive.google.com/thumbnail?id=${id}&sz=w900` : safeUrl(value);
    return `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(title)} visual reference ${number}"><img loading="lazy" src="${escapeHtml(image)}" alt="${escapeHtml(title)} visual reference ${number}"><span>${String(number).padStart(2, "0")}</span></a>`;
  };
  const visibleProjects = (data.projects || []).filter(project => project.visible !== false);
  if (projects && visibleProjects.length) projects.innerHTML = visibleProjects.map((project, index) => {
    const id = String(project.id || `project-${index + 1}`).replace(/[^a-z0-9_-]/gi, "-");
    const refs = (project.refs || []).filter(Boolean).slice(0, 6);
    return `
      <article class="modern-project" id="${escapeHtml(id)}">
        <div class="modern-project-number">${String(index + 1).padStart(2, "0")}</div>
        <div class="modern-video-shell"><iframe loading="lazy" src="https://www.youtube.com/embed/${escapeHtml(project.videoId)}?rel=0" title="${escapeHtml(project.titleEn)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        <div class="modern-project-copy"><p class="modern-project-type">${project.featured ? "FEATURED FILM" : "AI CINEMATIC FILM"}</p><h3>${escapeHtml(project.titleEn)}</h3><h4 dir="rtl">${escapeHtml(project.titleAr)}</h4><p>${escapeHtml(project.descriptionEn)}</p><p class="modern-arabic" dir="rtl">${escapeHtml(project.descriptionAr)}</p><div class="modern-breakdown-block"><div class="modern-breakdown-label"><span><strong>PROJECT BREAKDOWN PDF</strong><small>دراسة وتفاصيل تنفيذ المشروع</small></span></div><div class="modern-breakdown-actions"><a href="${escapeHtml(safeUrl(project.breakdownEn))}" target="_blank" rel="noreferrer">ENGLISH PDF ↗</a><a href="${escapeHtml(safeUrl(project.breakdownAr))}" target="_blank" rel="noreferrer">PDF العربية ↗</a></div></div></div>
        <div class="modern-references-block"><div class="modern-references-title"><span>SAMPLE OF VISUAL REFERENCES</span><small>نماذج من المراجع البصرية</small></div><div class="modern-reference-grid">${refs.map((item, refIndex) => reference(item, project.titleEn, refIndex + 1)).join("")}</div></div>
      </article>`;
  }).join("");

  const services = $("#servicesList");
  if (services && Array.isArray(data.services) && data.services.length) services.innerHTML = data.services.map((service, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(service.titleEn)}</strong><em dir="rtl">${escapeHtml(service.titleAr)}</em></div>`).join("");

  const workflow = $(".workflow-grid");
  if (workflow && Array.isArray(data.workflow) && data.workflow.length) workflow.innerHTML = data.workflow.map((step, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(step.titleEn)}</h3><h4 dir="rtl">${escapeHtml(step.titleAr)}</h4><p>${escapeHtml(step.descriptionEn)}</p>${step.detailEn ? `<p class="workflow-detail">${escapeHtml(step.detailEn)}</p>` : ""}${step.detailAr ? `<p class="workflow-detail modern-arabic" dir="rtl">${escapeHtml(step.detailAr)}</p>` : ""}</article>`).join("");

  const stack = $(".stack-list");
  if (stack && Array.isArray(data.tools) && data.tools.length) stack.innerHTML = data.tools.map(tool => `<span>${escapeHtml(tool)}</span>`).join("");
})();
