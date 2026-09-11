// Paste this file into a NEW standalone Google Apps Script project.
// No passwords or API keys. Recipient is fixed server-side.
const MN_RECIPIENT = "monagy-studio@hotmail.com";
const MN_DAILY_CAP = 50;
const MN_PENDING_CAP = 40;
function mnText_(v,n) { return String(v || "").replace(/[\r\n\t]/g," ").slice(0,n || 100); }
function mnCount_(v,max) { return Math.max(0,Math.min(max,Math.floor(Number(v)||0))); }
function mnValidate_(d) {
  if (d.version !== 1 || !/^[a-f0-9-]{36}$/.test(d.visit || "")) throw new Error("Invalid visit");
  if (!/^https:\/\/monagyai\.github\.io\/monagy-studio\/?(?:index\.html)?$/.test(d.site || "")) throw new Error("Invalid site");
  return {sequence:mnCount_(d.sequence,1000000),visit:d.visit,site:d.site,source:mnText_(d.source),device:mnText_(d.device),
    os:mnText_(d.os),browser:mnText_(d.browser),language:mnText_(d.language,30),
    visibleSeconds:mnCount_(d.visibleSeconds,86400),clicks:mnCount_(d.clicks,10000),
    events:(Array.isArray(d.events)?d.events:[]).slice(0,30).map(x=>({label:mnText_(x.label),count:mnCount_(x.count,10000)}))};
}
function doGet() { return ContentService.createTextOutput("MoNagy visit receiver ready"); }
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 14000) throw new Error("Invalid size");
    const d = mnValidate_(JSON.parse(raw)), now = Date.now();
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(1500)) return ContentService.createTextOutput("busy");
    try {
      const p = PropertiesService.getScriptProperties(), key = "visit:" + d.visit;
      const previous = p.getProperty(key);
      const old = previous ? JSON.parse(previous) : null;
      if (old && old.sent) return ContentService.createTextOutput("closed");
      // Full snapshots are idempotent; ignore delayed snapshots.
      if (old && d.sequence <= old.data.sequence) return ContentService.createTextOutput("stale");
      if (!old && Object.keys(p.getProperties()).filter(k=>k.indexOf("visit:")===0).length >= MN_PENDING_CAP) return ContentService.createTextOutput("capacity");
      const value = JSON.stringify({first:old?old.first:now,last:now,data:d});
      if (Utilities.newBlob(value).getBytes().length > 8000) throw new Error("Snapshot too large");
      p.setProperty(key,value);
    } finally { lock.releaseLock(); }
    return ContentService.createTextOutput("accepted");
  } catch (_) { return ContentService.createTextOutput("rejected"); }
}
function mnBody_(r) {
  const d = r.data;
  return [
    "🔔 تمت زيارة بورتفوليو MoNagy",
    "وقت البداية: " + Utilities.formatDate(new Date(r.first),"Africa/Cairo","yyyy-MM-dd HH:mm"),
    "المصدر المبلغ عنه: " + d.source,
    "الجهاز: " + d.device + " — " + d.os + " — " + d.browser,
    "لغة المتصفح: " + d.language,
    "مدة ظهور الصفحة المسجلة (تقريبية): " + d.visibleSeconds + " ثانية",
    "عدد نقرات الأزرار والروابط: " + d.clicks,
    "",
    "تفاصيل التفاعلات (بحد أقصى 30 نوعًا):",
    d.events.length ? d.events.map(x=> "• " + x.label + " × " + x.count).join("\n") : "لم تسجل تفاعلات.",
    "",
    "لا تشمل النقرات داخل مشغل الفيديو؛ يظهر تشغيل الفيديو واكتماله كأحداث مستقلة.",
    "الضغط على رابط لا يؤكد التحميل أو إرسال رسالة. المصدر قد يكون غير معروف.",
    "الموقع الجغرافي والاسم والبريد وعنوان IP غير مجمعة في هذه الخدمة.",
    "هذه زيارة تحميل صفحة بمعرف عشوائي، وليست هوية شخص. تحديث الصفحة يبدأ زيارة مستقلة.",
    "قد تفقد أحداث بسبب إغلاق المتصفح أو حظر التتبع. بيانات المتصفح غير موثقة وقد تشمل روبوتات."
  ].join("\n");
}
function sendPendingVisits() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const p = PropertiesService.getScriptProperties(), all = p.getProperties(), now=Date.now();
    const day = Utilities.formatDate(new Date(),"Africa/Cairo","yyyy-MM-dd");
    let count = Number(p.getProperty("mailDay") === day ? p.getProperty("mailCount") : 0) || 0;
    p.setProperty("mailDay",day); p.setProperty("mailCount",String(count));
    Object.keys(all).filter(k=>k.indexOf("visit:")===0).forEach(key=>{
      const r = JSON.parse(all[key]);
      if (now-r.first > 86400000) { p.deleteProperty(key); return; }
      if (r.sent || now-r.last < 300000) return;
      if (count >= MN_DAILY_CAP || MailApp.getRemainingDailyQuota() < 1) return;
      // Mark first to avoid duplicate email if execution stops after sending.
      // A crash between this write and send can lose this one notification.
      p.setProperty(key,JSON.stringify({first:r.first,last:r.last,sent:true}));
      count++; p.setProperty("mailCount",String(count));
      try { MailApp.sendEmail({to:MN_RECIPIENT,subject:"🔔 زيارة البورتفوليو — " + r.data.clicks + " ضغطة مسجلة",body:mnBody_(r),name:"MoNagy Portfolio"}); }
      catch(err) { p.setProperty(key,JSON.stringify(r)); throw err; }
    });
  } finally { lock.releaseLock(); }
}
function setup() {
  // Running setup does not send email. It requests the required mail scope.
  MailApp.getRemainingDailyQuota();
  const exists = ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==="sendPendingVisits");
  if (!exists) ScriptApp.newTrigger("sendPendingVisits").timeBased().everyMinutes(5).create();
  console.log("Ready. Deploy as Web app, Execute as Me, access Anyone; send the /exec URL to finish website activation.");
}
function sendTestEmail() {
  MailApp.sendEmail({to:MN_RECIPIENT,subject:"اختبار تنبيهات MoNagy",body:"هذه رسالة اختبار لخدمة إشعارات البورتفوليو، وليست زيارة حقيقية.",name:"MoNagy Portfolio"});
}
