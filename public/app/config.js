/* PulsAkademin — backend configuration.
 * The anon key is PUBLIC by design (it ships to the browser); Row-Level
 * Security in Supabase protects the data. Connected to the "Pulsakademin"
 * Supabase project. Schema: supabase/schema.sql.
 */
window.PA_CONFIG = {
  SUPABASE_URL: "https://dfzwuehpwtfstdkuusoc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmend1ZWhwd3Rmc3Rka3V1c29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODU2MzIsImV4cCI6MjA5NjE2MTYzMn0.sm3QTOiIvl1zLsXFsE6q77h4DVlvn2klDFhSA4vOJwU",
};
window.PA_BACKEND_READY = !!(window.PA_CONFIG.SUPABASE_URL && window.PA_CONFIG.SUPABASE_ANON_KEY);
