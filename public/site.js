/* PulsAkademin — shared chrome: topbar, header w/ mega menus, mobile drawer, footer */
(function () {
  const P = (window.SITE_BASE || ""); // path prefix if needed

  /* ---- inline icon set ---- */
  const I = {
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    user: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.2l2.3 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H5"/></svg>',
    caret: '<svg class="caret" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg>',
    burger: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    plus: '<svg class="pm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.5-1.5H17V.2C16.5.1 15.4 0 14.3 0 11.8 0 10 1.5 10 4.3V6H7v3h3v9h4z"/></svg>',
    insta: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    ln: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4V24h-4zM8 8h3.8v2.2h.05c.53-1 1.83-2.2 3.95-2.2 4.2 0 5 2.77 5 6.37V24h-4v-7c0-1.67-.03-3.8-2.3-3.8s-2.66 1.8-2.66 3.66V24H8z"/></svg>'
  };

  const ecg = (cls) => `<svg class="ecg ${cls||''}" width="34" height="20" viewBox="0 0 60 24" aria-hidden="true"><path d="M0 12h12l4-9 6 18 5-13 4 8h20"/></svg>`;

  const logo = `<a href="${P}index.html" class="logo" aria-label="PulsAkademin – startsida">
    <span class="mark"><svg width="22" height="22" viewBox="0 0 60 24" aria-hidden="true"><path d="M0 12h12l4-9 6 18 5-13 4 8h20" fill="none" stroke="#FBF6F0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    Puls<b>Akademin</b></a>`;

  /* ---- nav data ---- */
  const nav = [
    { label: "Utbildningar", href: "utbildningar.html", mega: {
      cols: [
        { h: "Allmänhet & företag", items: [
          ["HLR vuxen", "Grund · 2 tim", "kurs-hlr-vuxen.html"],
          ["HLR barn", "Grund · 2 tim", "utbildningar.html"],
          ["HLR barn & vuxen", "Kombination · 3 tim", "utbildningar.html"],
          ["Första hjälpen & HLR", "Halvdag", "utbildningar.html"],
        ]},
        { h: "Sjukvård & specialist", items: [
          ["S-HLR vuxen", "För vårdpersonal", "utbildningar.html"],
          ["S-HLR barn", "För vårdpersonal", "utbildningar.html"],
          ["Grundläggande brandskydd", "Halvdag", "utbildningar.html"],
          ["Hot, våld & aggressivt beteende", "Halvdag", "utbildningar.html"],
        ]},
      ],
      promo: { t: "Repetitionsutbildning", d: "Håll kompetensbeviset aktuellt. Korta uppdateringskurser från 499 kr.", href: "utbildningar.html" }
    }},
    { label: "Boka kurs", href: "boka.html" },
    { label: "Hjärtstartare", href: "hjartstartare.html", mega: {
      wide: true,
      cols: [
        { h: "Köp & jämför", items: [
          ["Köp hjärtstartare", "Alla modeller", "hjartstartare.html"],
          ["Jämför hjärtstartare", "Sida vid sida", "hjartstartare.html"],
          ["Guide: vilken passar?", "Hitta rätt AED", "hjartstartare.html"],
        ]},
        { h: "Tillbehör", items: [
          ["Batterier", "Per modell", "webbshop.html"],
          ["Elektroder", "Vuxen & barn", "webbshop.html"],
          ["Skåp & väggfästen", "Inne & ute", "webbshop.html"],
          ["Väskor", "Per modell", "webbshop.html"],
        ]},
        { h: "Tjänster", items: [
          ["Hyr hjärtstartare", "Event & projekt", "hyr.html"],
          ["Service & underhåll", "Serviceavtal", "service.html"],
          ["Paketlösningar", "AED + skåp + utbildning", "webbshop.html"],
        ]},
      ],
      promo: { t: "Osäker på valet?", d: "Svara på 5 frågor – få en rekommendation på minuter.", href: "hjartstartare.html" }
    }},
    { label: "Webbshop", href: "webbshop.html" },
    { label: "För företag", href: "foretag.html" },
    { label: "Kunskapsbank", href: "kunskapsbank.html" },
    { label: "Om oss", href: "om-oss.html" },
  ];

  function megaHTML(m) {
    const cols = m.cols.map(c => `<div class="mega__col"><h5>${c.h}</h5>${
      c.items.map(([t,d,h]) => `<a href="${P}${h}"><b>${t}</b><span>${d}</span></a>`).join("")
    }</div>`).join("");
    const promo = m.promo ? `<div class="mega__promo"><div><div class="eyebrow" style="margin-bottom:10px">${ecg()}</div><b style="font-family:var(--font-display);font-size:1.15rem;display:block;margin-bottom:8px">${m.promo.t}</b><p style="font-size:14px;color:rgba(251,246,240,.8)">${m.promo.d}</p></div><a href="${P}${m.promo.href}" class="tlink" style="color:var(--coral);margin-top:14px">Läs mer →</a></div>` : "";
    return `<div class="mega ${m.wide?'mega--wide':''}" role="menu"><div style="display:grid;grid-template-columns:${m.promo?'1fr auto':'1fr'};gap:24px"><div class="mega__grid">${cols}</div>${promo}</div></div>`;
  }

  const navHTML = nav.map(n => {
    if (n.mega) {
      return `<div class="navitem"><button aria-haspopup="true">${n.label} ${I.caret}</button>${megaHTML(n.mega)}</div>`;
    }
    return `<div class="navitem"><a href="${P}${n.href}">${n.label}</a></div>`;
  }).join("");

  const header = `
  <div class="topbar"><div class="container">
    <div class="tb-left">
      <span class="tb-item">${I.clock} Öppet alla dagar 08:00–22:00</span>
      <a class="tb-item" href="tel:0293761011">${I.phone} 0293-76 10 11</a>
      <a class="tb-item" href="mailto:kontakt@pulsakademin.se">${I.mail} kontakt@pulsakademin.se</a>
    </div>
    <div class="tb-right">
      <a href="${P}offert.html">Begär offert</a>
      <a href="${P}boka.html">Boka kurs</a>
    </div>
  </div></div>
  <header class="header"><div class="container">
    ${logo}
    <nav class="nav" aria-label="Huvudmeny">${navHTML}</nav>
    <div class="header__actions">
      <a class="icon-btn desktop-only" href="${P}logga-in.html" aria-label="Logga in">${I.user}</a>
      <a class="icon-btn" href="${P}kundvagn.html" aria-label="Kundvagn">${I.cart}<span class="cart-count">2</span></a>
      <a class="btn btn--primary desktop-only" href="${P}boka.html">Boka utbildning</a>
      <button class="icon-btn burger" aria-label="Öppna meny" id="burgerBtn">${I.burger}</button>
    </div>
  </div></header>`;

  /* drawer */
  const drawerSections = nav.map(n => {
    if (n.mega) {
      const links = n.mega.cols.flatMap(c => c.items).map(([t,,h]) => `<a href="${P}${h}">${t}</a>`).join("");
      return `<details><summary>${n.label} ${I.plus}</summary><div class="sub">${links}</div></details>`;
    }
    return `<a href="${P}${n.href}" style="display:block;padding:15px 10px;font-weight:600;font-size:17px;border-bottom:1px solid var(--line)">${n.label}</a>`;
  }).join("");

  const drawer = `
  <div class="drawer-overlay" id="drawerOverlay"></div>
  <aside class="drawer" id="drawer" aria-label="Mobilmeny">
    <div class="drawer__head">${logo}<button class="icon-btn" id="drawerClose" aria-label="Stäng meny">${I.close}</button></div>
    <div class="drawer__body">
      ${drawerSections}
      <a href="${P}logga-in.html" style="display:block;padding:15px 10px;font-weight:600;font-size:17px;border-bottom:1px solid var(--line)">Logga in</a>
      <div class="drawer__cta">
        <a class="btn btn--primary btn--block" href="${P}boka.html">Boka utbildning</a>
        <a class="btn btn--outline btn--block" href="${P}offert.html">Begär offert</a>
      </div>
    </div>
  </aside>`;

  /* footer */
  const footer = `
  <footer class="footer"><div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        ${logo}
        <p class="footer__pitch">Praktiska HLR- och första hjälpen-utbildningar och hjärtstartare för hela Sverige. Vi utbildar för att rädda liv.</p>
        <h5>Nyhetsbrev</h5>
        <form class="footer__news" onsubmit="return false">
          <input class="input" type="email" placeholder="Din e-postadress" aria-label="E-postadress">
          <button class="btn btn--primary">Anmäl</button>
        </form>
        <div class="flex gap-12" style="margin-top:22px">
          <a href="#" class="icon-btn" aria-label="Facebook">${I.fb}</a>
          <a href="#" class="icon-btn" aria-label="Instagram">${I.insta}</a>
          <a href="#" class="icon-btn" aria-label="LinkedIn">${I.ln}</a>
        </div>
      </div>
      <div><h5>Utbildningar</h5><ul>
        <li><a href="${P}utbildningar.html">Alla utbildningar</a></li>
        <li><a href="${P}kurs-hlr-vuxen.html">HLR vuxen</a></li>
        <li><a href="${P}utbildningar.html">S-HLR</a></li>
        <li><a href="${P}utbildningar.html">Första hjälpen</a></li>
        <li><a href="${P}boka.html">Boka kurs</a></li>
        <li><a href="${P}foretag.html">Företagsutbildning</a></li>
      </ul></div>
      <div><h5>Webbshop</h5><ul>
        <li><a href="${P}hjartstartare.html">Hjärtstartare</a></li>
        <li><a href="${P}webbshop.html">Batterier</a></li>
        <li><a href="${P}webbshop.html">Elektroder</a></li>
        <li><a href="${P}webbshop.html">Skåp & väskor</a></li>
        <li><a href="${P}hyr.html">Hyr hjärtstartare</a></li>
        <li><a href="${P}service.html">Service & underhåll</a></li>
      </ul></div>
      <div><h5>Företaget</h5><ul>
        <li><a href="${P}om-oss.html">Om oss</a></li>
        <li><a href="${P}team.html">Team & instruktörer</a></li>
        <li><a href="${P}kunskapsbank.html">Kunskapsbank</a></li>
        <li><a href="${P}kontakt.html">Kontakt</a></li>
        <li><a href="${P}offert.html">Begär offert</a></li>
        <li><a href="${P}logga-in.html">Mina sidor</a></li>
      </ul></div>
      <div><h5>Kontakt</h5><ul>
        <li>Centralgatan 14<br>815 38 Tierp</li>
        <li><a href="tel:0293761011">0293-76 10 11</a></li>
        <li><a href="mailto:kontakt@pulsakademin.se">kontakt@pulsakademin.se</a></li>
        <li>Öppet alla dagar 08–22</li>
        <li>Org.nr 559123-4567</li>
      </ul></div>
    </div>
    <div class="footer__bottom">
      <div class="flex gap-16 wrap center">
        <span>© 2026 PulsAkademin</span>
        <a href="${P}villkor.html">Villkor</a>
        <a href="${P}integritetspolicy.html">Integritetspolicy</a>
        <a href="${P}krediter.html">Bildkrediter</a>
        <a href="${P}integritetspolicy.html">Cookies</a>
        <a href="${P}villkor.html">Retur & reklamation</a>
      </div>
      <div class="footer__pay">
        <span>SWISH</span><span>KLARNA</span><span>KORT</span><span>FAKTURA</span>
      </div>
    </div>
  </div></footer>`;

  /* ---- injected styles (a11y skip-link + cookie banner) ---- */
  function injectStyles() {
    if (document.getElementById("pa-site-styles")) return;
    const s = document.createElement("style");
    s.id = "pa-site-styles";
    s.textContent = `
/* --- skip-to-content --- */
.pa-skip {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 600;
  background: var(--bordeaux-700, #6B1422);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 22px;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
}
.pa-skip:focus {
  left: 16px;
  top: 16px;
  width: auto;
  height: auto;
  overflow: visible;
  outline: 3px solid #fff;
  outline-offset: 2px;
}

/* --- cookie consent banner --- */
.pa-cookie {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 520;
  background: var(--cream, #FBF6F0);
  color: var(--ink, #1A1A1A);
  border-top: 1px solid var(--line, #E8E0D8);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  box-shadow: 0 -4px 24px rgba(26,26,26,0.10);
}
.pa-cookie__text {
  flex: 1 1 280px;
  font-size: 14px;
  line-height: 1.55;
  margin: 0;
}
.pa-cookie__text a {
  color: var(--bordeaux-700, #6B1422);
  text-decoration: underline;
}
.pa-cookie__btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
@media (max-width: 600px) {
  .pa-cookie {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
  .pa-cookie__btns {
    flex-direction: column;
  }
}
`;
    document.head.appendChild(s);
  }

  /* ---- skip-to-content ---- */
  function mountSkipLink() {
    if (document.getElementById("pa-skip-link")) return;
    const a = document.createElement("a");
    a.id = "pa-skip-link";
    a.className = "pa-skip";
    a.href = "#huvudinnehall";
    a.textContent = "Hoppa till innehållet";
    document.body.insertBefore(a, document.body.firstChild);

    // Ensure <main> has the target id
    const main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "huvudinnehall";
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    }
  }

  /* ---- cookie consent ---- */
  function lsGet(k) { try { return window.localStorage && localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function mountCookieBanner() {
    if (lsGet("pa_cookie_consent")) return;
    if (document.getElementById("pa-cookie-banner")) return;

    const banner = document.createElement("div");
    banner.id = "pa-cookie-banner";
    banner.className = "pa-cookie";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookiesamtycke");
    banner.innerHTML = `
      <p class="pa-cookie__text">
        Vi använder nödvändiga cookies för att sajten ska fungera.
        Du kan läsa mer i vår <a href="${P}integritetspolicy.html">integritetspolicy</a>.
      </p>
      <div class="pa-cookie__btns">
        <button class="btn btn--outline" id="pa-cookie-necessary">Endast nödvändiga</button>
        <button class="btn btn--primary" id="pa-cookie-all">Acceptera alla</button>
      </div>`;
    document.body.appendChild(banner);

    const dismiss = (choice) => {
      lsSet("pa_cookie_consent", choice);
      banner.remove();
    };
    document.getElementById("pa-cookie-necessary").addEventListener("click", () => dismiss("necessary"));
    document.getElementById("pa-cookie-all").addEventListener("click", () => dismiss("all"));
  }

  /* ---- newsletter form wiring ---- */
  function wireNewsletter() {
    const form = document.querySelector("form.footer__news");
    if (!form) return;
    if (form.dataset.wired) return;
    form.dataset.wired = "1";

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input) return;
      const email = input.value.trim();

      // Basic e-mail validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNewsletterMsg(form, "Ange en giltig e-postadress.", false);
        return;
      }

      try {
        if (window.PA && window.PA.db && typeof window.PA.db.sendContact === "function") {
          await window.PA.db.sendContact({
            name: "",
            email: email,
            phone: "",
            subject: "Nyhetsbrev",
            kind: "Nyhetsbrev",
            message: "Anmälan till nyhetsbrev"
          });
        }
        // Success — replace form contents
        showNewsletterMsg(form, "Tack! Du är anmäld till nyhetsbrevet.", true);
      } catch (err) {
        showNewsletterMsg(form, "Något gick fel. Försök igen eller kontakta oss.", false);
      }
    });
  }

  function showNewsletterMsg(form, text, success) {
    form.innerHTML = `<p style="font-size:14px;margin:0;color:${success ? "var(--green, #2E7D32)" : "var(--coral, #E05C3A)"};">${text}</p>`;
  }

  /* mount */
  function mount() {
    // favicon (single source of truth for every page that loads site.js)
    if (!document.querySelector('link[rel="icon"]')) {
      const fav = document.createElement("link");
      fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = P + "favicon.svg";
      document.head.appendChild(fav);
    }

    // inject shared styles (skip-link + cookie banner)
    injectStyles();

    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    if (h) h.innerHTML = header + drawer;
    if (f) f.innerHTML = footer;

    // 1. skip-to-content
    mountSkipLink();

    // 2. cookie consent
    mountCookieBanner();

    // active state
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a, .nav button").forEach(el => {
      const item = el.closest(".navitem");
      const link = item && item.querySelector("a");
    });
    document.querySelectorAll('.nav .navitem > a').forEach(a => {
      if (a.getAttribute("href") && a.getAttribute("href").endsWith(here))
        a.style.color = "var(--bordeaux-700)";
    });

    const burger = document.getElementById("burgerBtn");
    const drawerEl = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const close = document.getElementById("drawerClose");
    const open = () => { drawerEl.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; };
    const shut = () => { drawerEl.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; };
    burger && burger.addEventListener("click", open);
    close && close.addEventListener("click", shut);
    overlay && overlay.addEventListener("click", shut);

    // 3. newsletter form
    wireNewsletter();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  window.PA_ICONS = I;
  window.PA_ECG = ecg;
})();
