/* PulsAkademin — home page logic.
 * Renders #courseGrid, #datesTable, #prodGrid asynchronously via PA.db.*
 * City chip filtering re-calls listInstances({city}) and re-renders the table.
 * Contact form (#homeContactForm) calls PA.db.sendContact with inline result.
 * Depends on: app/config.js → supabase-js CDN → app/supabase.js → app/cart.js → app/db.js
 */
(function () {
  /* ---- helpers ---- */
  function fmtSeats(s) {
    if (s === 0) return '<span class="badge badge--danger"><span class="dot"></span>Fullbokad</span>';
    if (s <= 4)  return '<span class="badge badge--amber"><span class="dot"></span>' + s + ' platser kvar</span>';
    return '<span class="badge badge--green"><span class="dot"></span>Platser kvar</span>';
  }

  function courseHref(c) {
    return c.slug === 'hlr-vuxen' ? 'kurs-hlr-vuxen.html' : 'kurs.html?slug=' + c.slug;
  }

  function renderCourses(courses) {
    var el = document.getElementById("courseGrid");
    if (!el) return;
    el.innerHTML = courses.slice(0, 6).map(function (c) {
      return '<a class="card card--hover" href="' + courseHref(c) + '">' +
        '<div class="ph ph--16x9">' + (PA.phImg ? PA.phImg(c.img, c.title).replace('ph-img', 'ph-photo') : '<span>' + (c.img || "") + '</span>') + '</div>' +
        '<div class="card__body">' +
          '<div class="coursecard__top"><h3 class="h3" style="font-size:1.25rem">' + c.title + '</h3>' +
          '<span class="badge badge--coral">' + (c.category || "") + '</span></div>' +
          '<p class="muted" style="margin-top:10px;font-size:14.5px">' + (c.description || "") + '</p>' +
          '<div class="coursecard__meta"><span>&#9203; <b>' + (c.duration || "") + '</b></span>' +
          '<span>&#128101; <b>' + (c.audience || "") + '</b></span><span>&#128220; Kompetensbevis</span></div>' +
          '<div class="flex between center" style="margin-top:18px">' +
            '<span class="price-from">' + (c.price_label || "") + '<small> ' + (c.price_unit || "") + '</small></span>' +
            '<span class="tlink">Läs mer →</span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join("");
  }

  function renderDates(instances) {
    var el = document.getElementById("datesTable");
    if (!el) return;
    var rows = instances.slice(0, 6).map(function (d) {
      var title = (d.course && d.course.title) ? d.course.title : (d.course_title || "");
      var seats = typeof d.seats_left === "number" ? d.seats_left : (d.seats_left == null ? 99 : Number(d.seats_left));
      var date  = d.date_label || d.start_at || "";
      var time  = d.time_label || "";
      var price = d.price_label || "";
      var city  = d.city || "";
      var id    = d.id || "";
      var full  = seats === 0;
      var href  = id && !id.startsWith("demo-") ? "boka-flode.html?instance=" + id : "boka.html";
      return "<tr>" +
        "<td><b>" + title + "</b></td>" +
        "<td>" + city + "</td>" +
        "<td>" + date + "</td>" +
        "<td>" + time + "</td>" +
        "<td>" + price + "</td>" +
        "<td>" + fmtSeats(seats) + "</td>" +
        "<td><a class=\"btn btn--sm " + (full ? "btn--outline" : "btn--primary") + "\" href=\"" + href + "\">" + (full ? "Väntelista" : "Boka") + "</a></td>" +
        "</tr>";
    }).join("");
    el.innerHTML = "<thead><tr><th>Kurs</th><th>Stad</th><th>Datum</th><th>Tid</th><th>Pris</th><th>Platser</th><th></th></tr></thead><tbody>" + rows + "</tbody>";
  }

  function renderProducts(products) {
    var el = document.getElementById("prodGrid");
    if (!el) return;
    el.innerHTML = products.slice(0, 3).map(function (p) {
      var badges = (p.badges || []).map(function (b) { return '<span class="badge badge--coral">' + b + "</span>"; }).join("");
      var price  = typeof p.price_incl_vat === "number" ? PA.formatSEK(p.price_incl_vat) : (p.price_label || "");
      var stock  = p.stock_status || "I lager";
      var inStock = stock.toLowerCase().indexOf("lager") !== -1;
      var href   = (p.slug && !p.slug.startsWith("demo-")) ? "produkt.html?p=" + p.slug : "produkt.html";
      var stockBadge = inStock
        ? '<span class="badge badge--green"><span class="dot"></span>' + stock + "</span>"
        : '<span class="badge badge--amber"><span class="dot"></span>' + stock + "</span>";
      return '<a class="card prodcard card--hover" href="' + href + '">' +
        '<div class="ph"><div class="prodcard__badges">' + badges + '</div>' + PA.phImg(p.img, p.name) + '</div>' +
        '<div class="card__body">' +
          '<div class="prodcard__name">' + p.name + '</div>' +
          '<div class="prodcard__usp">' + (p.usp || "") + '</div>' +
          '<div class="flex between center"><span class="price"><b>' + price + '</b><small>inkl. moms</small></span>' + stockBadge + '</div>' +
        '</div>' +
      '</a>';
    }).join("");
  }

  /* ---- city chip filtering ---- */
  var currentCity = null; // null = Alla städer

  function initChips() {
    var chips = document.querySelectorAll(".pillrow .chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("chip--active"); });
        chip.classList.add("chip--active");
        var label = chip.textContent.trim();
        var city = (label === "Alla städer" || label === "Alla städer") ? null : label;
        currentCity = city;
        loadDates(city);
      });
    });
  }

  function loadDates(city) {
    var opts = city ? { city: city } : {};
    PA.db.listInstances(opts).then(renderDates).catch(function (err) {
      console.error("listInstances error:", err);
    });
  }

  /* ---- contact form ---- */
  function initContactForm() {
    var form = document.getElementById("homeContactForm");
    if (!form) return;

    var btn       = form.querySelector(".btn--primary");
    var nameEl    = form.querySelector("[name=name]");
    var emailEl   = form.querySelector("[name=email]");
    var phoneEl   = form.querySelector("[name=phone]");
    var subjectEl = form.querySelector("[name=subject]");
    var msgEl     = form.querySelector("[name=message]");
    var consentEl = form.querySelector("[name=consent]");
    var statusEl  = document.getElementById("homeContactStatus");

    function showStatus(html, isError) {
      statusEl.innerHTML = html;
      statusEl.style.display = "block";
      statusEl.style.color = isError ? "var(--danger, #c0392b)" : "var(--green-dark, #1a5c2a)";
      statusEl.style.background = isError ? "var(--red-tint, #fdf0f0)" : "var(--green-tint, #f0fdf4)";
    }

    btn.addEventListener("click", async function () {
      // clear previous status
      statusEl.innerHTML = "";
      statusEl.style.display = "none";

      // consent check
      if (!consentEl.checked) {
        showStatus("Du måste samtycka till integritetspolicyn för att skicka formuläret.", true);
        consentEl.focus();
        return;
      }

      var name    = (nameEl.value || "").trim();
      var email   = (emailEl.value || "").trim();
      var phone   = (phoneEl.value || "").trim();
      var subject = (subjectEl.value || "").trim();
      var message = (msgEl.value || "").trim();

      if (!name)    { showStatus("Vänligen ange ditt namn.", true); nameEl.focus(); return; }
      if (!email)   { showStatus("Vänligen ange din e-postadress.", true); emailEl.focus(); return; }
      if (!message) { showStatus("Vänligen skriv ett meddelande.", true); msgEl.focus(); return; }

      btn.disabled = true;
      btn.textContent = "Skickar…";

      try {
        await PA.db.sendContact({ name: name, email: email, phone: phone, subject: subject, kind: subject, message: message });
        showStatus("Tack! Vi svarar inom ett par timmar.", false);
        form.reset();
      } catch (err) {
        var msg = (err && err.message) ? err.message : "Ett fel uppstod – försök igen eller ring 0293-76 10 11.";
        showStatus(msg, true);
      } finally {
        btn.disabled = false;
        btn.textContent = "Skicka förfrågan";
      }
    });
  }

  /* ---- boot ---- */
  function boot() {
    // courses
    PA.db.listCourses().then(renderCourses).catch(function (err) { console.error("listCourses error:", err); });

    // dates (all cities initially)
    loadDates(null);

    // products
    PA.db.listProducts().then(renderProducts).catch(function (err) { console.error("listProducts error:", err); });

    // FAQ is static — rendered directly from PA_FAQ in the inline script
    initChips();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
