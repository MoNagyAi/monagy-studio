/* Showreel runtime protection + optional visit summaries. */
(function protectShowreelEmbed() {
  "use strict";
  const SHOWREEL_ID = "hdnQ1pbJbLo";
  const EMBED_URL = `https://www.youtube-nocookie.com/embed/${SHOWREEL_ID}?rel=0&modestbranding=1&playsinline=1&controls=1&disablekb=1&iv_load_policy=3`;

  function apply() {
    const frame = document.getElementById("showreel-player");
    if (frame) {
      if (frame.getAttribute("src") !== EMBED_URL) frame.setAttribute("src", EMBED_URL);
      if (!frame.hasAttribute("sandbox")) frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
      frame.setAttribute("allow", "autoplay; encrypted-media; fullscreen; picture-in-picture");
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    }

    const externalLink = document.querySelector("#showreel .reel-open-link");
    if (externalLink) {
      externalLink.hidden = true;
      externalLink.style.display = "none";
      externalLink.removeAttribute("href");
      externalLink.removeAttribute("target");
      externalLink.setAttribute("aria-hidden", "true");
      externalLink.setAttribute("tabindex", "-1");
    }
  }

  // site.js loads content asynchronously, so apply again after it has had time to finish.
  apply();
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  window.addEventListener("load", apply, { once: true });
  setTimeout(apply, 300);
  setTimeout(apply, 1200);
  setTimeout(apply, 3000);
})();

/* Optional visit summaries. */
(async function () {
  "use strict";
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