/* Bilingual portfolio pricing and FAQ, independent of visitor tracking. */
(async function () {
  "use strict";

  const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

  const safeUrl = value => {
    try { const url = new URL(String(value || ''), location.href); return ['https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : '#contact'; } catch (_) { return '#contact'; }
  };
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
      .home-category-note{margin:20px 0!important;padding:18px;border-inline-start:3px solid var(--gold);background:#111}
      .home-summary-ar{display:block;margin-top:12px;font-family:Cairo,sans-serif;text-align:right;color:#c9c3b7}
      .home-package-cta{display:grid;gap:5px;background:var(--gold);color:#070707!important;padding:14px;border-radius:7px;text-align:center;font-weight:700}
      .home-package-context{display:block;text-align:center;margin-top:10px;color:var(--muted)}
      .home-faq-group{margin-top:32px}.home-faq-group h3{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;color:var(--gold)}
      .home-table-caption{text-align:start;padding:15px;color:var(--muted)}
      .home-price-tabs button:focus-visible,.home-package-cta:focus-visible,.home-pricing-wrap:focus-visible,.home-faq-item summary:focus-visible{outline:3px solid var(--gold);outline-offset:4px}
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
          <h2 class="home-section-title">${esc(pricingData.settings?.titleEn || "Production Packages")}</h2>
          <p class="home-section-ar" dir="rtl">${esc(pricingData.settings?.titleAr || "باقات وأسعار الإنتاج")}</p>
          <p class="home-section-note">Compare the available production packages and current launch offers. / قارن بين باقات الإنتاج والعروض الحالية واختر الأنسب لمشروعك.</p>
          <div class="home-offer"><span class="home-offer-badge">LAUNCH / إطلاق</span><div><strong>Launch Offer / عرض إطلاق خاص</strong><p>Current prices are introductory promotional rates. / الأسعار الحالية عروض ترويجية خاصة لفترة الإطلاق وليست الأسعار الدائمة.</p></div></div>
          <div class="home-price-tabs" id="homePriceTabs"></div>
          <p id="homeCategoryNote" class="home-section-note home-category-note"></p><div class="home-pricing-wrap" tabindex="0" role="region" aria-label="Package comparison / مقارنة الباقات"><table class="home-pricing-table" id="homePricingTable"></table></div>`;
        contact.parentNode.insertBefore(pricesSection, contact);

        const faqSection = document.createElement("section");
        faqSection.id = "faq";
        faqSection.className = "home-faq-section";
        faqSection.innerHTML = `
          <p class="home-section-kicker">FAQ / الأسئلة الشائعة</p>
          <h2 class="home-section-title">${esc(faqData.titleEn || "Frequently Asked Questions")}</h2>
          <p class="home-section-ar" dir="rtl">${esc(faqData.titleAr || "الأسئلة الشائعة")}</p>
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
            return `<button type="button" data-home-category="${esc(key)}" aria-pressed="${key === activeCategory}" class="${key === activeCategory ? "active" : ""}"><span>${esc(item.labelEn || key)}</span><span dir="rtl">${esc(item.labelAr || key)}</span></button>`;
          }).join("");
          tabs.querySelectorAll("button[data-home-category]").forEach(button => button.addEventListener("click", () => {
            activeCategory = button.dataset.homeCategory;
            renderHomePricing();
            tabs.querySelector(`[data-home-category="${activeCategory}"]`)?.focus();
          }));

          const category = pricingData[activeCategory] || {};
          document.getElementById("homeCategoryNote").innerHTML = `<span lang="en">${esc(category.noteEn || pricingData.settings?.noteEn || "")}</span><span class="home-feature-ar" lang="ar" dir="rtl">${esc(category.noteAr || pricingData.settings?.noteAr || "")}</span>`;
          const en = category.english || {};
          const ar = category.arabic || {};
          const enPackages = Array.isArray(en.packages) ? en.packages : [];
          const arPackages = Array.isArray(ar.packages) ? ar.packages : [];
          const enRows = Array.isArray(en.rows) ? en.rows : [];
          const arRows = Array.isArray(ar.rows) ? ar.rows : [];
          let html = `<caption class="home-table-caption">Compare packages / مقارنة الباقات</caption><thead><tr><th scope="col">${esc(en.firstColumnLabel || "Package")}<br><span class="home-feature-ar" dir="rtl">${esc(ar.firstColumnLabel || "الباقة")}</span></th>`;
          enPackages.forEach((pkg, index) => {
            const arPkg = arPackages[index] || {};
            html += `<th scope="col"><span class="home-price-original">${esc(pkg.originalPrice || "")}</span><span class="home-price-current">${esc(pkg.price || "")}</span><span class="home-price-name">${esc(pkg.name || "")}</span><span class="home-price-name-ar" dir="rtl">${esc(arPkg.name || "")}</span><span class="home-price-summary">${esc(pkg.tagline || "")}<br>${esc(pkg.summary || "")}</span><span class="home-price-summary home-summary-ar" lang="ar" dir="rtl">${esc(arPkg.tagline || "")}<br>${esc(arPkg.summary || "")}</span></th>`;
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
          html += '<tr class="home-select-row"><th scope="row">Request a quote<span class="home-feature-ar" dir="rtl">اطلب عرضًا</span></th>';
          enPackages.forEach((pkg,index) => {
            const arPkg=arPackages[index] || {};
            html += `<td><a class="home-package-cta" href="${esc(safeUrl(pkg.buttonUrl || arPkg.buttonUrl))}" target="_blank" rel="noreferrer"><span>${esc(pkg.buttonLabel || "Request this package")}</span><span lang="ar" dir="rtl">${esc(arPkg.buttonLabel || "اطلب هذه الباقة")}</span></a><small class="home-package-context">${esc(pkg.name || "")}<br><span dir="rtl">${esc(arPkg.name || "")}</span></small></td>`;
          });
          html += "</tr></tbody>";
          table.innerHTML = html;
        }
        renderHomePricing();

        const faqList = document.getElementById("homeFaqList");
        const faqEn = Array.isArray(faqData.english) ? faqData.english : [];
        const faqAr = Array.isArray(faqData.arabic) ? faqData.arabic : [];
        const groups = [
          ["planning", "Before ordering", "قبل الطلب"],
          ["production", "Production & revisions", "الإنتاج والتعديلات"],
          ["delivery", "Delivery & payment", "التسليم والدفع"]
        ];
        if (faqList) faqList.innerHTML = groups.map(([key,enTitle,arTitle]) => {
          const items=faqEn.map((item,index)=>({item,ar:faqAr[index]||{}})).filter(({item})=>(item.group||"planning")===key);
          if(!items.length) return "";
          return `<section class="home-faq-group"><h3>${enTitle}<span lang="ar" dir="rtl">${arTitle}</span></h3>`+items.map(({item,ar})=>`<details class="home-faq-item"><summary><span lang="en">${esc(item.question||"")}</span><span class="home-faq-q-ar" lang="ar" dir="rtl">${esc(ar.question||"")}</span></summary><div class="home-faq-answer" lang="en">${esc(item.answer||"")}<span class="home-faq-answer-ar" lang="ar" dir="rtl">${esc(ar.answer||"")}</span></div></details>`).join("")+"</section>";
        }).join("");
        if (location.hash === '#prices' || location.hash === '#faq') document.querySelector(location.hash)?.scrollIntoView();

      }
    }
  } catch (error) {
    console.warn("Pricing/FAQ home integration unavailable.", error);
  }

})();
