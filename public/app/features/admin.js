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
      cancelled: "badge--danger", lost: "badge--danger", refunded: "badge--danger",
      new: "badge--info", sent: "badge--coral",
      draft: "", inactive: "",
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
  };

  /* ── table renderers ──────────────────────────────────── */
  function renderBookings(rows) {
    if (!rows.length) return emptyState("Inga bokningar hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>ID</th><th>Kund</th><th>E-post</th><th>Företag</th><th>Kursinstans-ID</th><th>Typ</th><th>Status</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><span class="muted" style="font-size:12px;font-family:var(--font-mono)">${esc(String(r.id).slice(0,8))}…</span></td>
        <td><b>${esc(r.contact_name || "–")}</b></td>
        <td>${esc(r.contact_email || "–")}</td>
        <td>${esc(r.company_name || "–")}</td>
        <td><span class="muted" style="font-size:12px;font-family:var(--font-mono)">${esc(String(r.course_instance_id || "–").slice(0,8))}…</span></td>
        <td>${esc(r.booking_type || "–")}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderOrders(rows) {
    if (!rows.length) return emptyState("Inga ordrar hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Ordernr</th><th>Kund</th><th>E-post</th><th>Företag</th><th>Totalt</th><th>Betalsätt</th><th>Status</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b style="font-family:var(--font-mono);font-size:13px">${esc(r.order_number || "–")}</b></td>
        <td>${esc(r.customer_name || "–")}</td>
        <td>${esc(r.customer_email || "–")}</td>
        <td>${esc(r.company_name || "–")}</td>
        <td>${fmtMoney(r.total_incl_vat)}</td>
        <td>${esc(r.payment_method || "–")}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderQuoteRequests(rows) {
    if (!rows.length) return emptyState("Inga offertförfrågningar hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Kontakt</th><th>E-post</th><th>Företag</th><th>Telefon</th><th>Kurs</th><th>Deltagare</th><th>Status</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b>${esc(r.contact_name || "–")}</b></td>
        <td>${esc(r.contact_email || "–")}</td>
        <td>${esc(r.company_name || r.organization || "–")}</td>
        <td>${esc(r.contact_phone || r.phone || "–")}</td>
        <td>${esc(r.course_title || r.course || "–")}</td>
        <td>${esc(r.participant_count != null ? String(r.participant_count) : (r.participants || "–"))}</td>
        <td>${statusBadge(r.status || "new")}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderContactMessages(rows) {
    if (!rows.length) return emptyState("Inga kontaktmeddelanden hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Namn</th><th>E-post</th><th>Ämne</th><th>Meddelande</th><th>Status</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b>${esc(r.name || "–")}</b></td>
        <td>${esc(r.email || "–")}</td>
        <td>${esc(r.subject || "–")}</td>
        <td style="max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc((r.message || "").slice(0, 80))}${(r.message || "").length > 80 ? "…" : ""}</td>
        <td>${statusBadge(r.status || "new")}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderCourses(rows) {
    if (!rows.length) return emptyState("Inga kurser hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Titel</th><th>Slug</th><th>Kategori</th><th>Målgrupp</th><th>Pris</th><th>Aktiv</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b>${esc(r.title || "–")}</b></td>
        <td><span style="font-family:var(--font-mono);font-size:12px">${esc(r.slug || "–")}</span></td>
        <td>${esc(r.category || "–")}</td>
        <td>${esc(r.audience || "–")}</td>
        <td>${esc(r.price_label || (r.price_incl_vat != null ? fmtMoney(r.price_incl_vat) : "–"))}</td>
        <td>${r.active ? '<span class="badge badge--green">Aktiv</span>' : '<span class="badge">Inaktiv</span>'}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderCourseInstances(rows) {
    if (!rows.length) return emptyState("Inga kurstillfällen hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Kurs</th><th>Stad</th><th>Lokal</th><th>Start</th><th>Slut</th><th>Platser</th><th>Kvar</th><th>Status</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b>${esc(r.course_title || r.course_id || "–")}</b></td>
        <td>${esc(r.city || "–")}</td>
        <td>${esc(r.venue || "–")}</td>
        <td>${fmtDate(r.start_at)}</td>
        <td>${fmtDate(r.end_at)}</td>
        <td>${esc(r.seats != null ? String(r.seats) : "–")}</td>
        <td>${esc(r.seats_left != null ? String(r.seats_left) : "–")}</td>
        <td>${statusBadge(r.status || "active")}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderProducts(rows) {
    if (!rows.length) return emptyState("Inga produkter hittades.");
    return `<div style="overflow-x:auto"><table class="table">
      <thead><tr><th>Namn</th><th>Varumärke</th><th>Pris inkl. moms</th><th>Pris exkl. moms</th><th>Lagerstatus</th><th>Aktiv</th><th>Skapad</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><b>${esc(r.name || "–")}</b><div class="muted" style="font-size:12px">${esc(r.usp || "")}</div></td>
        <td>${esc(r.brand || "–")}</td>
        <td>${fmtMoney(r.price_incl_vat)}</td>
        <td>${fmtMoney(r.price_excl_vat)}</td>
        <td>${esc(r.stock_status || "–")}</td>
        <td>${r.active ? '<span class="badge badge--green">Aktiv</span>' : '<span class="badge">Inaktiv</span>'}</td>
        <td>${fmtDate(r.created_at)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  const TABLE_RENDERERS = {
    bookings: renderBookings,
    orders: renderOrders,
    quote_requests: renderQuoteRequests,
    contact_messages: renderContactMessages,
    courses: renderCourses,
    course_instances: renderCourseInstances,
    products: renderProducts,
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
      // hide sidebar nav links (keep logo), show gate message
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
      // counts stay zero; will show on dashboard
    }

    // 4. Wire sidebar nav
    let currentView = "dashboard";
    const navLinks = sidebar ? sidebar.querySelectorAll("a[data-view]") : [];

    async function showView(viewKey) {
      currentView = viewKey;
      // update active state
      navLinks.forEach(a => {
        a.classList.toggle("on", a.dataset.view === viewKey);
      });
      // update page title
      const titleEl = document.getElementById("admin-page-title");
      if (titleEl) titleEl.textContent = VIEWS[viewKey]?.label || "Dashboard";

      if (viewKey === "dashboard") {
        main.innerHTML = renderDashboard(counts);
        return;
      }

      const tableKey = VIEWS[viewKey]?.table;
      if (!tableKey) return;

      main.innerHTML = loadingState();
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
