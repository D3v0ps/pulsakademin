/* PulsAkademin — Checkout feature
 * Handles both kundvagn.html (cart render) and kassa.html (checkout form + order submit).
 * Relies on PA.Cart and PA.db being available (loaded before this script).
 * No toasts — errors render inline, success renders a real confirmation view.
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  KUNDVAGN PAGE                                                       */
  /* ------------------------------------------------------------------ */

  function initKundvagn() {
    var cartRoot = document.getElementById("cartRoot");
    var emptyState = document.getElementById("cartEmpty");
    var cartRows = document.getElementById("cartRows");
    var cartRowsCard = document.getElementById("cartRowsCard");
    var summaryCard = document.getElementById("cartSummaryCard");
    var summaryExcl = document.getElementById("summaryExcl");
    var summaryVat = document.getElementById("summaryVat");
    var summaryTotal = document.getElementById("summaryTotal");

    if (!cartRoot) return; // not the right page

    function renderCart() {
      var items = PA.Cart.items();

      if (items.length === 0) {
        emptyState.style.display = "";
        if (cartRowsCard) cartRowsCard.style.display = "none";
        summaryCard.style.display = "none";
        cartRows.innerHTML = "";
        return;
      }

      emptyState.style.display = "none";
      if (cartRowsCard) cartRowsCard.style.display = "";
      summaryCard.style.display = "";

      cartRows.innerHTML = items.map(function (item) {
        var imgContent = item.img
          ? '<img src="' + escHtml(item.img) + '" alt="' + escHtml(item.name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-sm)">'
          : '<span>' + escHtml(item.name.split(" ").slice(0, 1).join("")) + '</span>';
        return (
          '<div class="cartrow" data-id="' + escHtml(String(item.id)) + '">' +
          '  <div class="ph" style="aspect-ratio:1">' + imgContent + '</div>' +
          '  <div>' +
          '    <div class="muted" style="font-size:12px;font-family:var(--font-mono)">' + escHtml(item.sku || "") + '</div>' +
          '    <b>' + escHtml(item.name) + '</b>' +
          '    <div class="flex gap-12 center mt-8">' +
          '      <div class="qty">' +
          '        <button class="qty-dec" aria-label="Minska antal">&#8722;</button>' +
          '        <span>' + item.qty + '</span>' +
          '        <button class="qty-inc" aria-label="Öka antal">+</button>' +
          '      </div>' +
          '      <button class="tlink remove-btn" style="font-size:13.5px;color:var(--danger)">Ta bort</button>' +
          '    </div>' +
          '  </div>' +
          '  <div class="cart-price tac">' +
          '    <b style="font-family:var(--font-display);font-size:1.25rem">' + PA.formatSEK(item.priceInclVat * item.qty) + '</b>' +
          '    <div class="muted" style="font-size:12px">' + PA.formatSEK((item.priceExclVat || item.priceInclVat / 1.25) * item.qty) + ' exkl. moms</div>' +
          '  </div>' +
          '</div>'
        );
      }).join("");

      // Totals
      summaryExcl.textContent = PA.formatSEK(PA.Cart.subtotalExclVat());
      summaryVat.textContent = PA.formatSEK(PA.Cart.vat());
      summaryTotal.textContent = PA.formatSEK(PA.Cart.subtotalInclVat());
    }

    // Event delegation on cartRows
    cartRows.addEventListener("click", function (e) {
      var row = e.target.closest("[data-id]");
      if (!row) return;
      var id = row.dataset.id;

      if (e.target.classList.contains("qty-dec") || e.target.closest(".qty-dec")) {
        var item = PA.Cart.items().find(function (i) { return String(i.id) === id; });
        if (item) PA.Cart.setQty(id, item.qty - 1);
      } else if (e.target.classList.contains("qty-inc") || e.target.closest(".qty-inc")) {
        var item2 = PA.Cart.items().find(function (i) { return String(i.id) === id; });
        if (item2) PA.Cart.setQty(id, item2.qty + 1);
      } else if (e.target.classList.contains("remove-btn") || e.target.closest(".remove-btn")) {
        PA.Cart.remove(id);
      }
    });

    // Re-render on cart change
    document.addEventListener("pa:cart", renderCart);

    renderCart();
  }

  /* ------------------------------------------------------------------ */
  /*  KASSA PAGE                                                          */
  /* ------------------------------------------------------------------ */

  function initKassa() {
    var kassaRoot = document.getElementById("kassaRoot");
    if (!kassaRoot) return;

    // Empty cart guard
    if (PA.Cart.count() === 0) {
      kassaRoot.innerHTML =
        '<div class="card"><div class="card__body" style="text-align:center;padding:56px 24px">' +
        '<div style="font-size:3rem;margin-bottom:16px">&#128722;</div>' +
        '<h2 class="h3 mb-16">Din kundvagn är tom</h2>' +
        '<p class="muted mb-24">Lägg till produkter innan du går till kassan.</p>' +
        '<a class="btn btn--primary" href="webbshop.html">Gå till webbshopen</a>' +
        '</div></div>';
      var summaryAside = document.getElementById("kassaSummary");
      if (summaryAside) summaryAside.style.display = "none";
      var stepsEl = document.getElementById("checkoutSteps");
      if (stepsEl) stepsEl.style.display = "none";
      return;
    }

    // Render order summary sidebar
    renderSummary();

    // Customer type toggle (Privatperson / Företag)
    var segBtns = document.querySelectorAll(".seg button");
    var companyFields = document.getElementById("companyFields");
    var customerType = "private";

    segBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        segBtns.forEach(function (b) { b.classList.remove("on"); });
        btn.classList.add("on");
        customerType = btn.dataset.type;
        if (companyFields) {
          companyFields.style.display = customerType === "company" ? "" : "none";
        }
      });
    });

    // Payment option interactive selection
    document.querySelectorAll(".pay-opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        var group = opt.closest("[data-pay-group]");
        if (!group) return;
        group.querySelectorAll(".pay-opt").forEach(function (o) { o.classList.remove("sel"); });
        opt.classList.add("sel");
        var radio = opt.querySelector("input[type=radio]");
        if (radio) radio.checked = true;
      });
    });

    // Shipping option selection
    document.querySelectorAll(".ship-opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        document.querySelectorAll(".ship-opt").forEach(function (o) { o.classList.remove("sel"); });
        opt.classList.add("sel");
        var radio = opt.querySelector("input[type=radio]");
        if (radio) radio.checked = true;
      });
    });

    // Same billing address toggle
    var sameBillingCb = document.getElementById("sameBilling");
    var billingFields = document.getElementById("billingFields");
    if (sameBillingCb && billingFields) {
      sameBillingCb.addEventListener("change", function () {
        billingFields.style.display = sameBillingCb.checked ? "none" : "";
      });
    }

    // Form submission
    var submitBtn = document.getElementById("submitOrder");
    var errorBox = document.getElementById("orderError");

    if (submitBtn) {
      submitBtn.addEventListener("click", async function () {
        if (!validateForm(errorBox, customerType)) return;
        await submitOrder(submitBtn, errorBox, customerType);
      });
    }
  }

  function renderSummary() {
    var summaryItems = document.getElementById("summaryItems");
    var summaryExcl = document.getElementById("kassaSummaryExcl");
    var summaryVat = document.getElementById("kassaSummaryVat");
    var summaryTotal = document.getElementById("kassaSummaryTotal");

    if (!summaryItems) return;

    var items = PA.Cart.items();
    summaryItems.innerHTML = items.map(function (item) {
      var imgContent = item.img
        ? '<img src="' + escHtml(item.img) + '" alt="' + escHtml(item.name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--r-sm)">'
        : '<span></span>';
      return (
        '<div class="flex gap-12 center mb-16">' +
        '  <div class="ph" style="width:54px;height:54px;border-radius:var(--r-sm);flex:0 0 auto">' + imgContent + '</div>' +
        '  <div style="font-size:14px;min-width:0">' +
        '    <b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(item.name) + '</b>' +
        '    <div class="muted">' + item.qty + ' × ' + PA.formatSEK(item.priceInclVat) + '</div>' +
        '  </div>' +
        '</div>'
      );
    }).join("");

    if (summaryExcl) summaryExcl.textContent = PA.formatSEK(PA.Cart.subtotalExclVat());
    if (summaryVat) summaryVat.textContent = PA.formatSEK(PA.Cart.vat());
    if (summaryTotal) summaryTotal.textContent = PA.formatSEK(PA.Cart.subtotalInclVat());
  }

  function validateForm(errorBox, customerType) {
    var errors = [];

    var firstName = val("firstName");
    var lastName = val("lastName");
    var email = val("email");
    var phone = val("phone");
    var address = val("address");
    var zip = val("zip");
    var city = val("city");
    var terms = document.getElementById("termsCheck");

    if (!firstName) errors.push("Förnamn saknas");
    if (!lastName) errors.push("Efternamn saknas");
    if (!email || !email.includes("@")) errors.push("Ange en giltig e-postadress");
    if (!phone) errors.push("Telefonnummer saknas");
    if (!address) errors.push("Leveransadress saknas");
    if (!zip) errors.push("Postnummer saknas");
    if (!city) errors.push("Ort saknas");

    if (customerType === "company") {
      if (!val("companyName")) errors.push("Företagsnamn saknas");
      if (!val("orgNr")) errors.push("Org.nr saknas");
    }

    if (!terms || !terms.checked) errors.push("Du måste godkänna köpvillkoren för att fortsätta");

    if (errors.length > 0) {
      showError(errorBox, errors.join(" · "));
      return false;
    }
    clearError(errorBox);
    return true;
  }

  async function submitOrder(btn, errorBox, customerType) {
    btn.disabled = true;
    btn.textContent = "Skickar…";

    var payRadio = document.querySelector('[data-pay-group] input[type=radio]:checked');
    var payMethod = payRadio ? payRadio.value : "swish";

    var sameBilling = document.getElementById("sameBilling");
    var billingAddr = (sameBilling && sameBilling.checked)
      ? buildAddress()
      : buildBillingAddress();

    var customer = {
      name: (val("firstName") + " " + val("lastName")).trim(),
      email: val("email"),
      phone: val("phone"),
      company: customerType === "company" ? val("companyName") : null,
      org: customerType === "company" ? val("orgNr") : null,
      address: billingAddr,
      payment: payMethod,
    };

    var cartItems = PA.Cart.items().map(function (i) {
      return { name: i.name, sku: i.sku || "", qty: i.qty, priceInclVat: i.priceInclVat };
    });

    var totals = {
      inclVat: PA.Cart.subtotalInclVat(),
      exclVat: PA.Cart.subtotalExclVat(),
      vat: PA.Cart.vat(),
    };

    try {
      var order = await PA.db.createOrder({ items: cartItems, customer: customer, totals: totals });
      PA.Cart.clear();
      renderConfirmation(order, cartItems, totals);
    } catch (err) {
      showError(errorBox, err.message || "Något gick fel. Försök igen.");
      btn.disabled = false;
      btn.textContent = "Slutför beställning →";
    }
  }

  function renderConfirmation(order, items, totals) {
    var kassaRoot = document.getElementById("kassaRoot");
    var kassaSummary = document.getElementById("kassaSummary");
    var stepsEl = document.getElementById("checkoutSteps");

    // Update steps
    if (stepsEl) {
      stepsEl.querySelectorAll("li").forEach(function (li, idx) {
        li.classList.remove("active");
        if (idx < 2) li.classList.add("done");
        if (idx === 2) li.classList.add("active");
      });
    }

    // Hide summary aside
    if (kassaSummary) kassaSummary.style.display = "none";

    var itemRows = items.map(function (i) {
      return (
        '<tr>' +
        '<td>' + escHtml(i.name) + (i.sku ? ' <span class="muted" style="font-size:12px;font-family:var(--font-mono)">(' + escHtml(i.sku) + ')</span>' : '') + '</td>' +
        '<td class="tac">' + i.qty + '</td>' +
        '<td class="tar">' + PA.formatSEK(i.priceInclVat * i.qty) + '</td>' +
        '</tr>'
      );
    }).join("");

    kassaRoot.innerHTML =
      '<div class="card">' +
      '  <div class="card__body" style="text-align:center;padding:48px 24px 32px">' +
      '    <div style="width:72px;height:72px;border-radius:50%;background:var(--green-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:2rem">&#10003;</div>' +
      '    <h2 class="h2 mb-8">Tack för din beställning!</h2>' +
      '    <p class="muted" style="font-size:1.05rem">En orderbekräftelse har skickats till din e-post.</p>' +
      '  </div>' +
      '  <div style="padding:0 clamp(18px,2vw,32px) clamp(18px,2vw,32px)">' +
      '    <div class="flex between center mb-24" style="flex-wrap:wrap;gap:12px">' +
      '      <div>' +
      '        <div class="muted" style="font-size:13px;font-family:var(--font-mono);letter-spacing:.08em">ORDERNUMMER</div>' +
      '        <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;letter-spacing:-.02em">' + escHtml(order.order_number || "–") + '</div>' +
      '      </div>' +
      '      <span class="badge badge--green">Mottagen</span>' +
      '    </div>' +
      '    <table class="table" style="margin-bottom:0">' +
      '      <thead><tr><th>Produkt</th><th class="tac">Antal</th><th class="tar">Summa</th></tr></thead>' +
      '      <tbody>' + itemRows + '</tbody>' +
      '    </table>' +
      '    <div style="max-width:380px;margin-left:auto;margin-top:20px">' +
      '      <div class="flex between" style="font-size:14.5px;padding:8px 0;border-top:1px solid var(--line)"><span class="muted">Exkl. moms</span><span>' + PA.formatSEK(totals.exclVat) + '</span></div>' +
      '      <div class="flex between" style="font-size:14.5px;padding:8px 0;border-top:1px solid var(--line)"><span class="muted">Moms (25%)</span><span>' + PA.formatSEK(totals.vat) + '</span></div>' +
      '      <div class="flex between center" style="padding:12px 0;border-top:2px solid var(--ink)"><b style="font-size:1.05rem">Totalt</b><span class="price-from" style="font-size:1.7rem">' + PA.formatSEK(totals.inclVat) + '</span></div>' +
      '    </div>' +
      '    <div class="flex gap-12 mt-32" style="flex-wrap:wrap">' +
      '      <a class="btn btn--primary" href="index.html">Gå till startsidan</a>' +
      '      <a class="btn btn--outline" href="webbshop.html">Fortsätt handla</a>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function val(id) {
    var el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
  }

  function buildAddress() {
    return [val("address"), val("zip") + " " + val("city")].filter(Boolean).join(", ");
  }

  function buildBillingAddress() {
    return [val("billingAddress"), val("billingZip") + " " + val("billingCity")].filter(Boolean).join(", ");
  }

  function showError(box, msg) {
    if (!box) return;
    box.textContent = msg;
    box.style.display = "";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearError(box) {
    if (!box) return;
    box.textContent = "";
    box.style.display = "none";
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                                */
  /* ------------------------------------------------------------------ */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function boot() {
    initKundvagn();
    initKassa();
  }
})();
