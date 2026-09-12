(async function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
  const safeUrl = (value = "") => {
    const url = String(value || "").trim();
    return /^(https?:\/\/|mailto:|tel:|assets\/|breakdowns\/|\/)/i.test(url) ? url : "#";
  };
  const setElementText = (element, value) => {
    if (element && value !== undefined && value !== null) element.textContent = value;
  };
  const setText = (selector, value, root = document) => setElementText($(selector, root), value);
  const setBilingual = (selector, en, ar) => {
    const element = $(selector);
    if (!element) return;
    if (en !== undefined) element.dataset.en = en || "";
    if (ar !== undefined) element.dataset.ar = ar || "";
    if (en !== undefined) element.textContent = en || "";
  };
  const setSplitHeading = (selector, line1, line2) => {
    const element = $(selector);
    if (!element || (line1 === undefined && line2 === undefined)) return;
    element.innerHTML = `${escapeHtml(line1 || "")}${line2 !== undefined ? `<br><em>${escapeHtml(line2 || "")}</em>` : ""}`;
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
  const navigation = data.navigation || {};
  const hero = data.hero || {};
  const bio = data.bio || {};
  const filmsSection = data.filmsSection || {};
  const about = data.about || {};
  const role = data.role || {};
  const servicesSection = data.servicesSection || {};
  const workflowSection = data.workflowSection || {};
  const stackSection = data.stackSection || {};
  const contact = data.contact || {};
  const footer = data.footer || {};

  const site = $("#site");
  if (site) {
    site.style.setProperty("--studio-bg", settings.background || "#070707");
    site.style.setProperty("--studio-accent", settings.accent || "#d9a52a");
    if (settings.panel) site.style.setProperty("--panel", settings.panel);
    if (settings.text) site.style.setProperty("--text", settings.text);
    if (settings.muted) site.style.setProperty("--muted", settings.muted);
  }
  const grain = $(".grain");
  if (grain && settings.showGrain === false) grain.hidden = true;
  if (settings.pageTitle) document.title = settings.pageTitle;
  const meta = $('meta[name="description"]');
  if (meta && settings.metaDescription) meta.content = settings.metaDescription;

  setText(".classic-brand span:last-child", settings.brandName);
  setText(".modern-footer h2", settings.brandName);

  const brandMark = $(".brand-mark");
  if (brandMark && settings.logoMark) brandMark.src = safeUrl(settings.logoMark);
  const iconUrl = settings.favicon || settings.logoMark;
  if (iconUrl) {
    $$('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => { link.href = safeUrl(iconUrl); });
  }

  const cover = $(".classic-hero .cover");
  if (cover && settings.cover) cover.src = safeUrl(settings.cover);
  $$(".portrait, #about > img").forEach(image => {
    if (settings.profile) image.src = safeUrl(settings.profile);
  });

  const navMap = [
    ["#films", navigation.filmsEn, navigation.filmsAr],
    ["#about", navigation.aboutEn, navigation.aboutAr],
    ["#bio", navigation.resumeEn, navigation.resumeAr],
    ["#services", navigation.servicesEn, navigation.servicesAr],
    ["#contact", navigation.contactEn, navigation.contactAr]
  ];
  navMap.forEach(([href, en, ar]) => {
    const link = $(`.topbar nav a[href="${href}"]`);
    if (!link) return;
    setElementText($(".nav-label-en", link), en);
    setElementText($(".nav-label-ar", link), ar);
  });

  setBilingual(".classic-hero .classic-eyebrow", hero.roleEn, hero.roleAr);
  setBilingual(".hero-bottom > p", hero.textEn, hero.textAr);
  setText(".showreel-en", hero.buttonEn);
  setText(".showreel-ar", hero.buttonAr);
  const heroHeading = $(".identity h1");
  if (heroHeading && (hero.namePrefix !== undefined || hero.nameAccent !== undefined || hero.nameLine2 !== undefined)) {
    heroHeading.innerHTML = `${escapeHtml(hero.namePrefix || "")}<span>${escapeHtml(hero.nameAccent || "")}</span><br>${escapeHtml(hero.nameLine2 || "")}`;
  }

  const bioParagraphs = $$("#bio .bio-copy > p");
  setElementText(bioParagraphs[0], bio.eyebrow);
  setElementText(bioParagraphs[1], bio.textEn);
  setElementText(bioParagraphs[2], bio.textAr);
  const resumeStrong = $("#bio .resume-label strong");
  const resumeSmall = $("#bio .resume-label small");
  if (resumeStrong) {
    if (bio.resumeTitleEn !== undefined) resumeStrong.dataset.en = bio.resumeTitleEn || "";
    if (bio.resumeTitleAr !== undefined) resumeStrong.dataset.ar = bio.resumeTitleAr || "";
    setElementText(resumeStrong, bio.resumeTitleEn);
  }
  if (resumeSmall) {
    if (bio.resumeIntroEn !== undefined) resumeSmall.dataset.en = bio.resumeIntroEn || "";
    if (bio.resumeIntroAr !== undefined) resumeSmall.dataset.ar = bio.resumeIntroAr || "";
    setElementText(resumeSmall, bio.resumeIntroEn);
  }
  const resumeRows = $$("#bio .resume-lang-row");
  if (resumeRows[0]) {
    setElementText($(".resume-lang-name", resumeRows[0]), bio.resumeEnLabel);
    const links = $$("a", resumeRows[0]);
    if (links[0] && bio.resumeEnView !== undefined) links[0].href = safeUrl(bio.resumeEnView);
    if (links[1] && bio.resumeEnDownload !== undefined) links[1].href = safeUrl(bio.resumeEnDownload);
  }
  if (resumeRows[1]) {
    setElementText($(".resume-lang-name", resumeRows[1]), bio.resumeArLabel);
    const links = $$("a", resumeRows[1]);
    if (links[0] && bio.resumeArView !== undefined) links[0].href = safeUrl(bio.resumeArView);
    if (links[1] && bio.resumeArDownload !== undefined) links[1].href = safeUrl(bio.resumeArDownload);
  }

  setText("#films .modern-section-heading .classic-eyebrow", filmsSection.eyebrow);
  setSplitHeading("#films .modern-section-heading h2", filmsSection.titleLine1En, filmsSection.titleLine2En);
  setText("#films .modern-section-note", filmsSection.noteEn);
  const filmArNotes = $$("#films .modern-section-heading-note p");
  setElementText(filmArNotes[0], filmsSection.noteAr);
  setElementText(filmArNotes[1], filmsSection.commercialNoteAr);

  setText("#about .classic-eyebrow", about.eyebrow);
  setText("#about h2", about.titleEn);
  setText("#about h3", about.titleAr);
  setText("#about > div > p:not(.classic-eyebrow):not(.modern-arabic)", about.textEn);
  setText("#about .modern-arabic", about.textAr);

  setText(".producer-role-section .classic-eyebrow", role.eyebrow);
  setText(".producer-role-section h2", role.titleEn);
  setText(".producer-role-copy p:first-child", role.textEn);
  setText(".producer-role-copy p[dir='rtl']", role.textAr);

  setText("#services > .classic-eyebrow", servicesSection.eyebrow);
  setText(".workflow-section .classic-eyebrow", workflowSection.eyebrow);
  setSplitHeading(".workflow-section .workflow-heading h2", workflowSection.titleLine1En, workflowSection.titleLine2En);
  setText(".production-stack-section .classic-eyebrow", stackSection.eyebrow);
  setText(".production-stack-section h2", stackSection.titleEn);
  setText(".production-stack-section p[dir='rtl']", stackSection.textAr);

  setText("#contact > .classic-eyebrow", contact.eyebrow);
  setSplitHeading("#contact h2", contact.titleLine1En, contact.titleLine2En);
  setText("#contact > p:not(.classic-eyebrow):not([dir='rtl'])", contact.textEn);
  setText("#contact > p[dir='rtl']", contact.textAr);

  const emailLink = $("#contact .contact-email");
  if (emailLink && contact.email !== undefined) {
    emailLink.href = contact.email ? `mailto:${contact.email}` : "#";
    emailLink.hidden = !contact.email;
    const svg = $("svg", emailLink);
    emailLink.replaceChildren();
    if (svg) emailLink.appendChild(svg);
    emailLink.append(document.createTextNode(contact.email || ""));
  }
  const phoneLinks = $$("#contact .contact-phone");
  [contact.phone1, contact.phone2].forEach((phone, index) => {
    const link = phoneLinks[index];
    if (!link || phone === undefined) return;
    link.href = phone ? `tel:${String(phone).replace(/[^+\d]/g, "")}` : "#";
    link.hidden = !phone;
    const svg = $("svg", link);
    link.replaceChildren();
    if (svg) link.appendChild(svg);
    link.append(document.createTextNode(phone || ""));
  });
  const youtubeContact = $("#contact .contact-youtube");
  if (youtubeContact) {
    if (contact.youtube !== undefined) {
      youtubeContact.href = contact.youtube ? safeUrl(contact.youtube) : "#";
      youtubeContact.hidden = !contact.youtube;
    }
    if (contact.youtubeButton !== undefined) {
      const svg = $("svg", youtubeContact);
      youtubeContact.replaceChildren();
      if (svg) youtubeContact.appendChild(svg);
      youtubeContact.append(document.createTextNode(contact.youtubeButton || ""));
    }
  }


  // Editable professional profiles, displayed in both languages.
  const platforms = (contact.platforms || []).filter(item => item.visible !== false && /^https?:\/\//i.test(String(item.url || "").trim()));
  if ($("#contact") && platforms.length) {
    const section = document.createElement("section");
    section.className = "contact-platforms";
    section.setAttribute("aria-labelledby", "platforms-heading");
    section.innerHTML = `<h3 id="platforms-heading"><span lang="en">${escapeHtml(contact.platformsTitleEn || "Freelance & Professional Platforms")}</span><span lang="ar" dir="rtl">${escapeHtml(contact.platformsTitleAr || "منصات العمل الحر والتواصل المهني")}</span></h3><div class="contact-platform-grid">${platforms.map(item => `<a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer"><span><strong lang="en">${escapeHtml(item.nameEn)}</strong><small lang="ar" dir="rtl">${escapeHtml(item.nameAr)}</small></span><span aria-hidden="true">↗</span></a>`).join("")}</div>`;
    $("#contact").appendChild(section);
  }

  const socialMap = {
    Facebook: contact.facebook,
    LinkedIn: contact.linkedin,
    Instagram: contact.instagram,
    Threads: contact.threads,
    YouTube: contact.youtube,
    TikTok: contact.tiktok,
    WhatsApp: contact.whatsapp
  };
  Object.entries(socialMap).forEach(([label, url]) => {
    if (url === undefined) return;
    $$(`.social-icon-btn[aria-label="${label}"]`).forEach(link => {
      link.href = url ? safeUrl(url) : "#";
      link.hidden = !url;
    });
  });

  setText(".modern-footer > p:first-child", footer.tagline);
  const footerYoutube = $(".modern-footer > div > a");
  if (footerYoutube) {
    if (contact.youtube !== undefined) footerYoutube.href = contact.youtube ? safeUrl(contact.youtube) : "#";
    if (footer.youtubeLabel !== undefined) {
      const svg = $("svg", footerYoutube);
      footerYoutube.replaceChildren();
      if (svg) footerYoutube.appendChild(svg);
      footerYoutube.append(document.createTextNode(footer.youtubeLabel || ""));
    }
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
    const projectType = project.featured ? (filmsSection.featuredLabel || "FEATURED FILM") : (filmsSection.defaultLabel || "AI CINEMATIC FILM");
    return `
      <article class="modern-project" id="${escapeHtml(id)}">
        <div class="modern-project-number">${String(index + 1).padStart(2, "0")}</div>
        <div class="modern-video-shell"><iframe loading="lazy" src="https://www.youtube.com/embed/${escapeHtml(project.videoId)}?rel=0" title="${escapeHtml(project.titleEn)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        <div class="modern-project-copy"><p class="modern-project-type">${escapeHtml(projectType)}</p><h3>${escapeHtml(project.titleEn)}</h3><h4 dir="rtl">${escapeHtml(project.titleAr)}</h4><p>${escapeHtml(project.descriptionEn)}</p><p class="modern-arabic" dir="rtl">${escapeHtml(project.descriptionAr)}</p><div class="modern-breakdown-block"><div class="modern-breakdown-label"><span><strong>${escapeHtml(filmsSection.breakdownLabelEn || "PROJECT BREAKDOWN PDF")}</strong><small>${escapeHtml(filmsSection.breakdownLabelAr || "دراسة وتفاصيل تنفيذ المشروع")}</small></span></div><div class="modern-breakdown-actions"><a href="${escapeHtml(safeUrl(project.breakdownEn))}" target="_blank" rel="noreferrer">${escapeHtml(filmsSection.breakdownEnglishButton || "ENGLISH PDF ↗")}</a><a href="${escapeHtml(safeUrl(project.breakdownAr))}" target="_blank" rel="noreferrer">${escapeHtml(filmsSection.breakdownArabicButton || "PDF العربية ↗")}</a></div></div></div>
        <div class="modern-references-block"><div class="modern-references-title"><span>${escapeHtml(filmsSection.refsLabelEn || "SAMPLE OF VISUAL REFERENCES")}</span><small>${escapeHtml(filmsSection.refsLabelAr || "نماذج من المراجع البصرية")}</small></div><div class="modern-reference-grid">${refs.map((item, refIndex) => reference(item, project.titleEn, refIndex + 1)).join("")}</div></div>
      </article>`;
  }).join("");

  const services = $("#servicesList");
  if (services && Array.isArray(data.services) && data.services.length) services.innerHTML = data.services.map((service, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(service.titleEn)}</strong><em dir="rtl">${escapeHtml(service.titleAr)}</em></div>`).join("");

  const workflow = $(".workflow-grid");
  if (workflow && Array.isArray(data.workflow) && data.workflow.length) workflow.innerHTML = data.workflow.map((step, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(step.titleEn)}</h3><h4 dir="rtl">${escapeHtml(step.titleAr)}</h4><p>${escapeHtml(step.descriptionEn)}</p>${step.descriptionAr ? `<p class="modern-arabic" dir="rtl">${escapeHtml(step.descriptionAr)}</p>` : ""}${step.detailEn ? `<p class="workflow-detail">${escapeHtml(step.detailEn)}</p>` : ""}${step.detailAr ? `<p class="workflow-detail modern-arabic" dir="rtl">${escapeHtml(step.detailAr)}</p>` : ""}</article>`).join("");

  const stack = $(".stack-list");
  if (stack && Array.isArray(data.tools) && data.tools.length) stack.innerHTML = data.tools.map(tool => `<span>${escapeHtml(tool)}</span>`).join("");

  // Lightweight deterrence against casual image saving. This is not DRM:
  // public web assets can still be retrieved by a determined visitor.
  const protectImages = () => {
    $$("img").forEach(image => {
      image.draggable = false;
      image.setAttribute("draggable", "false");
      image.style.webkitUserDrag = "none";
      image.style.userSelect = "none";
      image.style.webkitUserSelect = "none";
    });
  };
  protectImages();

  if (document.body && "MutationObserver" in window) {
    const imageObserver = new MutationObserver(protectImages);
    imageObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("dragstart", event => {
    if (event.target instanceof Element && event.target.closest("img, picture")) event.preventDefault();
  });

  document.addEventListener("contextmenu", event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("img, picture, .modern-reference-grid, .classic-reference-grid, .classic-hero .cover")) {
      event.preventDefault();
    }
  });

  document.addEventListener("selectstart", event => {
    if (event.target instanceof Element && event.target.closest("img, picture")) event.preventDefault();
  });
})();