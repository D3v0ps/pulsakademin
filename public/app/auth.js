/* PulsAkademin — authentication via Supabase Auth.
 * Throws a clear Swedish error if the backend isn't configured yet (no toasts:
 * callers render the message inline). API:
 *   PA.Auth.ready(), .signUp({email,password,name,phone}), .signIn({email,password}),
 *           .signOut(), .user(), .profile(), .onChange(cb)
 */
(function () {
  window.PA = window.PA || {};
  const sb = () => PA.sb;
  const need = () => { if (!sb()) throw new Error("Inloggning kräver att Supabase är konfigurerad (se app/config.js)."); };

  PA.Auth = {
    ready: () => !!sb(),
    async signUp({ email, password, name, phone }) {
      need();
      const { data, error } = await sb().auth.signUp({
        email, password, options: { data: { name: name || "", phone: phone || "" } },
      });
      if (error) throw error;
      return data;
    },
    async signIn({ email, password }) {
      need();
      const { data, error } = await sb().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() { if (sb()) await sb().auth.signOut(); },
    async user() { if (!sb()) return null; const { data } = await sb().auth.getUser(); return data?.user || null; },
    async profile() {
      const u = await this.user(); if (!u) return null;
      const { data } = await sb().from("profiles").select("*").eq("id", u.id).maybeSingle();
      return data || { id: u.id, email: u.email, name: u.user_metadata?.name || "", role: "customer" };
    },
    onChange(cb) { if (sb()) sb().auth.onAuthStateChange((_e, session) => cb(session)); },
  };
})();
