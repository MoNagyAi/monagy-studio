/* Pricing content is maintained in Pages CMS: data/pricing.json. */
(async function () {
  "use strict";
  const host = document.getElementById("pricing");
  if (!host) return;
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = String(value);
    return el;
  };
  const bilingual = (value, tag = "div") => {
    const box = node(tag, "price-bilingual");
    for (const lang of ["en", "ar"]) {
      const span = node("span", "price-" + lang, value?.[lang] || "");
      span.lang = lang; span.dir = lang === "ar" ? "rtl" : "ltr";
      box.append(span);
    }
    return box;
  };
  try {
    const response = await fetch("data/pricing.json", {cache: "no-store"});
    if (!response.ok) throw new Error("Pricing unavailable");
    const data = await response.json();
    if (!data.enabled) { host.hidden = true; document.querySelectorAll('a[href="#pricing"]').forEach(a => a.hidden = true); return; }
    if (!Array.isArray(data.packages) || !data.packages.length) throw new Error("No packages");
    const head = node("header", "pricing-heading");
    head.append(node("p", "classic-eyebrow", "PRICING / الباقات والأسعار"), bilingual(data.title, "h2"), bilingual(data.intro, "p"));
    host.replaceChildren(head);
    const wrap = node("div", "pricing-scroll");
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", "Package comparison / مقارنة الباقات");
    const table = node("table", "pricing-table");
    const caption = node("caption", "", "Starting prices in USD / أسعار تبدأ من بالدولار الأمريكي");
    table.append(caption);
    const thead = node("thead"), top = node("tr"), corner = node("th");
    corner.scope = "col"; corner.append(bilingual({en:"Your production", ar:"تفاصيل الإنتاج"})); top.append(corner);
    data.packages.forEach(p => {
      const th = node("th"); th.scope = "col";
      th.append(bilingual(p.name), node("strong", "package-price", "$" + Number(p.price).toLocaleString("en-US")), bilingual(p.summary));
      top.append(th);
    });
    thead.append(top); table.append(thead);
    const tbody = node("tbody");
    (data.rows || []).forEach(row => {
      const tr = node("tr"), label = node("th"); label.scope = "row"; label.append(bilingual(row.label)); tr.append(label);
      data.packages.forEach(p => { const td = node("td"); td.append(bilingual(row[p.id])); tr.append(td); });
      tbody.append(tr);
    });
    const actions = node("tr"), actionLabel = node("th"); actionLabel.scope = "row";
    actionLabel.append(bilingual({en:"Start a conversation",ar:"ناقش مشروعك"})); actions.append(actionLabel);
    let email = "monagy-studio@hotmail.com";
    try {
      const r = await fetch("data/content.json", {cache:"no-store"});
      if (r.ok) {
        const content = await r.json();
        const candidate = content.contact?.email;
        if (typeof candidate === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) email = candidate;
      }
    } catch (_) { /* Public contact fallback. */ }
    data.packages.forEach(p => {
      const td = node("td"), a = node("a", "pricing-cta");
      const body = "Package / الباقة: " + p.name.en + " / " + p.name.ar + "\n\n" +
        (data.requirements || []).map(r => r.en + "\n" + r.ar + "\n").join("\n");
      a.href = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent("Project inquiry — " + p.name.en) + "&body=" + encodeURIComponent(body);
      a.append(bilingual(data.cta)); td.append(a); actions.append(td);
    });
    tbody.append(actions); table.append(tbody); wrap.append(table); host.append(wrap);
    host.append(bilingual(data.note, "p"));
    const sections = node("div", "pricing-details"), brief = node("section"), faq = node("section");
    brief.append(bilingual(data.requirementsTitle, "h3"));
    const list = node("ol");
    (data.requirements || []).forEach(item => { const li = node("li"); li.append(bilingual(item)); list.append(li); });
    brief.append(list);
    faq.append(bilingual(data.faqTitle, "h3"));
    (data.faqs || []).forEach(item => {
      const detail = node("details"), summary = node("summary");
      summary.append(bilingual(item.question)); detail.append(summary, bilingual(item.answer, "p")); faq.append(detail);
    });
    sections.append(brief, faq); host.append(sections);
    const custom = node("a", "pricing-custom"); custom.href = "#contact"; custom.append(bilingual(data.custom)); host.append(custom);
  } catch (error) {
    host.replaceChildren(bilingual({en:"Pricing is currently unavailable. Please contact me for a quote.",ar:"الأسعار غير متاحة الآن. تواصل معي للحصول على عرض."},"p"));
    const link = node("a", "pricing-cta", "Contact / تواصل"); link.href = "#contact"; host.append(link);
    console.warn("Pricing section:", error.message);
  }
})();