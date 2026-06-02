/* PulsAkademin — shopping cart (localStorage; works with simulated payments).
 * API: PA.Cart.add(item, qty), .setQty(id,qty), .remove(id), .items(), .count(),
 *      .subtotalInclVat(), .subtotalExclVat(), .vat(), .clear()
 * Items: { id, name, sku, priceInclVat, priceExclVat, vatRate, img, qty }
 * Emits document event "pa:cart" on change and keeps every .cart-count badge live.
 */
(function () {
  window.PA = window.PA || {};
  const KEY = "pa_cart_v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    renderBadge();
    document.dispatchEvent(new CustomEvent("pa:cart", { detail: items }));
  };
  const num = (v) => (typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.,]/g, "").replace(",", ".")) || 0);

  const Cart = {
    items: read,
    count: () => read().reduce((n, i) => n + i.qty, 0),
    subtotalInclVat: () => read().reduce((s, i) => s + num(i.priceInclVat) * i.qty, 0),
    subtotalExclVat: () => read().reduce((s, i) => s + num(i.priceExclVat ?? num(i.priceInclVat) / 1.25) * i.qty, 0),
    vat() { return this.subtotalInclVat() - this.subtotalExclVat(); },
    add(item, qty = 1) {
      const items = read();
      const ex = items.find((i) => i.id === item.id);
      if (ex) ex.qty += qty; else items.push({ ...item, qty });
      save(items);
    },
    setQty(id, qty) { save(read().map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty | 0) } : i))); },
    remove(id) { save(read().filter((i) => i.id !== id)); },
    clear() { save([]); },
  };

  function renderBadge() {
    const n = Cart.count();
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = n;
      el.style.display = n ? "" : "none";
    });
  }

  PA.Cart = Cart;
  PA.formatSEK = (v) => Math.round(num(v)).toLocaleString("sv-SE") + " kr";

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderBadge);
  else renderBadge();
  setTimeout(renderBadge, 300); // re-apply after site.js injects the header
})();
