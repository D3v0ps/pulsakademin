/* PulsAkademin — live content (CMS) layer.
 *
 * READ: fetches text overrides from the Supabase table `site_content` and
 * applies them to every element tagged [data-cms="<key>"]. If no override
 * exists, the text already in the HTML is shown — so the site always renders.
 *
 * EDIT: when an ADMIN is logged in, a "✎ Redigera texter" pill appears
 * (bottom left) on every page. Clicking it makes all tagged texts editable
 * in place; a save bar shows unsaved changes and writes them to Supabase.
 * No rebuild, no redeploy — published instantly to all visitors.
 *
 * Requires (in order): app/config.js → supabase-js CDN → app/supabase.js.
 * Elements containing inline markup (<b>, <a>, <br>) use data-cms-html.
 */
(function () {
  window.PA = window.PA || {};
  var map = {};       // key -> published value
  var dirty = {};     // key -> edited value (unsaved)
  var editing = false;
  var page = (location.pathname.split("/").pop() || "index.html");

  /* ---------- apply published content ---------- */
  function applyAll() {
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var k = el.getAttribute("data-cms");
      if (map[k] == null) return;
      if (el.hasAttribute("data-cms-html")) el.innerHTML = map[k];
      else el.textContent = map[k];
    });
  }

  async function load() {
    if (!PA.sb) return;
    try {
      var res = await PA.sb.from("site_content").select("key,value");
      (res.data || []).forEach(function (r) { map[r.key] = r.value; });
      applyAll();
    } catch (e) { /* table not created yet — fall back to HTML text */ }
  }

  /* ---------- admin detection ---------- */
  async function isAdmin() {
    if (!PA.sb) return false;
    try {
      var u = (await PA.sb.auth.getUser()).data.user;
      if (!u) return false;
      var p = (await PA.sb.from("profiles").select("role").eq("id", u.id).maybeSingle()).data;
      return !!(p && p.role === "admin");
    } catch (e) { return false; }
  }

  /* ---------- edit mode ---------- */
  var ui = {};
  function injectStyles() {
    var s = document.createElement("style");
    s.textContent =
      ".pa-cms-pill{position:fixed;left:16px;bottom:16px;z-index:500;display:inline-flex;align-items:center;gap:8px;" +
      "padding:11px 18px;border-radius:999px;background:#1A1714;color:#FBF6F0;font:600 14px/1 'Hanken Grotesk',sans-serif;" +
      "box-shadow:0 8px 24px rgba(26,23,20,.35);cursor:pointer;border:0}" +
      ".pa-cms-pill:hover{background:#8E1B2E}" +
      ".pa-cms-bar{position:fixed;left:0;right:0;bottom:0;z-index:501;display:flex;gap:12px;align-items:center;justify-content:center;" +
      "flex-wrap:wrap;padding:12px 16px;background:#1A1714;color:#FBF6F0;font:500 14.5px/1.3 'Hanken Grotesk',sans-serif;" +
      "box-shadow:0 -8px 24px rgba(26,23,20,.3)}" +
      ".pa-cms-bar .btn{padding:10px 18px;border-radius:999px;font-weight:600;cursor:pointer;border:0}" +
      ".pa-cms-save{background:#FF5640;color:#fff}.pa-cms-save:disabled{opacity:.45;cursor:default}" +
      ".pa-cms-exit{background:transparent;color:#FBF6F0;border:1.5px solid rgba(251,246,240,.4)!important}" +
      "body.pa-editing [data-cms]{outline:1.5px dashed rgba(255,86,64,.65);outline-offset:3px;border-radius:4px;cursor:text;min-height:1em}" +
      "body.pa-editing [data-cms]:hover,body.pa-editing [data-cms]:focus{outline:2.5px solid #FF5640;background:rgba(255,86,64,.07)}";
    document.head.appendChild(s);
  }

  function setDirtyCount() {
    var n = Object.keys(dirty).length;
    ui.count.textContent = n === 0 ? "Inga osparade ändringar" : n + " osparad" + (n === 1 ? "" : "e") + " ändring" + (n === 1 ? "" : "ar");
    ui.save.disabled = n === 0;
  }

  function enterEdit() {
    editing = true;
    document.body.classList.add("pa-editing");
    ui.pill.style.display = "none";
    ui.bar.style.display = "flex";
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      el.setAttribute("contenteditable", el.hasAttribute("data-cms-html") ? "true" : "plaintext-only");
      el.addEventListener("input", onInput);
    });
    // block link navigation while editing
    document.addEventListener("click", blockClicks, true);
    setDirtyCount();
  }

  function onInput(e) {
    var el = e.currentTarget;
    var k = el.getAttribute("data-cms");
    dirty[k] = el.hasAttribute("data-cms-html") ? el.innerHTML : el.textContent;
    setDirtyCount();
  }

  function blockClicks(e) {
    if (!editing) return;
    var a = e.target.closest("a,button");
    if (a && !a.closest(".pa-cms-bar")) { e.preventDefault(); e.stopPropagation(); }
  }

  async function save() {
    var keys = Object.keys(dirty);
    if (!keys.length) return;
    ui.save.disabled = true;
    ui.count.textContent = "Sparar…";
    try {
      var u = (await PA.sb.auth.getUser()).data.user;
      var rows = keys.map(function (k) {
        return { key: k, value: dirty[k], page: page, updated_at: new Date().toISOString(), updated_by: u ? u.id : null };
      });
      var res = await PA.sb.from("site_content").upsert(rows);
      if (res.error) throw res.error;
      keys.forEach(function (k) { map[k] = dirty[k]; });
      dirty = {};
      ui.count.textContent = "Sparat ✓ — ändringarna är publicerade";
      ui.save.disabled = true;
    } catch (err) {
      ui.count.textContent = "Kunde inte spara: " + (err.message || err);
      ui.save.disabled = false;
    }
  }

  function exitEdit() {
    if (Object.keys(dirty).length && !confirm("Du har osparade ändringar. Lämna ändå?")) return;
    location.reload();
  }

  function buildUI() {
    injectStyles();
    ui.pill = document.createElement("button");
    ui.pill.className = "pa-cms-pill";
    ui.pill.innerHTML = "✎ &nbsp;Redigera texter";
    ui.pill.addEventListener("click", enterEdit);

    ui.bar = document.createElement("div");
    ui.bar.className = "pa-cms-bar";
    ui.bar.style.display = "none";
    ui.count = document.createElement("span");
    ui.save = document.createElement("button");
    ui.save.className = "btn pa-cms-save";
    ui.save.textContent = "Spara & publicera";
    ui.save.addEventListener("click", save);
    var exit = document.createElement("button");
    exit.className = "btn pa-cms-exit";
    exit.textContent = "Avsluta redigering";
    exit.addEventListener("click", exitEdit);
    ui.bar.appendChild(ui.count); ui.bar.appendChild(ui.save); ui.bar.appendChild(exit);

    document.body.appendChild(ui.pill);
    document.body.appendChild(ui.bar);
  }

  /* ---------- boot ---------- */
  async function boot() {
    await load();
    if (await isAdmin()) buildUI();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
