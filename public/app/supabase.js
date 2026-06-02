/* PulsAkademin — shared Supabase client.
 * Load order on a page:
 *   app/config.js
 *   https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2   (exposes global `supabase`)
 *   app/supabase.js   (this file)
 *   app/cart.js / app/auth.js / app/db.js
 */
(function () {
  window.PA = window.PA || {};
  try {
    if (window.PA_BACKEND_READY && window.supabase && window.supabase.createClient) {
      PA.sb = window.supabase.createClient(
        window.PA_CONFIG.SUPABASE_URL,
        window.PA_CONFIG.SUPABASE_ANON_KEY,
        { auth: { persistSession: true, autoRefreshToken: true } }
      );
    } else {
      PA.sb = null; // not configured yet → db.js falls back to demo data
    }
  } catch (e) {
    console.warn("Supabase init failed:", e);
    PA.sb = null;
  }
})();
