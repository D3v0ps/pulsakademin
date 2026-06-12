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
  // Render a real <img> when img is a path/URL (real product photo); otherwise
  // the hatched placeholder showing the label text (demo data).
  PA.phImg = function (src, alt) {
    src = src || "";
    if (src.charAt(0) === "/" || src.lastIndexOf("http", 0) === 0)
      return '<img class="ph-img" src="' + src + '" alt="' + String(alt || "").replace(/"/g, "&quot;") +
             '" loading="lazy" style="width:100%;height:100%;object-fit:contain">';
    return "<span>" + src + "</span>";
  };
  const sb = () => PA.sb;
  const ready = () => !!sb();
  const need = () => { if (!ready()) throw new Error("Backend ej konfigurerad – lägg in Supabase URL och anon-nyckel i app/config.js för att aktivera bokningar, ordrar och offerter."); };
  const num = (v) => (typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.,]/g, "").replace(",", ".")) || 0);

  /* Embedded demo dataset — self-contained so the site renders on every page
     even before Supabase is connected and regardless of whether data.js loaded.
     (window.PA_* from data.js, if present, takes precedence.) */
  const DEMO = {
    courses: (window.PA_COURSES) || [
      { title:"HLR vuxen", slug:"hlr-vuxen", cat:"HLR", desc:"Grundläggande hjärt-lungräddning på vuxna med träning på docka och hjärtstartare.", dur:"2 timmar", aud:"Alla", price:"699 kr", priceUnit:"/person", img:"Bild: HLR vuxen" },
      { title:"HLR barn", slug:"hlr-barn", cat:"HLR", desc:"HLR anpassad för spädbarn och barn – för föräldrar, förskola och skola.", dur:"2 timmar", aud:"Alla", price:"699 kr", priceUnit:"/person", img:"Bild: HLR barn" },
      { title:"S-HLR vuxen", slug:"s-hlr-vuxen", cat:"S-HLR", desc:"Sjukvårds-HLR med hjärtstartare och teamarbete för vårdpersonal.", dur:"3 timmar", aud:"Vårdpersonal", price:"Offert", priceUnit:"", img:"Bild: S-HLR" },
      { title:"Första hjälpen & HLR", slug:"forsta-hjalpen", cat:"Första hjälpen", desc:"Första hjälpen-åtgärder kombinerat med HLR och hjärtstartare.", dur:"Halvdag", aud:"Företag", price:"Från 995 kr", priceUnit:"/person", img:"Bild: Första hjälpen" },
      { title:"Grundläggande brandskydd", slug:"brandskydd", cat:"Brandskydd", desc:"Förebyggande brandskydd, släckutrustning och utrymning i praktiken.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Brandskydd" },
      { title:"Krishantering & beredskap", slug:"krishantering", cat:"Kris", desc:"Krisberedskap och första psykologiska hjälpen för arbetsplatsen.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Krishantering" },
      { title:"Hot, våld & aggressivt beteende", slug:"hot-vald", cat:"Säkerhet", desc:"Förebygga och hantera hotfulla situationer och aggressivt beteende.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Hot & våld" },
      { title:"Repetition HLR vuxen & barn", slug:"repetition", cat:"Repetition", desc:"Kort uppdateringskurs för att hålla kompetensbeviset aktuellt.", dur:"1 timme", aud:"Alla", price:"499 kr", priceUnit:"/person", img:"Bild: Repetition" },
    ],
    dates: (window.PA_DATES) || [
      { course:"HLR vuxen", city:"Stockholm", venue:"Kungsgatan 12", date:"12 jun 2026", time:"09:00–11:00", price:"699 kr", seats:8, instr:"Hamza Samara" },
      { course:"HLR barn", city:"Uppsala", venue:"Dragarbrunnsg. 3", date:"14 jun 2026", time:"13:00–15:00", price:"699 kr", seats:3, instr:"Sara Mahmud" },
      { course:"S-HLR vuxen", city:"Tierp", venue:"Centralgatan 14", date:"18 jun 2026", time:"09:00–12:00", price:"Offert", seats:6, instr:"Hamza Samara" },
      { course:"Första hjälpen & HLR", city:"Göteborg", venue:"Avenyn 21", date:"20 jun 2026", time:"09:00–13:00", price:"995 kr", seats:0, instr:"Sara Mahmud" },
      { course:"HLR vuxen", city:"Gävle", venue:"Norra Kungsg. 5", date:"24 jun 2026", time:"17:00–19:00", price:"699 kr", seats:12, instr:"Hamza Samara" },
      { course:"Repetition HLR", city:"Stockholm", venue:"Kungsgatan 12", date:"27 jun 2026", time:"12:00–13:00", price:"499 kr", seats:2, instr:"Sara Mahmud" },
      { course:"HLR barn", city:"Göteborg", venue:"Avenyn 21", date:"2 jul 2026", time:"09:00–11:00", price:"699 kr", seats:9, instr:"Sara Mahmud" },
      { course:"S-HLR barn", city:"Uppsala", venue:"Dragarbrunnsg. 3", date:"5 jul 2026", time:"13:00–16:00", price:"Offert", seats:5, instr:"Hamza Samara" },
    ],
    products: (window.PA_PRODUCTS) || [
      { name:"Smarty Saver Halvautomatisk", usp:"Barnläge · IP56 · 10 års garanti", price:"11 999 kr", priceEx:"9 599 kr", badges:["Populär","Barnläge"], stock:"I lager", brand:"Smarty Saver", img:"Bild: Smarty Saver" },
      { name:"DefiSign LIFE AED", usp:"Pekskärm med guidning · Hel-/halvautomatisk", price:"18 499 kr", priceEx:"14 799 kr", badges:["Skärm"], stock:"I lager", brand:"DefiSign", img:"Bild: DefiSign LIFE" },
      { name:"Philips HeartStart HS1", usp:"Marknadsledande · Enkel & pålitlig", price:"19 999 kr", priceEx:"15 999 kr", badges:["Bästsäljare"], stock:"Få i lager", brand:"Philips", img:"Bild: Philips HS1" },
      { name:"Primedic HeartSave AED", usp:"Robust · För utomhusbruk", price:"14 999 kr", priceEx:"11 999 kr", badges:["Utomhus"], stock:"I lager", brand:"Primedic", img:"Bild: Primedic" },
      { name:"CU Medical iPAD SP1", usp:"Automatisk barn-/vuxenläge", price:"13 499 kr", priceEx:"10 799 kr", badges:["Barnläge"], stock:"I lager", brand:"CU Medical", img:"Bild: CU Medical SP1" },
      { name:"Mindray BeneHeart C1A", usp:"Kompakt · QR-guidning i realtid", price:"15 999 kr", priceEx:"12 799 kr", badges:["Nyhet"], stock:"I lager", brand:"Mindray", img:"Bild: Mindray C1A" },
    ],
  };

  /* ---------------- READS (with demo fallback) ---------------- */
  async function listCourses() {
    if (ready()) {
      const { data, error } = await sb().from("courses").select("*").eq("active", true).order("sort", { ascending: true });
      if (!error && data && data.length) return data;
    }
    return DEMO.courses.map((c, i) => ({
      id: c.slug, sort: i, title: c.title, slug: c.slug, category: c.cat, audience: c.aud,
      description: c.desc, duration: c.dur, price_label: c.price, price_unit: c.priceUnit, img: c.img, active: true,
    }));
  }
  async function getCourse(slug) {
    if (ready()) { const { data } = await sb().from("courses").select("*").eq("slug", slug).maybeSingle(); if (data) return data; }
    const c = DEMO.courses.find((x) => x.slug === slug);
    return c ? { id: c.slug, title: c.title, slug: c.slug, category: c.cat, audience: c.aud, description: c.desc, duration: c.dur, price_label: c.price, price_unit: c.priceUnit, img: c.img } : null;
  }
  async function listInstances(opts = {}) {
    if (ready()) {
      let q = sb().from("course_instances").select("*, course:courses(title,slug)").gte("start_at", new Date().toISOString()).order("start_at", { ascending: true });
      if (opts.city) q = q.eq("city", opts.city);
      const { data, error } = await q;
      if (!error && data) return data;
    }
    let rows = DEMO.dates.map((d, i) => ({
      id: "demo-" + i, course: { title: d.course }, course_title: d.course, city: d.city, venue: d.venue,
      date_label: d.date, time_label: d.time, price_label: d.price, seats_left: d.seats, instructor: d.instr,
    }));
    if (opts.city && opts.city !== "Alla städer") rows = rows.filter((d) => d.city === opts.city || (opts.city === "Tierp & Gävle" && (d.city === "Tierp" || d.city === "Gävle")));
    return rows;
  }
  async function listProducts(opts = {}) {
    let list;
    if (ready()) {
      let qy = sb().from("products").select("*, category:product_categories!inner(slug,name)").eq("active", true);
      if (opts.category) qy = qy.eq("category.slug", opts.category);
      const { data, error } = await qy;
      list = (!error && data && data.length) ? data : null;
      if (!list && !opts.category) {
        const r2 = await sb().from("products").select("*").eq("active", true);
        list = (!r2.error && r2.data && r2.data.length) ? r2.data : null;
      }
    }
    if (!list) list = DEMO.products.map((p, i) => ({
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
  async function listCategories() {
    if (ready()) {
      const { data } = await sb().from("product_categories").select("*").order("sort");
      if (data && data.length) return data;
    }
    return [];
  }
  async function listArticles() {
    if (ready()) { const { data } = await sb().from("articles").select("*").eq("published", true).order("created_at", { ascending: false }); if (data) return data; }
    return [];
  }

  /* ---------------- WRITES (require backend) ----------------
     Guests may INSERT (RLS) but cannot read leads back, so these inserts NEVER
     chain .select() (return=minimal) and we generate ids client-side. */
  function uuid() {
    if (self.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  const isUuid = (v) => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(v);
  async function createQuote(payload) { need(); const id = uuid(); const { error } = await sb().from("quote_requests").insert({ id, ...payload }); if (error) throw error; return { id, reference: id.slice(0, 8).toUpperCase() }; }
  async function sendContact(payload) { need(); const { error } = await sb().from("contact_messages").insert(payload); if (error) throw error; return { ok: true }; }
  async function createBooking({ instance_id, type, contact, participants }) {
    need();
    const { data: user } = await sb().auth.getUser();
    const id = uuid();
    const { error } = await sb().from("bookings").insert({
      id, course_instance_id: isUuid(instance_id) ? instance_id : null, booking_type: type || "private", status: "confirmed",
      contact_name: contact?.name, contact_email: contact?.email, contact_phone: contact?.phone,
      company_name: contact?.company || null, org_number: contact?.org || null, user_id: user?.user?.id || null,
    });
    if (error) throw error;
    if (participants?.length) {
      const rows = participants.map((p) => ({ booking_id: id, first_name: p.first, last_name: p.last, email: p.email }));
      await sb().from("participants").insert(rows);
    }
    return { id, reference: id.slice(0, 8).toUpperCase() };
  }
  async function createOrder({ items, customer, totals }) {
    need();
    const { data: user } = await sb().auth.getUser();
    const id = uuid();
    const order_number = "PA-" + Date.now().toString(36).toUpperCase();
    const { error } = await sb().from("orders").insert({
      id, order_number, status: "received", payment_method: customer?.payment || "invoice",
      total_incl_vat: totals?.inclVat, total_excl_vat: totals?.exclVat, vat: totals?.vat,
      customer_name: customer?.name, customer_email: customer?.email, customer_phone: customer?.phone,
      company_name: customer?.company || null, org_number: customer?.org || null,
      shipping_address: customer?.address || null, user_id: user?.user?.id || null,
    });
    if (error) throw error;
    if (items?.length) {
      const rows = items.map((i) => ({ order_id: id, product_name: i.name, sku: i.sku || null, qty: i.qty, unit_price_incl_vat: num(i.priceInclVat) }));
      await sb().from("order_items").insert(rows);
    }
    return { id, order_number };
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
    ready, listCourses, getCourse, listInstances, listProducts, getProduct, listArticles, listCategories,
    createQuote, sendContact, createBooking, createOrder,
    adminList, adminCounts, myBookings, myOrders,
  };
})();
