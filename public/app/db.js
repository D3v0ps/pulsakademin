/* PulsAkademin — data access layer.
 *
 * Reads use Supabase when configured and FALL BACK to the demo arrays in
 * data.js otherwise, so every page keeps rendering before the backend exists.
 * Writes require the backend and throw a clear Swedish error if it's missing
 * (callers show that inline — no toasts).
 *
 * Tables: courses, course_instances, instructors, products, product_categories,
 * bookings, participants, quote_requests, orders, order_items, contact_messages,
 * articles, profiles.  See supabase/schema.sql.
 */
(function () {
  window.PA = window.PA || {};
  const sb = () => PA.sb;
  const ready = () => !!sb();
  const need = () => { if (!ready()) throw new Error("Backend ej konfigurerad – lägg in Supabase URL och anon-nyckel i app/config.js för att aktivera bokningar, ordrar och offerter."); };
  const num = (v) => (typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.,]/g, "").replace(",", ".")) || 0);

  /* ---------------- READS (with demo fallback) ---------------- */
  async function listCourses() {
    if (ready()) {
      const { data, error } = await sb().from("courses").select("*").eq("active", true).order("sort", { ascending: true });
      if (!error && data && data.length) return data;
    }
    return (window.PA_COURSES || []).map((c, i) => ({
      id: c.slug, sort: i, title: c.title, slug: c.slug, category: c.cat, audience: c.aud,
      description: c.desc, duration: c.dur, price_label: c.price, price_unit: c.priceUnit, img: c.img, active: true,
    }));
  }
  async function getCourse(slug) {
    if (ready()) { const { data } = await sb().from("courses").select("*").eq("slug", slug).maybeSingle(); if (data) return data; }
    const c = (window.PA_COURSES || []).find((x) => x.slug === slug);
    return c ? { id: c.slug, title: c.title, slug: c.slug, category: c.cat, audience: c.aud, description: c.desc, duration: c.dur, price_label: c.price, price_unit: c.priceUnit, img: c.img } : null;
  }
  async function listInstances(opts = {}) {
    if (ready()) {
      let q = sb().from("course_instances").select("*, course:courses(title,slug)").gte("start_at", new Date().toISOString()).order("start_at", { ascending: true });
      if (opts.city) q = q.eq("city", opts.city);
      const { data, error } = await q;
      if (!error && data) return data;
    }
    let rows = (window.PA_DATES || []).map((d, i) => ({
      id: "demo-" + i, course: { title: d.course }, course_title: d.course, city: d.city, venue: d.venue,
      date_label: d.date, time_label: d.time, price_label: d.price, seats_left: d.seats, instructor: d.instr,
    }));
    if (opts.city && opts.city !== "Alla städer") rows = rows.filter((d) => d.city === opts.city || (opts.city === "Tierp & Gävle" && (d.city === "Tierp" || d.city === "Gävle")));
    return rows;
  }
  async function listProducts(opts = {}) {
    let list;
    if (ready()) {
      const { data, error } = await sb().from("products").select("*").eq("active", true);
      list = (!error && data && data.length) ? data : null;
    }
    if (!list) list = (window.PA_PRODUCTS || []).map((p, i) => ({
      id: "demo-" + i, name: p.name, slug: "demo-" + i, usp: p.usp, price_incl_vat: num(p.price),
      price_excl_vat: num(p.priceEx), brand: p.brand, badges: p.badges, stock_status: p.stock, img: p.img, active: true,
    }));
    return applyProductOpts(list, opts);
  }
  function applyProductOpts(list, o = {}) {
    let r = [...list];
    if (o.brand) r = r.filter((p) => p.brand === o.brand);
    if (o.inStock) r = r.filter((p) => (p.stock_status || "").toLowerCase().includes("lager"));
    if (o.q) { const s = o.q.toLowerCase(); r = r.filter((p) => (p.name + " " + (p.usp || "")).toLowerCase().includes(s)); }
    if (o.sort === "price-asc") r.sort((a, b) => num(a.price_incl_vat) - num(b.price_incl_vat));
    if (o.sort === "price-desc") r.sort((a, b) => num(b.price_incl_vat) - num(a.price_incl_vat));
    return r;
  }
  async function getProduct(idOrSlug) {
    if (ready()) { const { data } = await sb().from("products").select("*").or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`).maybeSingle(); if (data) return data; }
    const all = await listProducts(); return all.find((p) => p.slug === idOrSlug || p.id === idOrSlug) || all[0] || null;
  }
  async function listArticles() {
    if (ready()) { const { data } = await sb().from("articles").select("*").eq("published", true).order("created_at", { ascending: false }); if (data) return data; }
    return [];
  }

  /* ---------------- WRITES (require backend) ---------------- */
  async function createQuote(payload) { need(); const { data, error } = await sb().from("quote_requests").insert(payload).select().single(); if (error) throw error; return data; }
  async function sendContact(payload) { need(); const { data, error } = await sb().from("contact_messages").insert(payload).select().single(); if (error) throw error; return data; }
  async function createBooking({ instance_id, type, contact, participants }) {
    need();
    const { data: user } = await sb().auth.getUser();
    const { data: booking, error } = await sb().from("bookings").insert({
      course_instance_id: instance_id, booking_type: type || "private", status: "confirmed",
      contact_name: contact?.name, contact_email: contact?.email, contact_phone: contact?.phone,
      company_name: contact?.company || null, org_number: contact?.org || null, user_id: user?.user?.id || null,
    }).select().single();
    if (error) throw error;
    if (participants?.length) {
      const rows = participants.map((p) => ({ booking_id: booking.id, first_name: p.first, last_name: p.last, email: p.email }));
      await sb().from("participants").insert(rows);
    }
    return booking;
  }
  async function createOrder({ items, customer, totals }) {
    need();
    const { data: user } = await sb().auth.getUser();
    const { data: order, error } = await sb().from("orders").insert({
      order_number: "PA-" + Date.now().toString(36).toUpperCase(), status: "received", payment_method: customer?.payment || "invoice",
      total_incl_vat: totals?.inclVat, total_excl_vat: totals?.exclVat, vat: totals?.vat,
      customer_name: customer?.name, customer_email: customer?.email, customer_phone: customer?.phone,
      company_name: customer?.company || null, org_number: customer?.org || null,
      shipping_address: customer?.address || null, user_id: user?.user?.id || null,
    }).select().single();
    if (error) throw error;
    if (items?.length) {
      const rows = items.map((i) => ({ order_id: order.id, product_name: i.name, sku: i.sku || null, qty: i.qty, unit_price_incl_vat: num(i.priceInclVat) }));
      await sb().from("order_items").insert(rows);
    }
    return order;
  }

  /* ---------------- ADMIN (RLS restricts to admin role) ---------------- */
  async function adminList(table, { limit = 100 } = {}) { need(); const { data, error } = await sb().from(table).select("*").order("created_at", { ascending: false }).limit(limit); if (error) throw error; return data; }
  async function adminCounts() {
    need();
    const tables = ["bookings", "orders", "quote_requests", "contact_messages"];
    const out = {};
    await Promise.all(tables.map(async (t) => { const { count } = await sb().from(t).select("*", { count: "exact", head: true }); out[t] = count || 0; }));
    return out;
  }
  async function myBookings() { need(); const { data, error } = await sb().from("bookings").select("*, instance:course_instances(*, course:courses(title))").order("created_at", { ascending: false }); if (error) throw error; return data; }
  async function myOrders() { need(); const { data, error } = await sb().from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }); if (error) throw error; return data; }

  PA.db = {
    ready, listCourses, getCourse, listInstances, listProducts, getProduct, listArticles,
    createQuote, sendContact, createBooking, createOrder,
    adminList, adminCounts, myBookings, myOrders,
  };
})();
