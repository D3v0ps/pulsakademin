/* PulsAkademin — backend configuration.
 *
 * The anon key is PUBLIC by design (it ships to the browser); Row-Level
 * Security in Supabase is what protects the data. Safe to commit.
 *
 * TO GO LIVE: create a free project at supabase.com, run supabase/schema.sql
 * in its SQL editor, then paste the two values below (Project Settings → API)
 * and redeploy. Until then the site renders from the demo data in data.js.
 */
window.PA_CONFIG = {
  SUPABASE_URL: "",       // e.g. https://xxxxxxxx.supabase.co
  SUPABASE_ANON_KEY: "",  // the "anon / public" key
};
window.PA_BACKEND_READY = !!(window.PA_CONFIG.SUPABASE_URL && window.PA_CONFIG.SUPABASE_ANON_KEY);
