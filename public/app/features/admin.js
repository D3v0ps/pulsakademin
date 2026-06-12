/* PulsAkademin — Admin dashboard logic.
 * Loaded after: config.js, supabase-js CDN, supabase.js, auth.js, db.js
 * No toasts. Gate by admin role. All data from PA.db / PA.sb.
 */
(function () {
  /* ── util ─────────────────────────────────────────────── */
  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function fmtDate(iso) {
    if (!iso) return "–";
    try {
      return new Date(iso).toLocaleDateString("sv-SE", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return iso; }
  }
  function fmtDatetimeLocal(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ""; }
  }
  function fmtMoney(v) {
    if (v == null || v === "") return "–";
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    return n.toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
  }
  function statusBadge(status) {
    const map = {
      confirmed: "badge--green", received: "badge--green",
      paid: "badge--green", active: "badge--green", won: "badge--green",
      pending: "badge--amber", invoice: "badge--amber", contacted: "badge--amber", published: "badge--info",
      processing: "badge--amber", quoted: "badge--amber",
      shipped: "badge--info",
      cancelled: "badge--danger", lost: "badge--danger", refunded: "badge--danger",
      new: "badge--info", sent: "badge--coral",
      completed: "badge--green",
      draft: "", inactive: "", open: "badge--green", full: "badge--amber",
    };
    const cls = map[(status || "").toLowerCase()] || "";
    return `<span class="badge ${cls}"><span class="dot"></span>${esc(status || "–")}</span>`;
  }
  function emptyState(msg) {
    return `<div style="padding:36px 0;text-align:center;color:var(--muted);font-size:15px">${esc(msg)}</div>`;
  }
  function loadingState() {
    return `<div style="padding:36px 0;text-align:center;color:var(--muted);font-size:15px">Laddar…</div>`;
  }
  function errorState(msg) {
    return `<div style="padding:20px;background:var(--danger-bg);color:var(--danger);border-radius:var(--r-sm);font-size:14px">${esc(msg)}</div>`;
  }

  /* ── slug helper ─────────────────────────────────────── */
  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ── inline save feedback helpers ───────────────────── */
  function showSaved(el) {
    if (!el) return;
    el.textContent = "Sparat ✓";
    el.className = "inline-saved";
    setTimeout(() => { el.textContent = ""; }, 3000);
  }
  function showErr(el, msg) {
    if (!el) return;
    el.textContent = msg || "Fel vid sparning.";
    el.className = "inline-err";
  }

  /* ── view definitions ─────────────────────────────────── */
  const VIEWS = {
    dashboard: { label: "Dashboard", icon: "📊" },
    bookings: { label: "Bokningar", icon: "🗓️", table: "bookings" },
    orders: { label: "Ordrar", icon: "🛒", table: "orders" },
    quote_requests: { label: "Offertförfrågningar", icon: "📝", table: "quote_requests" },
    contact_messages: { label: "Kontaktmeddelanden", icon: "✉️", table: "contact_messages" },
    courses: { label: "Kurser", icon: "🎓", table: "courses" },
    course_instances: { label: "Kurstillfällen", icon: "📅", table: "course_instances" },
    products: { label: "Produkter", icon: "📦", table: "products" },
    site_content: { label: "Innehåll (texter)", icon: "📄", table: "site_content" },
    articles: { label: "Artiklar", icon: "📰", table: "articles" },
    users: { label: "Användare", icon: "👥", table: "profiles" },
  };

  /* ══════════════════════════════════════════════════════════
     BOOKINGS — read list + inline status update + detail expander
  ══════════════════════════════════════════════════════════ */
  function renderBookings(rows, container) {
    if (!rows.length) return emptyState("Inga bokningar hittades.");
    const statuses = ["confirmed","pending","cancelled","completed"];
    const html = `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>ID</th><th>Kund</th><th>Typ</th><th>Kurstillfälle</th><th>Status</th><th>Skapad</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr data-id="${esc(r.id)}" class="booking-main-row">
          <td><span class="muted" style="font-size:12px;font-family:var(--font-mono)">${esc(String(r.id).slice(0,8))}…</span></td>
          <td><b>${esc(r.contact_name || "–")}</b><div class="muted" style="font-size:12px">${esc(r.contact_email || "")}</div></td>
          <td>${esc(r.booking_type || "–")}</td>
          <td>${esc((r.course_instances && r.course_instances.courses && r.course_instances.courses.title) ? r.course_instances.courses.title + " – " + r.course_instances.city : r.course_instance_id ? String(r.course_instance_id).slice(0,8)+"…" : "–")}</td>
          <td>
            <select class="status-sel" data-table="bookings" data-id="${esc(r.id)}" data-field="status">
              ${statuses.map(s => `<option value="${s}"${r.status===s?" selected":""}>${s}</option>`).join("")}
            </select>
            <span class="status-msg"></span>
          </td>
          <td>${fmtDate(r.created_at)}</td>
          <td><button class="btn--show booking-show-btn" data-id="${esc(r.id)}">Visa</button></td>
        </tr>
        <tr class="detail-row booking-detail-row" id="booking-detail-${esc(r.id)}" style="display:none">
          <td colspan="7"><div class="detail-panel" id="booking-detail-content-${esc(r.id)}"><em class="muted">Laddar…</em></div></td>
        </tr>`).join("")}
      </tbody>
    </table></div>`;
    return html;
  }

  /* ══════════════════════════════════════════════════════════
     ORDERS — read list + inline status update + detail expander
  ══════════════════════════════════════════════════════════ */
  function renderOrders(rows) {
    if (!rows.length) return emptyState("Inga ordrar hittades.");
    const statuses = ["received","processing","shipped","completed","cancelled"];
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Ordernr</th><th>Kund</th><th>Totalt</th><th>Status</th><th>Skapad</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr data-id="${esc(r.id)}" class="order-main-row">
          <td><b style="font-family:var(--font-mono);font-size:13px">${esc(r.order_number || "–")}</b></td>
          <td>${esc(r.customer_name || "–")}<div class="muted" style="font-size:12px">${esc(r.customer_email||"")}</div></td>
          <td>${fmtMoney(r.total_incl_vat)}</td>
          <td>
            <select class="status-sel" data-table="orders" data-id="${esc(r.id)}" data-field="status">
              ${statuses.map(s => `<option value="${s}"${r.status===s?" selected":""}>${s}</option>`).join("")}
            </select>
            <span class="status-msg"></span>
          </td>
          <td>${fmtDate(r.created_at)}</td>
          <td><button class="btn--show order-show-btn" data-id="${esc(r.id)}">Visa</button></td>
        </tr>
        <tr class="detail-row order-detail-row" id="order-detail-${esc(r.id)}" style="display:none">
          <td colspan="6"><div class="detail-panel" id="order-detail-content-${esc(r.id)}"><em class="muted">Laddar…</em></div></td>
        </tr>`).join("")}
      </tbody>
    </table></div>`;
  }

  /* ══════════════════════════════════════════════════════════
     QUOTE REQUESTS — read list + inline status update + detail expander
  ══════════════════════════════════════════════════════════ */
  function renderQuoteRequests(rows) {
    if (!rows.length) return emptyState("Inga offertförfrågningar hittades.");
    const statuses = ["new","contacted","quoted","won","lost"];
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Kontakt</th><th>Företag</th><th>Kurs</th><th>Status</th><th>Skapad</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr data-id="${esc(r.id)}" class="qr-main-row">
          <td><b>${esc(r.contact_name || "–")}</b><div class="muted" style="font-size:12px">${esc(r.contact_email||"")}</div></td>
          <td>${esc(r.company_name || r.organization || "–")}</td>
          <td>${esc(r.course_title || r.course_interest || r.course || "–")}</td>
          <td>
            <select class="status-sel" data-table="quote_requests" data-id="${esc(r.id)}" data-field="status">
              ${statuses.map(s => `<option value="${s}"${r.status===s?" selected":""}>${s}</option>`).join("")}
            </select>
            <span class="status-msg"></span>
          </td>
          <td>${fmtDate(r.created_at)}</td>
          <td><button class="btn--show qr-show-btn" data-id="${esc(r.id)}">Visa</button></td>
        </tr>
        <tr class="detail-row qr-detail-row" id="qr-detail-${esc(r.id)}" style="display:none">
          <td colspan="6">
            <div class="detail-panel">
              <div class="detail-grid">
                <div><dt>Företag</dt><dd>${esc(r.company_name||"–")}</dd></div>
                <div><dt>Org.nr</dt><dd>${esc(r.org_number||"–")}</dd></div>
                <div><dt>Kontaktperson</dt><dd>${esc(r.contact_name||"–")}</dd></div>
                <div><dt>E-post</dt><dd>${esc(r.email||r.contact_email||"–")}</dd></div>
                <div><dt>Telefon</dt><dd>${esc(r.phone||"–")}</dd></div>
                <div><dt>Kurs</dt><dd>${esc(r.course_title||r.course_interest||r.course||"–")}</dd></div>
                <div><dt>Antal deltagare</dt><dd>${esc(r.participant_count!=null?String(r.participant_count):"–")}</dd></div>
                <div><dt>Stad</dt><dd>${esc(r.city||"–")}</dd></div>
                <div><dt>Önskat datum</dt><dd>${esc(r.preferred_date||"–")}</dd></div>
                <div><dt>Platsönskemål</dt><dd>${esc(r.location_pref||"–")}</dd></div>
              </div>
              ${r.message ? `<h4>Meddelande</h4><div class="detail-msg">${esc(r.message)}</div>` : ""}
            </div>
          </td>
        </tr>`).join("")}
      </tbody>
    </table></div>`;
  }

  /* ══════════════════════════════════════════════════════════
     CONTACT MESSAGES — read list + detail expander
  ══════════════════════════════════════════════════════════ */
  function renderContactMessages(rows) {
    if (!rows.length) return emptyState("Inga kontaktmeddelanden hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Namn</th><th>E-post</th><th>Ämne</th><th>Förhandsgranskning</th><th>Skapad</th><th></th></tr></thead>
      <tbody>${rows.map(r => `
        <tr data-id="${esc(r.id)}" class="cm-main-row">
          <td><b>${esc(r.name || "–")}</b></td>
          <td>${esc(r.email || "–")}</td>
          <td>${esc(r.kind || r.subject || "–")}</td>
          <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc((r.message || "").slice(0, 70))}${(r.message || "").length > 70 ? "…" : ""}</td>
          <td>${fmtDate(r.created_at)}</td>
          <td><button class="btn--show cm-show-btn" data-id="${esc(r.id)}">Visa</button></td>
        </tr>
        <tr class="detail-row cm-detail-row" id="cm-detail-${esc(r.id)}" style="display:none">
          <td colspan="6">
            <div class="detail-panel">
              <div class="detail-grid">
                <div><dt>Namn</dt><dd>${esc(r.name||"–")}</dd></div>
                <div><dt>E-post</dt><dd>${esc(r.email||"–")}</dd></div>
                <div><dt>Telefon</dt><dd>${esc(r.phone||"–")}</dd></div>
                <div><dt>Ämne</dt><dd>${esc(r.kind||r.subject||"–")}</dd></div>
              </div>
              <h4>Meddelande</h4>
              <div class="detail-msg">${esc(r.message||"–")}</div>
            </div>
          </td>
        </tr>`).join("")}
      </tbody>
    </table></div>`;
  }

  /* ══════════════════════════════════════════════════════════
     COURSES — list + inline edit + new course
  ══════════════════════════════════════════════════════════ */
  function renderCourses(rows) {
    if (!rows.length && rows._justEmpty) return emptyState("Inga kurser hittades.");
    const rowsHtml = rows.map(r => `
      <tr data-id="${esc(r.id)}" class="course-row">
        <td><b>${esc(r.title || "–")}</b><div class="muted" style="font-size:12px;font-family:var(--font-mono)">${esc(r.slug||"")}</div></td>
        <td>${esc(r.category || "–")}</td>
        <td>${esc(r.duration || "–")}</td>
        <td>${esc(r.price_label || (r.price_incl_vat != null ? fmtMoney(r.price_incl_vat) : "–"))}</td>
        <td>${r.active ? '<span class="badge badge--green">Aktiv</span>' : '<span class="badge">Inaktiv</span>'}</td>
        <td><button class="btn--edit course-edit-btn" data-id="${esc(r.id)}">Redigera</button></td>
      </tr>
      <tr class="course-edit-row" id="course-edit-${esc(r.id)}" style="display:none">
        <td colspan="6">
          <div class="inline-form">
            <div>
              <label>Titel</label>
              <input type="text" name="title" value="${esc(r.title||"")}">
            </div>
            <div>
              <label>Prisetikett (t.ex. "Från 1 990 kr")</label>
              <input type="text" name="price_label" value="${esc(r.price_label||"")}">
            </div>
            <div>
              <label>Pris/enhet</label>
              <input type="text" name="price_unit" value="${esc(r.price_unit||"")}">
            </div>
            <div>
              <label>Längd (t.ex. "4 timmar")</label>
              <input type="text" name="duration" value="${esc(r.duration||"")}">
            </div>
            <div class="span2">
              <label>Beskrivning</label>
              <textarea name="description">${esc(r.description||"")}</textarea>
            </div>
            <div>
              <label><input type="checkbox" name="active" style="width:auto;margin-right:6px"${r.active?" checked":""}> Aktiv</label>
            </div>
            <div class="form-actions">
              <button class="btn--save course-save-btn" data-id="${esc(r.id)}">Spara</button>
              <button class="btn--cancel-edit course-cancel-btn" data-id="${esc(r.id)}">Avbryt</button>
              <span class="status-msg"></span>
            </div>
          </div>
        </td>
      </tr>`).join("");

    const tableHtml = rows.length
      ? `<div style="overflow-x:auto"><table class="table">
          <thead><tr><th>Titel</th><th>Kategori</th><th>Längd</th><th>Pris</th><th>Aktiv</th><th></th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table></div>`
      : emptyState("Inga kurser hittades.");

    return `<div class="abar">
        <button class="btn btn--primary btn--sm" id="new-course-toggle">+ Ny kurs</button>
      </div>
      <div id="new-course-form" style="display:none" class="new-row-section">
        <div class="inline-form">
          <div>
            <label>Titel *</label>
            <input type="text" id="nc-title" placeholder="Kursens titel">
          </div>
          <div>
            <label>Prisetikett</label>
            <input type="text" id="nc-price_label" placeholder="Från 1 990 kr">
          </div>
          <div>
            <label>Pris/enhet</label>
            <input type="text" id="nc-price_unit" placeholder="per person">
          </div>
          <div>
            <label>Längd</label>
            <input type="text" id="nc-duration" placeholder="4 timmar">
          </div>
          <div class="span2">
            <label>Beskrivning</label>
            <textarea id="nc-description" placeholder="Kursbeskrivning…"></textarea>
          </div>
          <div>
            <label><input type="checkbox" id="nc-active" style="width:auto;margin-right:6px" checked> Aktiv</label>
          </div>
          <div class="form-actions">
            <button class="btn--save" id="nc-save-btn">Skapa kurs</button>
            <button class="btn--cancel-edit" id="nc-cancel-btn">Avbryt</button>
            <span class="status-msg" id="nc-msg"></span>
          </div>
        </div>
      </div>
      ${tableHtml}`;
  }

  /* ══════════════════════════════════════════════════════════
     COURSE INSTANCES — list + inline edit + new + delete
  ══════════════════════════════════════════════════════════ */
  function renderCourseInstances(rows, courses) {
    const courseOpts = (courses || []).map(c =>
      `<option value="${esc(c.id)}">${esc(c.title||c.id)}</option>`).join("");
    const instanceStatuses = ["open","full","cancelled"];

    const rowsHtml = rows.map(r => `
      <tr data-id="${esc(r.id)}" class="ci-row">
        <td><b>${esc(r.course_title || r.course_id || "–")}</b></td>
        <td>${esc(r.city || "–")}</td>
        <td>${esc(r.venue || "–")}</td>
        <td>${fmtDate(r.start_at)}</td>
        <td>${esc(r.seats_total != null ? String(r.seats_total) : "–")} / ${esc(r.seats_left != null ? String(r.seats_left) : "–")}</td>
        <td>${statusBadge(r.status || "open")}</td>
        <td style="white-space:nowrap">
          <button class="btn--edit ci-edit-btn" data-id="${esc(r.id)}" style="margin-right:4px">Redigera</button>
          <button class="btn--danger ci-delete-btn" data-id="${esc(r.id)}">Ta bort</button>
        </td>
      </tr>
      <tr class="ci-edit-row" id="ci-edit-${esc(r.id)}" style="display:none">
        <td colspan="7">
          <div class="inline-form">
            <div>
              <label>Stad</label>
              <input type="text" name="city" value="${esc(r.city||"")}">
            </div>
            <div>
              <label>Lokal</label>
              <input type="text" name="venue" value="${esc(r.venue||"")}">
            </div>
            <div>
              <label>Start (datum/tid)</label>
              <input type="datetime-local" name="start_at" value="${esc(fmtDatetimeLocal(r.start_at))}">
            </div>
            <div>
              <label>Slut (datum/tid)</label>
              <input type="datetime-local" name="end_at" value="${esc(fmtDatetimeLocal(r.end_at))}">
            </div>
            <div>
              <label>Prisetikett</label>
              <input type="text" name="price_label" value="${esc(r.price_label||"")}">
            </div>
            <div>
              <label>Totalt platser</label>
              <input type="number" name="seats_total" value="${esc(r.seats_total!=null?String(r.seats_total):"")}">
            </div>
            <div>
              <label>Platser kvar</label>
              <input type="number" name="seats_left" value="${esc(r.seats_left!=null?String(r.seats_left):"")}">
            </div>
            <div>
              <label>Instruktör</label>
              <input type="text" name="instructor" value="${esc(r.instructor||"")}">
            </div>
            <div>
              <label>Status</label>
              <select name="status">
                ${instanceStatuses.map(s => `<option value="${s}"${r.status===s?" selected":""}>${s}</option>`).join("")}
              </select>
            </div>
            <div class="form-actions">
              <button class="btn--save ci-save-btn" data-id="${esc(r.id)}">Spara</button>
              <button class="btn--cancel-edit ci-cancel-btn" data-id="${esc(r.id)}">Avbryt</button>
              <span class="status-msg"></span>
            </div>
          </div>
        </td>
      </tr>`).join("");

    const tableHtml = rows.length
      ? `<div style="overflow-x:auto"><table class="table">
          <thead><tr><th>Kurs</th><th>Stad</th><th>Lokal</th><th>Start</th><th>Platser tot/kvar</th><th>Status</th><th></th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table></div>`
      : emptyState("Inga kurstillfällen hittades.");

    return `<div class="abar">
        <button class="btn btn--primary btn--sm" id="new-ci-toggle">+ Nytt kurstillfälle</button>
      </div>
      <div id="new-ci-form" style="display:none" class="new-row-section">
        <div class="inline-form">
          <div>
            <label>Kurs *</label>
            <select id="nci-course_id"><option value="">– välj kurs –</option>${courseOpts}</select>
          </div>
          <div>
            <label>Stad</label>
            <input type="text" id="nci-city" placeholder="Stockholm">
          </div>
          <div>
            <label>Lokal</label>
            <input type="text" id="nci-venue" placeholder="Konferensrum A">
          </div>
          <div>
            <label>Start (datum/tid)</label>
            <input type="datetime-local" id="nci-start_at">
          </div>
          <div>
            <label>Slut (datum/tid)</label>
            <input type="datetime-local" id="nci-end_at">
          </div>
          <div>
            <label>Prisetikett</label>
            <input type="text" id="nci-price_label" placeholder="1 990 kr">
          </div>
          <div>
            <label>Totalt platser</label>
            <input type="number" id="nci-seats_total" placeholder="12">
          </div>
          <div>
            <label>Platser kvar</label>
            <input type="number" id="nci-seats_left" placeholder="12">
          </div>
          <div>
            <label>Instruktör</label>
            <input type="text" id="nci-instructor" placeholder="Förnamn Efternamn">
          </div>
          <div>
            <label>Status</label>
            <select id="nci-status">
              <option value="open">open</option>
              <option value="full">full</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div class="form-actions">
            <button class="btn--save" id="nci-save-btn">Skapa kurstillfälle</button>
            <button class="btn--cancel-edit" id="nci-cancel-btn">Avbryt</button>
            <span class="status-msg" id="nci-msg"></span>
          </div>
        </div>
      </div>
      ${tableHtml}`;
  }

  /* ══════════════════════════════════════════════════════════
     PRODUCTS — list + inline edit + new product
  ══════════════════════════════════════════════════════════ */
  function renderProducts(rows) {
    const stockOptions = ["I lager","Få i lager","Slut i lager"];

    const rowsHtml = rows.map(r => `
      <tr data-id="${esc(r.id)}" class="prod-row">
        <td><b>${esc(r.name || "–")}</b><div class="muted" style="font-size:12px">${esc(r.usp || "")}</div></td>
        <td>${esc(r.brand || "–")}</td>
        <td>${fmtMoney(r.price_incl_vat)}</td>
        <td>${esc(r.stock_status || "–")}</td>
        <td>${r.active ? '<span class="badge badge--green">Aktiv</span>' : '<span class="badge">Inaktiv</span>'}</td>
        <td><button class="btn--edit prod-edit-btn" data-id="${esc(r.id)}">Redigera</button></td>
      </tr>
      <tr class="prod-edit-row" id="prod-edit-${esc(r.id)}" style="display:none">
        <td colspan="6">
          <div class="inline-form">
            <div>
              <label>Namn</label>
              <input type="text" name="name" value="${esc(r.name||"")}">
            </div>
            <div>
              <label>USP / kortbeskrivning</label>
              <input type="text" name="usp" value="${esc(r.usp||"")}">
            </div>
            <div>
              <label>Pris inkl. moms (kr)</label>
              <input type="number" name="price_incl_vat" value="${esc(r.price_incl_vat!=null?String(r.price_incl_vat):"")}">
            </div>
            <div>
              <label>Pris exkl. moms (kr)</label>
              <input type="number" name="price_excl_vat" value="${esc(r.price_excl_vat!=null?String(r.price_excl_vat):"")}">
            </div>
            <div>
              <label>Lagerstatus</label>
              <select name="stock_status">
                ${stockOptions.map(s => `<option value="${s}"${r.stock_status===s?" selected":""}>${s}</option>`).join("")}
              </select>
            </div>
            <div>
              <label><input type="checkbox" name="active" style="width:auto;margin-right:6px"${r.active?" checked":""}> Aktiv</label>
            </div>
            <div class="form-actions">
              <button class="btn--save prod-save-btn" data-id="${esc(r.id)}">Spara</button>
              <button class="btn--cancel-edit prod-cancel-btn" data-id="${esc(r.id)}">Avbryt</button>
              <span class="status-msg"></span>
            </div>
          </div>
        </td>
      </tr>`).join("");

    const tableHtml = rows.length
      ? `<div style="overflow-x:auto"><table class="table">
          <thead><tr><th>Namn</th><th>Varumärke</th><th>Pris inkl. moms</th><th>Lagerstatus</th><th>Aktiv</th><th></th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table></div>`
      : emptyState("Inga produkter hittades.");

    return `<div class="abar">
        <button class="btn btn--primary btn--sm" id="new-prod-toggle">+ Ny produkt</button>
      </div>
      <div id="new-prod-form" style="display:none" class="new-row-section">
        <div class="inline-form">
          <div>
            <label>Namn *</label>
            <input type="text" id="np-name" placeholder="Produktens namn">
          </div>
          <div>
            <label>USP / kortbeskrivning</label>
            <input type="text" id="np-usp" placeholder="Kort säljande mening">
          </div>
          <div>
            <label>Pris inkl. moms (kr)</label>
            <input type="number" id="np-price_incl_vat" placeholder="1990">
          </div>
          <div>
            <label>Pris exkl. moms (kr)</label>
            <input type="number" id="np-price_excl_vat" placeholder="1592">
          </div>
          <div>
            <label>Lagerstatus</label>
            <select id="np-stock_status">
              ${stockOptions.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>
          <div>
            <label><input type="checkbox" id="np-active" style="width:auto;margin-right:6px" checked> Aktiv</label>
          </div>
          <div class="form-actions">
            <button class="btn--save" id="np-save-btn">Skapa produkt</button>
            <button class="btn--cancel-edit" id="np-cancel-btn">Avbryt</button>
            <span class="status-msg" id="np-msg"></span>
          </div>
        </div>
      </div>
      ${tableHtml}`;
  }

  /* ══════════════════════════════════════════════════════════
     SITE CONTENT — list + inline edit of value + delete
  ══════════════════════════════════════════════════════════ */
  function renderSiteContent(rows) {
    const infoCard = `<div class="info-card">
      <strong>Tips:</strong> Texter redigeras enklast direkt på sajten: logga in som admin, öppna valfri sida och klicka <b>✎ Redigera texter</b> nere till vänster. Här ser du och kan finjustera allt som publicerats.
      <div class="quick-links">
        <a class="btn btn--outline btn--sm" href="index.html" target="_blank">Startsidan</a>
        <a class="btn btn--outline btn--sm" href="om-oss.html" target="_blank">Om oss</a>
        <a class="btn btn--outline btn--sm" href="foretag.html" target="_blank">Företag</a>
        <a class="btn btn--outline btn--sm" href="webbshop.html" target="_blank">Webbshop</a>
      </div>
    </div>`;

    if (!rows.length) return infoCard + emptyState("Inga texter hittades.");

    const rowsHtml = rows.map(r => `
      <tr data-key="${esc(r.key)}" class="sc-row">
        <td><code style="font-size:12px">${esc(r.key)}</code></td>
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((r.value||"").slice(0,80))}${(r.value||"").length>80?"…":""}</td>
        <td>${esc(r.page||"–")}</td>
        <td>${fmtDate(r.updated_at)}</td>
        <td style="white-space:nowrap">
          <button class="btn--edit sc-edit-btn" data-key="${esc(r.key)}" style="margin-right:4px">Redigera</button>
          <button class="btn--danger sc-delete-btn" data-key="${esc(r.key)}">Ta bort</button>
        </td>
      </tr>
      <tr class="sc-edit-row" id="sc-edit-${esc(r.key)}" style="display:none">
        <td colspan="5">
          <div class="inline-form" style="grid-template-columns:1fr">
            <div>
              <label>Nyckel</label>
              <input type="text" disabled value="${esc(r.key)}" style="background:#f5f5f5;color:var(--muted)">
            </div>
            <div>
              <label>Värde</label>
              <textarea name="value" rows="4">${esc(r.value||"")}</textarea>
            </div>
            <div class="form-actions">
              <button class="btn--save sc-save-btn" data-key="${esc(r.key)}">Spara</button>
              <button class="btn--cancel-edit sc-cancel-btn" data-key="${esc(r.key)}">Avbryt</button>
              <span class="status-msg"></span>
            </div>
          </div>
        </td>
      </tr>`).join("");

    return infoCard + `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Nyckel</th><th>Värde (förhandsgranskning)</th><th>Sida</th><th>Uppdaterad</th><th></th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table></div>`;
  }

  /* ── TABLE_RENDERERS (static tables only; editable ones handled in bindView) */
  const TABLE_RENDERERS = {
    contact_messages: renderContactMessages,
  };

  /* ── dashboard view ───────────────────────────────────── */
  function renderDashboard(counts) {
    const b = counts.bookings ?? 0;
    const o = counts.orders ?? 0;
    const q = counts.quote_requests ?? 0;
    const c = counts.contact_messages ?? 0;
    return `
      <div class="kpi4">
        <div class="card"><div class="card__body">
          <span class="muted" style="font-size:13px">Bokningar (totalt)</span>
          <b style="font-family:var(--font-display);font-size:2rem;font-weight:800;line-height:1;display:block">${b}</b>
        </div></div>
        <div class="card"><div class="card__body">
          <span class="muted" style="font-size:13px">Ordrar (totalt)</span>
          <b style="font-family:var(--font-display);font-size:2rem;font-weight:800;line-height:1;display:block">${o}</b>
        </div></div>
        <div class="card"><div class="card__body">
          <span class="muted" style="font-size:13px">Offertförfrågningar</span>
          <b style="font-family:var(--font-display);font-size:2rem;font-weight:800;line-height:1;display:block">${q}</b>
        </div></div>
        <div class="card"><div class="card__body">
          <span class="muted" style="font-size:13px">Kontaktmeddelanden</span>
          <b style="font-family:var(--font-display);font-size:2rem;font-weight:800;line-height:1;display:block">${c}</b>
        </div></div>
      </div>
      <div class="card" style="margin-top:0">
        <div class="card__body">
          <p class="muted" style="font-size:14px">Välkommen till adminpanelen. Använd menyn till vänster för att bläddra bland bokningar, ordrar, offertförfrågningar, meddelanden, kurser, kurstillfällen och produkter.</p>
        </div>
      </div>`;
  }

  /* ── gated message (not admin) ───────────────────────── */
  function renderGate() {
    return `
      <div style="max-width:480px;margin:80px auto;text-align:center">
        <div class="feature__ic" style="margin:0 auto 20px;width:56px;height:56px;font-size:24px">🔒</div>
        <h2 class="h3" style="margin-bottom:12px">Adminbehörighet krävs</h2>
        <p class="muted" style="margin-bottom:24px">Logga in som administratör för att komma åt den här sidan.</p>
        <a href="logga-in.html" class="btn btn--primary">Logga in som administratör</a>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════════
     EVENT BINDING — wires up interactive parts after innerHTML
  ══════════════════════════════════════════════════════════ */

  /* Helper: set button state */
  function setBtnState(btn, saving) {
    if (!btn) return;
    btn.disabled = saving;
    btn.textContent = saving ? "Sparar…" : btn.dataset.label || btn.textContent;
  }

  /* Generic status-select handler (bookings, orders, quote_requests) */
  function bindStatusSelects(container) {
    container.querySelectorAll("select.status-sel").forEach(sel => {
      sel.addEventListener("change", async function () {
        const table = this.dataset.table;
        const id = this.dataset.id;
        const field = this.dataset.field || "status";
        const val = this.value;
        const msgEl = this.nextElementSibling;
        if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
        try {
          const { error } = await PA.sb.from(table).update({ [field]: val }).eq("id", id);
          if (error) throw error;
          if (msgEl) showSaved(msgEl);
        } catch (e) {
          if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
        }
      });
    });
  }

  /* ── COURSES events ─────────────────────────────────── */
  function bindCoursesView(container, reloadFn) {
    /* toggle edit rows */
    container.querySelectorAll(".course-edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#course-edit-${id}`);
        if (editRow) editRow.style.display = editRow.style.display === "none" ? "" : "none";
      });
    });
    container.querySelectorAll(".course-cancel-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#course-edit-${id}`);
        if (editRow) editRow.style.display = "none";
      });
    });

    /* save existing course */
    container.querySelectorAll(".course-save-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const id = this.dataset.id;
        const row = container.querySelector(`#course-edit-${id}`);
        if (!row) return;
        const msgEl = row.querySelector(".status-msg");
        if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
        const data = {
          title: row.querySelector("[name=title]").value.trim(),
          description: row.querySelector("[name=description]").value.trim(),
          duration: row.querySelector("[name=duration]").value.trim(),
          price_label: row.querySelector("[name=price_label]").value.trim(),
          price_unit: row.querySelector("[name=price_unit]").value.trim(),
          active: row.querySelector("[name=active]").checked,
        };
        setBtnState(this, true);
        try {
          const { error } = await PA.sb.from("courses").update(data).eq("id", id);
          if (error) throw error;
          if (msgEl) showSaved(msgEl);
        } catch (e) {
          if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
        } finally {
          setBtnState(this, false);
        }
      });
    });

    /* new course toggle */
    const newToggle = container.querySelector("#new-course-toggle");
    const newForm = container.querySelector("#new-course-form");
    if (newToggle && newForm) {
      newToggle.addEventListener("click", () => {
        newForm.style.display = newForm.style.display === "none" ? "" : "none";
      });
      const cancelBtn = newForm.querySelector("#nc-cancel-btn");
      if (cancelBtn) cancelBtn.addEventListener("click", () => { newForm.style.display = "none"; });

      const saveBtn = newForm.querySelector("#nc-save-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
          const msgEl = newForm.querySelector("#nc-msg");
          if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
          const title = newForm.querySelector("#nc-title").value.trim();
          if (!title) { if (msgEl) showErr(msgEl, "Titel krävs."); return; }
          const slug = slugify(title);
          const data = {
            title,
            slug,
            description: newForm.querySelector("#nc-description").value.trim(),
            duration: newForm.querySelector("#nc-duration").value.trim(),
            price_label: newForm.querySelector("#nc-price_label").value.trim(),
            price_unit: newForm.querySelector("#nc-price_unit").value.trim(),
            active: newForm.querySelector("#nc-active").checked,
          };
          setBtnState(this, true);
          try {
            const { error } = await PA.sb.from("courses").insert(data);
            if (error) throw error;
            if (msgEl) showSaved(msgEl);
            newForm.style.display = "none";
            reloadFn();
          } catch (e) {
            if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
          } finally {
            setBtnState(this, false);
          }
        });
      }
    }
  }

  /* ── COURSE INSTANCES events ─────────────────────────── */
  function bindCourseInstancesView(container, reloadFn) {
    /* toggle edit rows */
    container.querySelectorAll(".ci-edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#ci-edit-${id}`);
        if (editRow) editRow.style.display = editRow.style.display === "none" ? "" : "none";
      });
    });
    container.querySelectorAll(".ci-cancel-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#ci-edit-${id}`);
        if (editRow) editRow.style.display = "none";
      });
    });

    /* save existing instance */
    container.querySelectorAll(".ci-save-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const id = this.dataset.id;
        const row = container.querySelector(`#ci-edit-${id}`);
        if (!row) return;
        const msgEl = row.querySelector(".status-msg");
        if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
        const toNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
        const data = {
          city: row.querySelector("[name=city]").value.trim(),
          venue: row.querySelector("[name=venue]").value.trim(),
          start_at: row.querySelector("[name=start_at]").value || null,
          end_at: row.querySelector("[name=end_at]").value || null,
          price_label: row.querySelector("[name=price_label]").value.trim(),
          seats_total: toNum(row.querySelector("[name=seats_total]").value),
          seats_left: toNum(row.querySelector("[name=seats_left]").value),
          instructor: row.querySelector("[name=instructor]").value.trim(),
          status: row.querySelector("[name=status]").value,
        };
        setBtnState(this, true);
        try {
          const { error } = await PA.sb.from("course_instances").update(data).eq("id", id);
          if (error) throw error;
          if (msgEl) showSaved(msgEl);
        } catch (e) {
          if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
        } finally {
          setBtnState(this, false);
        }
      });
    });

    /* delete instance */
    container.querySelectorAll(".ci-delete-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const id = this.dataset.id;
        if (!confirm("Ta bort detta kurstillfälle? Åtgärden kan inte ångras.")) return;
        const row = container.querySelector(`tr[data-id="${id}"].ci-row`);
        try {
          const { error } = await PA.sb.from("course_instances").delete().eq("id", id);
          if (error) throw error;
          const editRow = container.querySelector(`#ci-edit-${id}`);
          if (row) row.remove();
          if (editRow) editRow.remove();
        } catch (e) {
          alert("Fel vid borttagning: " + (e.message || String(e)));
        }
      });
    });

    /* new instance toggle */
    const newToggle = container.querySelector("#new-ci-toggle");
    const newForm = container.querySelector("#new-ci-form");
    if (newToggle && newForm) {
      newToggle.addEventListener("click", () => {
        newForm.style.display = newForm.style.display === "none" ? "" : "none";
      });
      const cancelBtn = newForm.querySelector("#nci-cancel-btn");
      if (cancelBtn) cancelBtn.addEventListener("click", () => { newForm.style.display = "none"; });

      const saveBtn = newForm.querySelector("#nci-save-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
          const msgEl = newForm.querySelector("#nci-msg");
          if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
          const courseId = newForm.querySelector("#nci-course_id").value;
          if (!courseId) { if (msgEl) showErr(msgEl, "Välj en kurs."); return; }
          const toNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
          const data = {
            course_id: courseId,
            city: newForm.querySelector("#nci-city").value.trim(),
            venue: newForm.querySelector("#nci-venue").value.trim(),
            start_at: newForm.querySelector("#nci-start_at").value || null,
            end_at: newForm.querySelector("#nci-end_at").value || null,
            price_label: newForm.querySelector("#nci-price_label").value.trim(),
            seats_total: toNum(newForm.querySelector("#nci-seats_total").value),
            seats_left: toNum(newForm.querySelector("#nci-seats_left").value),
            instructor: newForm.querySelector("#nci-instructor").value.trim(),
            status: newForm.querySelector("#nci-status").value,
          };
          setBtnState(this, true);
          try {
            const { error } = await PA.sb.from("course_instances").insert(data);
            if (error) throw error;
            if (msgEl) showSaved(msgEl);
            newForm.style.display = "none";
            reloadFn();
          } catch (e) {
            if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
          } finally {
            setBtnState(this, false);
          }
        });
      }
    }
  }

  /* ── PRODUCTS events ────────────────────────────────── */
  function bindProductsView(container, reloadFn) {
    /* toggle edit rows */
    container.querySelectorAll(".prod-edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#prod-edit-${id}`);
        if (editRow) editRow.style.display = editRow.style.display === "none" ? "" : "none";
      });
    });
    container.querySelectorAll(".prod-cancel-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const editRow = container.querySelector(`#prod-edit-${id}`);
        if (editRow) editRow.style.display = "none";
      });
    });

    /* save existing product */
    container.querySelectorAll(".prod-save-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const id = this.dataset.id;
        const row = container.querySelector(`#prod-edit-${id}`);
        if (!row) return;
        const msgEl = row.querySelector(".status-msg");
        if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
        const toNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
        const data = {
          name: row.querySelector("[name=name]").value.trim(),
          usp: row.querySelector("[name=usp]").value.trim(),
          price_incl_vat: toNum(row.querySelector("[name=price_incl_vat]").value),
          price_excl_vat: toNum(row.querySelector("[name=price_excl_vat]").value),
          stock_status: row.querySelector("[name=stock_status]").value,
          active: row.querySelector("[name=active]").checked,
        };
        setBtnState(this, true);
        try {
          const { error } = await PA.sb.from("products").update(data).eq("id", id);
          if (error) throw error;
          if (msgEl) showSaved(msgEl);
        } catch (e) {
          if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
        } finally {
          setBtnState(this, false);
        }
      });
    });

    /* new product toggle */
    const newToggle = container.querySelector("#new-prod-toggle");
    const newForm = container.querySelector("#new-prod-form");
    if (newToggle && newForm) {
      newToggle.addEventListener("click", () => {
        newForm.style.display = newForm.style.display === "none" ? "" : "none";
      });
      const cancelBtn = newForm.querySelector("#np-cancel-btn");
      if (cancelBtn) cancelBtn.addEventListener("click", () => { newForm.style.display = "none"; });

      const saveBtn = newForm.querySelector("#np-save-btn");
      if (saveBtn) {
        saveBtn.addEventListener("click", async function () {
          const msgEl = newForm.querySelector("#np-msg");
          if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
          const name = newForm.querySelector("#np-name").value.trim();
          if (!name) { if (msgEl) showErr(msgEl, "Namn krävs."); return; }
          const slug = slugify(name);
          const toNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
          const data = {
            name,
            slug,
            usp: newForm.querySelector("#np-usp").value.trim(),
            price_incl_vat: toNum(newForm.querySelector("#np-price_incl_vat").value),
            price_excl_vat: toNum(newForm.querySelector("#np-price_excl_vat").value),
            stock_status: newForm.querySelector("#np-stock_status").value,
            active: newForm.querySelector("#np-active").checked,
          };
          setBtnState(this, true);
          try {
            const { error } = await PA.sb.from("products").insert(data);
            if (error) throw error;
            if (msgEl) showSaved(msgEl);
            newForm.style.display = "none";
            reloadFn();
          } catch (e) {
            if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
          } finally {
            setBtnState(this, false);
          }
        });
      }
    }
  }

  /* ── SITE CONTENT events ───────────────────────────── */
  function bindSiteContentView(container, reloadFn) {
    /* toggle edit rows */
    container.querySelectorAll(".sc-edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const key = this.dataset.key;
        const editRow = container.querySelector(`#sc-edit-${CSS.escape(key)}`);
        if (editRow) editRow.style.display = editRow.style.display === "none" ? "" : "none";
      });
    });
    container.querySelectorAll(".sc-cancel-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const key = this.dataset.key;
        const editRow = container.querySelector(`#sc-edit-${CSS.escape(key)}`);
        if (editRow) editRow.style.display = "none";
      });
    });

    /* save site_content value */
    container.querySelectorAll(".sc-save-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const key = this.dataset.key;
        const row = container.querySelector(`#sc-edit-${CSS.escape(key)}`);
        if (!row) return;
        const msgEl = row.querySelector(".status-msg");
        if (msgEl) { msgEl.textContent = ""; msgEl.className = "status-msg"; }
        const value = row.querySelector("[name=value]").value;
        setBtnState(this, true);
        try {
          const { error } = await PA.sb.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
          if (error) throw error;
          if (msgEl) showSaved(msgEl);
        } catch (e) {
          if (msgEl) showErr(msgEl, "Fel: " + (e.message || String(e)));
        } finally {
          setBtnState(this, false);
        }
      });
    });

    /* delete site_content row */
    container.querySelectorAll(".sc-delete-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const key = this.dataset.key;
        if (!confirm(`Ta bort textraden "${key}"? Åtgärden kan inte ångras.`)) return;
        try {
          const { error } = await PA.sb.from("site_content").delete().eq("key", key);
          if (error) throw error;
          const dataRow = container.querySelector(`tr[data-key="${key}"].sc-row`);
          const editRow = container.querySelector(`#sc-edit-${CSS.escape(key)}`);
          if (dataRow) dataRow.remove();
          if (editRow) editRow.remove();
        } catch (e) {
          alert("Fel vid borttagning: " + (e.message || String(e)));
        }
      });
    });
  }

  /* ── main init ────────────────────────────────────────── */
  async function init() {
    const main = document.getElementById("admin-main");
    const sidebar = document.getElementById("admin-sidebar");
    const topbar = document.getElementById("admin-topbar");

    if (!main) return;

    // 1. Gate check
    let profile = null;
    try {
      profile = await PA.Auth.profile();
    } catch (e) {
      // backend not configured or network error
    }

    if (!profile || profile.role !== "admin") {
      if (sidebar) sidebar.querySelectorAll("nav").forEach(n => n.remove());
      main.innerHTML = renderGate();
      return;
    }

    // 2. Populate top bar with user info + logout
    if (topbar) {
      const nameEl = topbar.querySelector("#admin-user-name");
      const emailEl = topbar.querySelector("#admin-user-email");
      const avatarEl = topbar.querySelector("#admin-user-avatar");
      const logoutBtn = topbar.querySelector("#admin-logout");
      if (nameEl) nameEl.textContent = profile.name || profile.email || "Admin";
      if (emailEl) emailEl.textContent = profile.email || "";
      if (avatarEl) {
        const initials = (profile.name || profile.email || "A")
          .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          await PA.Auth.signOut();
          window.location.href = "logga-in.html";
        });
      }
    }

    // 3. Fetch KPI counts
    let counts = { bookings: 0, orders: 0, quote_requests: 0, contact_messages: 0 };
    try {
      counts = await PA.db.adminCounts();
    } catch (e) {
      // counts stay zero
    }

    // 4. Wire sidebar nav
    let currentView = "dashboard";
    const navLinks = sidebar ? sidebar.querySelectorAll("a[data-view]") : [];

    async function showView(viewKey) {
      currentView = viewKey;
      navLinks.forEach(a => {
        a.classList.toggle("on", a.dataset.view === viewKey);
      });
      const titleEl = document.getElementById("admin-page-title");
      if (titleEl) titleEl.textContent = VIEWS[viewKey]?.label || "Dashboard";

      if (viewKey === "dashboard") {
        main.innerHTML = renderDashboard(counts);
        return;
      }

      main.innerHTML = loadingState();

      /* ── COURSES ─────────────────────────────────────── */
      if (viewKey === "courses") {
        try {
          const rows = await PA.db.adminList("courses");
          main.innerHTML = renderCourses(rows);
          bindCoursesView(main, () => showView("courses"));
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── COURSE INSTANCES ────────────────────────────── */
      if (viewKey === "course_instances") {
        try {
          const [rows, courseRows] = await Promise.all([
            PA.db.adminList("course_instances"),
            PA.db.adminList("courses"),
          ]);
          main.innerHTML = renderCourseInstances(rows, courseRows);
          bindCourseInstancesView(main, () => showView("course_instances"));
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── PRODUCTS ────────────────────────────────────── */
      if (viewKey === "products") {
        try {
          const rows = await PA.db.adminList("products");
          main.innerHTML = renderProducts(rows);
          bindProductsView(main, () => showView("products"));
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── BOOKINGS ────────────────────────────────────── */
      if (viewKey === "bookings") {
        try {
          const rows = await PA.db.adminList("bookings");
          main.innerHTML = renderBookings(rows, main);
          bindStatusSelects(main);
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── ORDERS ──────────────────────────────────────── */
      if (viewKey === "orders") {
        try {
          const rows = await PA.db.adminList("orders");
          main.innerHTML = renderOrders(rows);
          bindStatusSelects(main);
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── QUOTE REQUESTS ──────────────────────────────── */
      if (viewKey === "quote_requests") {
        try {
          const rows = await PA.db.adminList("quote_requests");
          main.innerHTML = renderQuoteRequests(rows);
          bindStatusSelects(main);
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── SITE CONTENT ────────────────────────────────── */
      if (viewKey === "site_content") {
        try {
          const rows = await PA.db.adminList("site_content");
          main.innerHTML = renderSiteContent(rows);
          bindSiteContentView(main, () => showView("site_content"));
        } catch (e) {
          main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
        }
        return;
      }

      /* ── fallback (contact_messages + any future static views) */
      const tableKey = VIEWS[viewKey]?.table;
      if (!tableKey) { main.innerHTML = emptyState("Ingen visning tillgänglig."); return; }
      try {
        const rows = await PA.db.adminList(tableKey);
        const renderer = TABLE_RENDERERS[tableKey];
        main.innerHTML = renderer ? renderer(rows) : emptyState("Ingen visning tillgänglig.");
      } catch (e) {
        main.innerHTML = errorState("Kunde inte ladda data: " + (e.message || String(e)));
      }
    }

    navLinks.forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showView(a.dataset.view);
      });
    });

    // 5. Show dashboard on load
    showView("dashboard");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
