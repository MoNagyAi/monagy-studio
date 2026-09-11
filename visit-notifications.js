/* MoNagy visit summaries + home-page pricing/FAQ integration. */
(async function () {
  "use strict";

  const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

  /* Main navigation: everything stays on the same page. */
  const mainNav = document.querySelector(".topbar nav");
  if (mainNav) {
    mainNav.querySelectorAll('a[href^="pricing.html"]').forEach(link => link.remove());
    const contactLink = mainNav.querySelector('a[href="#contact"]');
    const navItems = [
      { href: "#prices", en: "Prices", ar: "الأسعار" },
      { href: "#faq", en: "FAQ", ar: "الأسئلة الشائعة" }
    ];
    navItems.forEach(item => {
      if (mainNav.querySelector(`a[href="${item.href}"]`)) return;
      const link = document.createElement("a");
      link.href = item.href;
      const en = document.createElement("span");
      en.className = "nav-label-en";
      en.textContent = item.en;
      const ar = document.createElement("span");
      ar.className = "nav-label-ar";
      ar.dir = "rtl";
      ar.textContent = item.ar;
      link.append(en, ar);
      if (contactLink) mainNav.insertBefore(link, contactLink);
      else mainNav.appendChild(link);
    });
  }

  /* Styles for the integrated pricing and FAQ sections. */
  if (!document.getElementById("home-pricing-faq-styles")) {
    const style = document.createElement("style");
    style.id = "home-pricing-faq-styles";
    style.textContent = `
      #prices,#faq{scroll-margin-top:105px}
      .home-pricing-section,.home-faq-section{width:min(var(--max),calc(100% - 9vw));margin-inline:auto;padding:clamp(86px,10vw,145px) 0;border-top:1px solid var(--line)}
      .home-section-kicker{margin:0 0 12px;color:var(--gold);font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
      .home-section-title{margin:0 0 14px!important;font-size:clamp(2.4rem,5vw,5rem)!important}
      .home-section-ar{margin:0 0 18px;color:var(--gold);font-family:Cairo,sans-serif;font-size:clamp(1.25rem,2.3vw,2rem);font-weight:600}
      .home-section-note{max-width:900px;margin:0;color:var(--muted);line-height:1.8}
      .home-offer{display:flex;gap:16px;align-items:flex-start;margin:28px 0 20px;padding:18px 20px;border:1px solid color-mix(in srgb,var(--gold) 55%,transparent);background:color-mix(in srgb,var(--gold) 9%,transparent)}
      .home-offer-badge{flex:0 0 auto;padding:8px 11px;background:var(--gold);color:#050505;font-size:.72rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .home-offer strong{display:block;margin-bottom:5px;font-size:1rem}.home-offer p{margin:0;color:#d4cec3;line-height:1.65}
      .home-price-tabs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 18px}
      .home-price-tabs button{border:1px solid var(--line);background:#101010;color:var(--text);padding:10px 15px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}
      .home-price-tabs button span:last-child{color:var(--gold);font:600 .72rem Cairo,sans-serif}.home-price-tabs button.active{background:var(--gold);color:#050505;border-color:var(--gold)}.home-price-tabs button.active span:last-child{color:#050505}
      .home-pricing-wrap{overflow:auto;border:1px solid var(--line);background:#0d0d0d}
      .home-pricing-table{width:100%;min-width:1050px;border-collapse:collapse}
      .home-pricing-table th,.home-pricing-table td{padding:18px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);vertical-align:middle}.home-pricing-table th:last-child,.home-pricing-table td:last-child{border-right:0}.home-pricing-table tr:last-child td{border-bottom:0}
      .home-pricing-table thead th{background:#141414;text-align:left}.home-pricing-table thead th:first-child{width:210px;color:var(--muted)}
      .home-price-original{display:block;color:#777;text-decoration:line-through;font-size:.88rem;margin-bottom:4px}.home-price-current{display:block;color:var(--gold);font:700 1.55rem "Space Grotesk",sans-serif}.home-price-discount{display:inline-block;margin:7px 0 12px;padding:4px 7px;background:var(--gold);color:#050505;font-size:.66rem;font-weight:900}.home-price-name{display:block;font-weight:800;font-size:1.05rem}.home-price-name-ar{display:block;margin-top:3px;color:#d6a92e;font:600 .84rem Cairo,sans-serif}.home-price-summary{display:block;margin-top:10px;color:#aaa69d;font-size:.82rem;line-height:1.5}
      .home-feature-en{display:block;font-weight:700}.home-feature-ar{display:block;margin-top:3px;color:var(--gold);font:500 .78rem Cairo,sans-serif}.home-cell-en{display:block}.home-cell-ar{display:block;margin-top:3px;color:#aaa69d;font:500 .76rem Cairo,sans-serif}
      .home-pricing-table tbody td:not(:first-child){text-align:center}.home-total-row td{font-weight:800;background:rgba(217,165,42,.055)}
      .home-faq-list{display:grid;gap:12px;margin-top:32px}.home-faq-item{border:1px solid var(--line);background:#101010}.home-faq-item summary{cursor:pointer;list-style:none;padding:18px 20px;font-weight:800}.home-faq-item summary::-webkit-details-marker{display:none}.home-faq-item summary::after{content:'+';float:right;color:var(--gold);font-size:1.2rem}.home-faq-item[open] summary::after{content:'–'}.home-faq-q-ar{display:block;margin-top:4px;color:var(--gold);font:600 .86rem Cairo,sans-serif}.home-faq-answer{padding:0 20px 20px;color:var(--muted);line-height:1.8}.home-faq-answer-ar{display:block;margin-top:10px;color:#d8d2c8;font-family:Cairo,sans-serif;direction:rtl;text-align:right}
      @media(max-width:900px){.classic-site nav{overflow-x:auto;justify-content:flex-start!important;scrollbar-width:none}.classic-site nav::-webkit-scrollbar{display:none}.classic-site nav a{flex:0 0 auto!important;min-width:72px!important}.home-pricing-section,.home-faq-section{width:calc(100% - 36px)}.home-offer{flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  /* Render pricing + FAQ directly inside the home page. */
  try {
    const [pricingResponse, faqResponse] = await Promise.all([
      fetch("data/pricing.json", { cache: "no-store" }),
      fetch("data/faq.json", { cache: "no-store" })
    ]);
    if (pricingResponse.ok && faqResponse.ok) {
      const pricingData = await pricingResponse.json();
      const faqData = await faqResponse.json();
      const contact = document.getElementById("contact");
      if (contact) {
        const pricesSection = document.createElement("section");
        pricesSection.id = "prices";
        pricesSection.className = "home-pricing-section";
        pricesSection.innerHTML = `
          <p class="home-section-kicker">PRICES / الأسعار</p>
          <h2 class="home-section-title">Production Packages</h2>
          <p class="home-section-ar" dir="rtl">باقات وأسعار الإنتاج</p>
          <p class="home-section-note">Compare the available production packages and current launch offers. / قارن بين باقات الإنتاج والعروض الحالية واختر الأنسب لمشروعك.</p>
          <div class="home-offer"><span class="home-offer-badge">80% OFF</span><div><strong>Launch Offer / عرض إطلاق خاص</strong><p>Current prices are introductory promotional rates. / الأسعار الحالية عروض ترويجية خاصة لفترة الإطلاق وليست الأسعار الدائمة.</p></div></div>
          <div class="home-price-tabs" id="homePriceTabs"></div>
          <div class="home-pricing-wrap"><table class="home-pricing-table" id="homePricingTable"></table></div>`;
        contact.parentNode.insertBefore(pricesSection, contact);

        const faqSection = document.createElement("section");
        faqSection.id = "faq";
        faqSection.className = "home-faq-section";
        faqSection.innerHTML = `
          <p class="home-section-kicker">FAQ / الأسئلة الشائعة</p>
          <h2 class="home-section-title">Frequently Asked Questions</h2>
          <p class="home-section-ar" dir="rtl">كل ما تحتاج معرفته قبل بدء المشروع</p>
          <p class="home-section-note">${esc(faqData.introEn || "")}<br><span dir="rtl">${esc(faqData.introAr || "")}</span></p>
          <div class="home-faq-list" id="homeFaqList"></div>`;
        contact.parentNode.insertBefore(faqSection, contact);

        const categories = ["cinematic", "threeD", "lipSync"].filter(key => pricingData[key]);
        let activeCategory = pricingData.settings?.defaultCategory || categories[0];
        if (!categories.includes(activeCategory)) activeCategory = categories[0];

        function renderHomePricing() {
          const tabs = document.getElementById("homePriceTabs");
          const table = document.getElementById("homePricingTable");
          if (!tabs || !table || !activeCategory) return;
          tabs.innerHTML = categories.map(key => {
            const item = pricingData[key] || {};
            return `<button type="button" data-home-category="${esc(key)}" class="${key === activeCategory ? "active" : ""}"><span>${esc(item.labelEn || key)}</span><span dir="rtl">${esc(item.labelAr || key)}</span></button>`;
          }).join("");
          tabs.querySelectorAll("button[data-home-category]").forEach(button => button.addEventListener("click", () => {
            activeCategory = button.dataset.homeCategory;
            renderHomePricing();
          }));

          const category = pricingData[activeCategory] || {};
          const en = category.english || {};
          const ar = category.arabic || {};
          const enPackages = Array.isArray(en.packages) ? en.packages : [];
          const arPackages = Array.isArray(ar.packages) ? ar.packages : [];
          const enRows = Array.isArray(en.rows) ? en.rows : [];
          const arRows = Array.isArray(ar.rows) ? ar.rows : [];
          let html = `<thead><tr><th>Package<br><span class="home-feature-ar" dir="rtl">الباقة</span></th>`;
          enPackages.forEach((pkg, index) => {
            const arPkg = arPackages[index] || {};
            html += `<th><span class="home-price-original">${esc(pkg.originalPrice || "")}</span><span class="home-price-current">${esc(pkg.price || "")}</span><span class="home-price-discount">${esc(pkg.discountLabel || "80% OFF")}</span><span class="home-price-name">${esc(pkg.name || "")}</span><span class="home-price-name-ar" dir="rtl">${esc(arPkg.name || "")}</span><span class="home-price-summary">${esc(pkg.tagline || "")}<br>${esc(pkg.summary || "")}</span></th>`;
          });
          html += "</tr></thead><tbody>";
          enRows.forEach((row, rowIndex) => {
            const arRow = arRows[rowIndex] || {};
            const enCells = Array.isArray(row.cells) ? row.cells : [];
            const arCells = Array.isArray(arRow.cells) ? arRow.cells : [];
            html += `<tr class="${row.emphasis ? "home-total-row" : ""}"><td><span class="home-feature-en">${esc(row.label || "")}</span><span class="home-feature-ar" dir="rtl">${esc(arRow.label || "")}</span></td>`;
            enPackages.forEach((_, index) => {
              html += `<td><span class="home-cell-en">${esc(enCells[index] ?? "—")}</span><span class="home-cell-ar" dir="rtl">${esc(arCells[index] ?? "")}</span></td>`;
            });
            html += "</tr>";
          });
          html += "</tbody>";
          table.innerHTML = html;
        }
        renderHomePricing();

        const faqList = document.getElementById("homeFaqList");
        const faqEn = Array.isArray(faqData.english) ? faqData.english : [];
        const faqAr = Array.isArray(faqData.arabic) ? faqData.arabic : [];
        if (faqList) faqList.innerHTML = faqEn.map((item, index) => {
          const ar = faqAr[index] || {};
          return `<details class="home-faq-item"${index === 0 ? " open" : ""}><summary>${esc(item.question || "")}<span class="home-faq-q-ar" dir="rtl">${esc(ar.question || "")}</span></summary><div class="home-faq-answer">${esc(item.answer || "")}<span class="home-faq-answer-ar">${esc(ar.answer || "")}</span></div></details>`;
        }).join("");
      }
    }
  } catch (error) {
    console.warn("Pricing/FAQ home integration unavailable.", error);
  }

  /* Visit summaries. Disabled until a deployed Apps Script URL is supplied. */
  let config;
  try { config = await (await fetch("data/visit-notifications.json", {cache:"no-store"})).json(); } catch (_) { return; }
  if (!config.enabled || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.endpoint || "")) return;
  const optedOut = () => {
    try { return localStorage.getItem("monagy-visit-optout") === "1"; } catch (_) { return false; }
  };
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl || optedOut()) return;
  let stopped = false, clicks = 0, visibleSeconds = 0, lastSend = 0, sequence = 0;
  const visit = crypto.randomUUID();
  const events = [];
  const clean = value => String(value || "").replace(/\s+/g," ").slice(0,100);
  let referrer = "";
  try { referrer = new URL(document.referrer).hostname; } catch (_) {}
  const source = clean(new URLSearchParams(location.search).get("utm_source") || referrer || "مباشر / غير معروف");
  const ua = navigator.userAgent;
  const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "هاتف / جهاز لوحي" : "كمبيوتر";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS/iPadOS" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : "Other";
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  const summary = document.createElement("p");
  summary.dir = "auto";
  summary.style.cssText = "font-size:12px;padding:12px;opacity:.8";
  summary.append("إحصاءات الزيارة: نرسل ملخصًا للتفاعلات إلى مالك الموقع، دون اسمك أو بريدك. Anonymous visit interactions are emailed to the site owner. ");
  const off = document.createElement("button");
  off.type = "button"; off.textContent = "إيقاف هذا التتبّع / Opt out";
  off.onclick = () => { stopped = true; try { localStorage.setItem("monagy-visit-optout","1"); } catch (_) {} summary.textContent = "تم إيقاف ملخصات الزيارة على هذا المتصفح. Visit summaries disabled."; };
  summary.append(off); (document.querySelector("footer") || document.body).append(summary);
  function send(force) {
    if (stopped || optedOut() || (!force && Date.now()-lastSend < 30000)) return;
    lastSend = Date.now();
    const body = JSON.stringify({version:1, sequence:++sequence, visit, site:location.origin + location.pathname,
      source, device, os, browser, language:clean(navigator.language),
      visibleSeconds, clicks, events});
    fetch(config.endpoint, {method:"POST",mode:"no-cors",credentials:"omit",keepalive:true,
      headers:{"Content-Type":"text/plain;charset=UTF-8"},body}).catch(()=>{});
  }
  function record(type,label,project) {
    if (stopped) return;
    const key = clean(type + ": " + label + (project ? " — " + project : ""));
    const old = events.find(item => item.label === key);
    if (old) old.count++;
    else if (events.length < 30) events.push({label:key,count:1});
    send(false);
  }
  document.addEventListener("click", event => {
    if (!event.isTrusted || stopped || !(event.target instanceof Element)) return;
    const link = event.target.closest("a,button,summary");
    if (!link || link === off) return;
    clicks++;
    const project = link.closest(".modern-project");
    const title = project?.querySelector("h3")?.textContent || "";
    let type = "زر";
    if (link.closest(".modern-breakdown-actions")) type = "ملف شرح المشروع";
    else if (link.closest(".resume-lang-actions")) type = "السيرة الذاتية";
    else if (link.closest(".modern-reference-grid")) type = "مرجع بصري";
    else if (link.closest("nav")) type = "انتقال لقسم";
    else if (link.closest("#contact,.footer-socials")) type = "تواصل";
    record(type, link.getAttribute("aria-label") || link.textContent, title);
  }, true);
  window.addEventListener("hashchange", () => record("قسم",location.hash,""));
  document.addEventListener("visibilitychange", () => { if (document.hidden) send(true); });
  window.addEventListener("pagehide", () => send(true));
  let ticks = 0;
  setInterval(() => {
    if (stopped || document.hidden) return;
    visibleSeconds += 5; ticks++;
    if (ticks % 6 === 0) send(false);
  },5000);
  const bound = new WeakSet();
  function bindPlayers() {
    if (stopped || !window.YT?.Player) return;
    document.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach(frame => {
      if (bound.has(frame)) return;
      bound.add(frame);
      const url = new URL(frame.src);
      url.searchParams.set("enablejsapi","1"); url.searchParams.set("origin",location.origin);
      frame.src = url.href;
      let prior = -99;
      new YT.Player(frame,{events:{onStateChange(event) {
        if (event.data === prior) return;
        prior = event.data;
        if (event.data === 1) record("تشغيل فيديو",frame.title,"");
        if (event.data === 0) record("اكتمال فيديو",frame.title,"");
      }}});
    });
  }
  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { if (typeof previous === "function") previous(); bindPlayers(); };
  if (window.YT?.Player) bindPlayers();
  else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.append(script);
  }
  new MutationObserver(bindPlayers).observe(document.getElementById("projects") || document.body,{childList:true,subtree:true});
  send(true);
})();
