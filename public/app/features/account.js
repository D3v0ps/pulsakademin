/* PulsAkademin — account feature: logga-in.html + portal.html
 * Depends on: app/config.js, supabase CDN, app/supabase.js, app/auth.js, app/db.js
 * No toasts. Errors render inline. Redirects on success.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function el(id) { return document.getElementById(id); }

  function setError(id, msg) {
    var node = el(id);
    if (!node) return;
    node.textContent = msg || "";
    node.hidden = !msg;
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    if (loading) {
      btn._txt = btn._txt || btn.textContent;
      btn.textContent = "Vänta…";
    } else {
      btn.textContent = btn._txt || btn.textContent;
    }
  }

  function formatDate(str) {
    if (!str) return "–";
    try {
      return new Date(str).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return str;
    }
  }

  function statusBadge(status) {
    var map = {
      confirmed: ["badge--green", "Bekräftad"],
      pending:   ["badge--amber", "Väntar"],
      cancelled: ["badge--danger", "Avbokad"],
      received:  ["badge--info",  "Mottagen"],
      shipped:   ["badge--info",  "Skickad"],
      delivered: ["badge--green", "Levererad"],
      invoiced:  ["badge--ink",   "Fakturerad"],
    };
    var s = (status || "").toLowerCase();
    var pair = map[s] || ["", status || "–"];
    return '<span class="badge ' + pair[0] + '"><span class="dot"></span>' + pair[1] + "</span>";
  }

  /* ------------------------------------------------------------------ */
  /*  logga-in.html                                                        */
  /* ------------------------------------------------------------------ */

  function initLoginPage() {
    var root = el("pa-auth-root");
    if (!root) return;

    /* ---- check already logged in ---- */
    PA.Auth.user().then(function (user) {
      if (user) {
        showAlreadyLoggedIn(root, user);
      } else {
        renderAuthForms(root);
      }
    }).catch(function () {
      renderAuthForms(root);
    });
  }

  function showAlreadyLoggedIn(root, user) {
    PA.Auth.profile().then(function (p) {
      var name = (p && p.name) ? p.name : (user.email || "");
      root.innerHTML =
        '<div style="text-align:center;padding:40px 24px">' +
        '<div class="feature__ic" style="margin:0 auto 20px;background:var(--cream-300);color:var(--ink);width:56px;height:56px;font-size:1.1rem">' +
          initials(name) +
        '</div>' +
        '<h2 class="h3 mb-8">Du är inloggad</h2>' +
        '<p class="muted mb-24">Inloggad som <strong>' + escHtml(user.email) + '</strong></p>' +
        '<a class="btn btn--primary btn--lg" href="portal.html">Gå till Mina sidor</a>' +
        '<p class="mt-24"><button class="btn btn--ghost" id="pa-logout-already">Logga ut</button></p>' +
        '</div>';
      var logoutBtn = el("pa-logout-already");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          setLoading(logoutBtn, true);
          PA.Auth.signOut().then(function () {
            window.location.reload();
          }).catch(function () {
            window.location.reload();
          });
        });
      }
    }).catch(function () {});
  }

  function renderAuthForms(root) {
    root.innerHTML =
      /* tab bar */
      '<div class="seg" style="display:inline-flex;background:var(--cream-300);border-radius:var(--r-pill);padding:4px;gap:4px;margin-bottom:24px" role="tablist">' +
        '<button class="btn btn--sm btn--light" id="pa-tab-login" role="tab" aria-selected="true" style="box-shadow:var(--sh-sm)">Logga in</button>' +
        '<button class="btn btn--sm" id="pa-tab-register" role="tab" aria-selected="false" style="color:var(--muted)">Skapa konto</button>' +
      '</div>' +

      /* login form */
      '<div id="pa-panel-login">' +
        '<h1 class="h2 mb-8">Välkommen tillbaka</h1>' +
        '<p class="muted mb-24">Logga in för att se dina kurser, kompetensbevis och beställningar.</p>' +
        '<div id="pa-login-notice" class="pa-notice" hidden></div>' +
        '<div class="field"><label for="pa-login-email">E-post</label>' +
          '<input class="input" id="pa-login-email" type="email" autocomplete="email" placeholder="namn@exempel.se">' +
          '<span id="pa-login-email-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-login-pw">Lösenord</label>' +
          '<input class="input" id="pa-login-pw" type="password" autocomplete="current-password" placeholder="••••••••">' +
          '<span id="pa-login-pw-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="flex between center mb-16">' +
          '<label class="checkbox" style="margin:0"><input type="checkbox" id="pa-remember"> <span>Kom ihåg mig</span></label>' +
          '<a class="tlink" href="#" style="font-size:14px" id="pa-forgot">Glömt lösenord?</a>' +
        '</div>' +
        '<button class="btn btn--primary btn--block btn--lg" id="pa-login-btn">Logga in</button>' +
        '<p class="tac muted mt-24" style="font-size:14px">Har du inget konto? <button class="tlink" id="pa-switch-to-reg" style="background:none;border:none;cursor:pointer;font-size:inherit">Skapa konto</button></p>' +
        '<p class="tac muted mt-16" style="font-size:13px">Företagskund? <a class="tlink" href="#">Logga in på företagskonto</a></p>' +
      '</div>' +

      /* forgot-password form (hidden initially) */
      '<div id="pa-panel-forgot" hidden>' +
        '<h1 class="h2 mb-8">Glömt lösenord?</h1>' +
        '<p class="muted mb-24">Ange din e-postadress så skickar vi en återställningslänk.</p>' +
        '<div id="pa-forgot-notice" class="pa-notice" hidden></div>' +
        '<div class="field"><label for="pa-forgot-email">E-post</label>' +
          '<input class="input" id="pa-forgot-email" type="email" autocomplete="email" placeholder="namn@exempel.se">' +
          '<span id="pa-forgot-email-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<button class="btn btn--primary btn--block btn--lg" id="pa-forgot-btn">Skicka återställningslänk</button>' +
        '<p class="tac muted mt-24" style="font-size:14px"><button class="tlink" id="pa-back-to-login" style="background:none;border:none;cursor:pointer;font-size:inherit">← Tillbaka till inloggning</button></p>' +
      '</div>' +

      /* set-new-password form (hidden initially, shown on PASSWORD_RECOVERY) */
      '<div id="pa-panel-recovery" hidden>' +
        '<h1 class="h2 mb-8">Välj nytt lösenord</h1>' +
        '<p class="muted mb-24">Ange ditt nya lösenord nedan.</p>' +
        '<div id="pa-recovery-notice" class="pa-notice" hidden></div>' +
        '<div class="field"><label for="pa-recovery-pw">Nytt lösenord</label>' +
          '<input class="input" id="pa-recovery-pw" type="password" autocomplete="new-password" placeholder="Minst 8 tecken">' +
          '<span id="pa-recovery-pw-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-recovery-pw2">Upprepa lösenord</label>' +
          '<input class="input" id="pa-recovery-pw2" type="password" autocomplete="new-password" placeholder="Upprepa lösenordet">' +
          '<span id="pa-recovery-pw2-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<button class="btn btn--primary btn--block btn--lg" id="pa-recovery-btn">Spara nytt lösenord</button>' +
        '<div id="pa-recovery-success" hidden style="margin-top:18px;text-align:center">' +
          '<p style="color:var(--green,#1a8c4e);font-weight:600;margin-bottom:12px">Lösenordet är uppdaterat ✓</p>' +
          '<a class="btn btn--primary" href="portal.html">Gå till Mina sidor</a>' +
        '</div>' +
      '</div>' +

      /* register form */
      '<div id="pa-panel-register" hidden>' +
        '<h1 class="h2 mb-8">Skapa konto</h1>' +
        '<p class="muted mb-24">Bli medlem och hantera dina kurser och köp på ett ställe.</p>' +
        '<div id="pa-reg-notice" class="pa-notice" hidden></div>' +
        '<div class="field"><label for="pa-reg-name">Fullständigt namn</label>' +
          '<input class="input" id="pa-reg-name" type="text" autocomplete="name" placeholder="Förnamn Efternamn">' +
          '<span id="pa-reg-name-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-reg-phone">Telefonnummer</label>' +
          '<input class="input" id="pa-reg-phone" type="tel" autocomplete="tel" placeholder="07x-xxx xx xx">' +
          '<span id="pa-reg-phone-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-reg-email">E-post</label>' +
          '<input class="input" id="pa-reg-email" type="email" autocomplete="email" placeholder="namn@exempel.se">' +
          '<span id="pa-reg-email-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-reg-pw">Lösenord</label>' +
          '<input class="input" id="pa-reg-pw" type="password" autocomplete="new-password" placeholder="Minst 8 tecken">' +
          '<span id="pa-reg-pw-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<div class="field"><label for="pa-reg-pw2">Bekräfta lösenord</label>' +
          '<input class="input" id="pa-reg-pw2" type="password" autocomplete="new-password" placeholder="Upprepa lösenordet">' +
          '<span id="pa-reg-pw2-err" class="pa-field-err" hidden></span>' +
        '</div>' +
        '<button class="btn btn--primary btn--block btn--lg" id="pa-reg-btn">Skapa konto</button>' +
        '<p class="tac muted mt-24" style="font-size:14px">Har du redan ett konto? <button class="tlink" id="pa-switch-to-login" style="background:none;border:none;cursor:pointer;font-size:inherit">Logga in</button></p>' +
      '</div>';

    /* success panel (hidden initially) */
    var successPanel = document.createElement("div");
    successPanel.id = "pa-panel-success";
    successPanel.hidden = true;
    successPanel.innerHTML =
      '<div style="text-align:center;padding:24px 0">' +
      '<div style="font-size:2.5rem;margin-bottom:16px">✅</div>' +
      '<h2 class="h3 mb-8">Konto skapat!</h2>' +
      '<p class="muted mb-24">Verifiera din e-postadress via länken vi skickade, sedan kan du logga in.</p>' +
      '<button class="btn btn--primary" id="pa-goto-login">Logga in</button>' +
      '</div>';
    root.appendChild(successPanel);

    wireLoginForm();
    wireRegisterForm();
    wireTabs();
    wireForgotPanel();
    wireRecovery();
  }

  function wireTabs() {
    var tabLogin    = el("pa-tab-login");
    var tabReg      = el("pa-tab-register");
    var switchToReg = el("pa-switch-to-reg");
    var switchToLog = el("pa-switch-to-login");

    function showLogin() {
      el("pa-panel-login").hidden    = false;
      el("pa-panel-register").hidden = true;
      tabLogin.classList.add("btn--light");
      tabLogin.style.boxShadow = "var(--sh-sm)";
      tabLogin.style.color = "";
      tabReg.classList.remove("btn--light");
      tabReg.style.boxShadow = "";
      tabReg.style.color = "var(--muted)";
      tabLogin.setAttribute("aria-selected", "true");
      tabReg.setAttribute("aria-selected", "false");
    }
    function showRegister() {
      el("pa-panel-login").hidden    = true;
      el("pa-panel-register").hidden = false;
      tabReg.classList.add("btn--light");
      tabReg.style.boxShadow = "var(--sh-sm)";
      tabReg.style.color = "";
      tabLogin.classList.remove("btn--light");
      tabLogin.style.boxShadow = "";
      tabLogin.style.color = "var(--muted)";
      tabReg.setAttribute("aria-selected", "true");
      tabLogin.setAttribute("aria-selected", "false");
    }
    tabLogin.addEventListener("click", showLogin);
    tabReg.addEventListener("click", showRegister);
    if (switchToReg) switchToReg.addEventListener("click", showRegister);
    if (switchToLog) switchToLog.addEventListener("click", showLogin);
  }

  function wireLoginForm() {
    var btn = el("pa-login-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var email = (el("pa-login-email").value || "").trim();
      var pw    = (el("pa-login-pw").value || "");
      var valid = true;

      setError("pa-login-email-err", "");
      setError("pa-login-pw-err", "");
      setError("pa-login-notice", "");

      if (!email || !email.includes("@")) { setError("pa-login-email-err", "Ange en giltig e-postadress."); valid = false; }
      if (!pw) { setError("pa-login-pw-err", "Ange ditt lösenord."); valid = false; }
      if (!valid) return;

      setLoading(btn, true);
      PA.Auth.signIn({ email: email, password: pw }).then(function () {
        window.location.href = "portal.html";
      }).catch(function (err) {
        setLoading(btn, false);
        var msg = err && err.message ? translateAuthError(err.message) : "Inloggning misslyckades. Kontrollera dina uppgifter.";
        setError("pa-login-notice", msg);
      });
    });
  }

  function wireRegisterForm() {
    var btn = el("pa-reg-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var name  = (el("pa-reg-name").value  || "").trim();
      var phone = (el("pa-reg-phone").value || "").trim();
      var email = (el("pa-reg-email").value || "").trim();
      var pw    = (el("pa-reg-pw").value   || "");
      var pw2   = (el("pa-reg-pw2").value  || "");
      var valid = true;

      ["pa-reg-name-err","pa-reg-phone-err","pa-reg-email-err","pa-reg-pw-err","pa-reg-pw2-err","pa-reg-notice"].forEach(function (id) { setError(id, ""); });

      if (!name) { setError("pa-reg-name-err", "Ange ditt namn."); valid = false; }
      if (!phone) { setError("pa-reg-phone-err", "Ange ditt telefonnummer."); valid = false; }
      if (!email || !email.includes("@")) { setError("pa-reg-email-err", "Ange en giltig e-postadress."); valid = false; }
      if (pw.length < 8) { setError("pa-reg-pw-err", "Lösenordet måste vara minst 8 tecken."); valid = false; }
      if (pw !== pw2) { setError("pa-reg-pw2-err", "Lösenorden matchar inte."); valid = false; }
      if (!valid) return;

      setLoading(btn, true);
      PA.Auth.signUp({ email: email, password: pw, name: name, phone: phone }).then(function (data) {
        setLoading(btn, false);
        /* if Supabase returned a session, user is auto-confirmed → redirect */
        if (data && data.session) {
          window.location.href = "portal.html";
        } else {
          /* email confirmation required */
          el("pa-panel-register").hidden = true;
          el("pa-panel-success").hidden  = false;
          var gotoLogin = el("pa-goto-login");
          if (gotoLogin) gotoLogin.addEventListener("click", function () {
            el("pa-panel-success").hidden  = true;
            el("pa-panel-login").hidden    = false;
          });
        }
      }).catch(function (err) {
        setLoading(btn, false);
        var msg = err && err.message ? translateAuthError(err.message) : "Det gick inte att skapa kontot.";
        setError("pa-reg-notice", msg);
      });
    });
  }

  function wireForgotPanel() {
    /* "Glömt lösenord?"-link in the login form — swaps to the forgot panel */
    var link = el("pa-forgot");
    if (!link) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      /* pre-fill the forgot email field from the login email field if available */
      var loginEmail = el("pa-login-email");
      var forgotEmail = el("pa-forgot-email");
      if (loginEmail && forgotEmail && loginEmail.value) {
        forgotEmail.value = loginEmail.value;
      }
      el("pa-panel-login").hidden   = true;
      el("pa-panel-forgot").hidden  = false;
      /* hide tab bar while in forgot flow */
      var seg = document.querySelector(".seg");
      if (seg) seg.hidden = true;
    });

    /* back link */
    var backBtn = el("pa-back-to-login");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        setError("pa-forgot-notice", "");
        setError("pa-forgot-email-err", "");
        el("pa-panel-forgot").hidden = true;
        el("pa-panel-login").hidden  = false;
        var seg = document.querySelector(".seg");
        if (seg) seg.hidden = false;
      });
    }

    /* send reset-link button */
    var btn = el("pa-forgot-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var email = (el("pa-forgot-email").value || "").trim();
      setError("pa-forgot-email-err", "");
      setError("pa-forgot-notice", "");

      if (!email || !email.includes("@")) {
        setError("pa-forgot-email-err", "Ange en giltig e-postadress.");
        return;
      }

      setLoading(btn, true);

      var doRequest = function () {
        return PA.sb.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/logga-in.html"
        });
      };

      var showConfirm = function () {
        setLoading(btn, false);
        var notice = el("pa-forgot-notice");
        if (notice) {
          notice.textContent = "Om kontot finns har vi skickat en återställningslänk till din e-post.";
          notice.style.background = "var(--success-bg,#f0faf4)";
          notice.style.color      = "var(--green,#1a8c4e)";
          notice.style.borderColor = "var(--green,#1a8c4e)";
          notice.hidden = false;
        }
        btn.disabled = true;
      };

      if (!PA.Auth.ready()) {
        /* no Supabase — still show the safe confirmation message */
        showConfirm();
        return;
      }

      doRequest().then(function () {
        showConfirm();
      }).catch(function (err) {
        setLoading(btn, false);
        /* network/real errors get shown; account-not-found style errors use generic message */
        var msg = err && err.message ? err.message : "";
        var isNetworkErr = msg && !msg.toLowerCase().includes("not found") && !msg.toLowerCase().includes("no user");
        if (isNetworkErr) {
          setError("pa-forgot-notice", translateAuthError(msg));
        } else {
          showConfirm();
        }
      });
    });
  }

  function wireRecovery() {
    if (!PA.Auth.ready()) return;

    /* Check URL hash for type=recovery (Supabase puts it there on redirect) */
    var hash = window.location.hash || "";
    var isRecovery = hash.includes("type=recovery");

    /* Also listen for onAuthStateChange PASSWORD_RECOVERY event */
    PA.sb.auth.onAuthStateChange(function (event) {
      if (event === "PASSWORD_RECOVERY") {
        showRecoveryPanel();
      }
    });

    if (isRecovery) {
      showRecoveryPanel();
    }
  }

  function showRecoveryPanel() {
    /* Hide everything else, show only the recovery panel */
    ["pa-panel-login", "pa-panel-register", "pa-panel-forgot", "pa-panel-success"].forEach(function (id) {
      var node = el(id);
      if (node) node.hidden = true;
    });
    var seg = document.querySelector(".seg");
    if (seg) seg.hidden = true;

    var panel = el("pa-panel-recovery");
    if (panel) panel.hidden = false;

    wireRecoveryForm();
  }

  function wireRecoveryForm() {
    var btn = el("pa-recovery-btn");
    if (!btn || btn._wired) return;
    btn._wired = true;

    btn.addEventListener("click", function () {
      var pw  = (el("pa-recovery-pw").value  || "");
      var pw2 = (el("pa-recovery-pw2").value || "");
      var valid = true;

      setError("pa-recovery-pw-err",  "");
      setError("pa-recovery-pw2-err", "");
      setError("pa-recovery-notice",  "");

      if (pw.length < 8) { setError("pa-recovery-pw-err", "Lösenordet måste vara minst 8 tecken."); valid = false; }
      if (pw !== pw2)    { setError("pa-recovery-pw2-err", "Lösenorden matchar inte."); valid = false; }
      if (!valid) return;

      setLoading(btn, true);

      PA.sb.auth.updateUser({ password: pw }).then(function () {
        setLoading(btn, false);
        btn.hidden = true;
        el("pa-recovery-pw").closest(".field") && (el("pa-recovery-pw").closest(".field").hidden = true);
        el("pa-recovery-pw2").closest(".field") && (el("pa-recovery-pw2").closest(".field").hidden = true);
        var successDiv = el("pa-recovery-success");
        if (successDiv) successDiv.hidden = false;
      }).catch(function (err) {
        setLoading(btn, false);
        var msg = err && err.message ? translateAuthError(err.message) : "Det gick inte att uppdatera lösenordet.";
        setError("pa-recovery-notice", msg);
      });
    });
  }

  function translateAuthError(msg) {
    var m = (msg || "").toLowerCase();
    if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("email not confirmed")) return "Felaktig e-post eller lösenord.";
    if (m.includes("user already registered") || m.includes("already exists")) return "En användare med den e-postadressen finns redan.";
    if (m.includes("password should be")) return "Lösenordet måste vara minst 6 tecken.";
    if (m.includes("rate limit")) return "För många försök. Vänta en stund och försök igen.";
    if (m.includes("supabase") || m.includes("konfigurerad")) return msg;
    return msg;
  }

  /* ------------------------------------------------------------------ */
  /*  portal.html                                                          */
  /* ------------------------------------------------------------------ */

  function initPortalPage() {
    var root = el("pa-portal-root");
    if (!root) return;

    PA.Auth.user().then(function (user) {
      if (!user) {
        renderGated(root);
        return;
      }
      PA.Auth.profile().then(function (profile) {
        renderPortal(root, user, profile || { email: user.email, name: "", role: "customer" });
      }).catch(function () {
        renderPortal(root, user, { email: user.email, name: "", role: "customer" });
      });
    }).catch(function () {
      renderGated(root);
    });
  }

  function renderGated(root) {
    root.innerHTML =
      '<section class="section" style="padding-block:clamp(28px,4vw,48px)">' +
      '<div class="container" style="max-width:560px;text-align:center">' +
        '<div style="font-size:3rem;margin-bottom:20px">🔒</div>' +
        '<h1 class="h2 mb-8">Mina sidor</h1>' +
        '<p class="muted mb-24">Logga in för att se dina kurser, intyg och beställningar.</p>' +
        '<a class="btn btn--primary btn--lg" href="logga-in.html">Logga in</a>' +
        '<p class="mt-16 muted" style="font-size:14px">Har du inget konto? <a class="tlink" href="logga-in.html#skapa">Skapa konto</a></p>' +
      '</div>' +
      '</section>';
  }

  function roleBadgeHtml(roleKey) {
    var map = {
      admin:      ["badge--bordeaux", "Admin"],
      instructor: ["badge--info",     "Instruktör"],
      company:    ["badge--amber",    "Företagskund"],
    };
    var pair = map[roleKey] || ["badge--green", "Kund"];
    return '<span class="badge ' + pair[0] + '" style="font-size:12px;padding:3px 10px">' + pair[1] + '</span>';
  }

  function renderPortal(root, user, profile) {
    var name     = profile.name || profile.email || "";
    var email    = profile.email || user.email || "";
    var phone    = profile.phone || "";
    var roleKey  = (profile.role || "customer").toLowerCase();
    var role     = roleKey === "admin" ? "Administratör" : roleKey === "company" ? "Företagskund" : roleKey === "instructor" ? "Instruktör" : "Privatkund";
    var ini      = initials(name);

    root.innerHTML =
      '<section class="section" style="padding-block:clamp(28px,4vw,48px)" data-screen-label="Medlemsportal">' +
      '<div class="container portal">' +

        /* ---- sidebar nav ---- */
        '<aside class="portal-nav">' +
          '<div class="card"><div class="card__body" style="padding:14px">' +
            '<div class="flex center gap-12 mb-16" style="padding:6px 8px">' +
              '<div class="feature__ic" style="background:var(--cream-300);color:var(--ink)">' + ini + '</div>' +
              '<div><b style="font-size:14.5px">' + escHtml(name) + '</b>' +
              '<div style="margin-top:4px">' + roleBadgeHtml(roleKey) + '</div></div>' +
            '</div>' +
            '<nav style="display:grid;gap:2px">' +
              '<a class="on" href="#oversikt">📊 Översikt</a>' +
              '<a href="#kurser">🎓 Mina kurser</a>' +
              '<a href="#bestallningar">📦 Mina beställningar</a>' +
              '<a href="#profil">⚙️ Min profil</a>' +
            '</nav>' +
            '<hr class="rule" style="margin:14px 0">' +
            '<button id="pa-signout-btn" style="display:flex;align-items:center;gap:11px;padding:11px 14px;color:var(--muted);font-size:15px;font-weight:600;background:none;border:none;cursor:pointer;width:100%;border-radius:var(--r-sm)" class="pa-logout-link">↩︎ Logga ut</button>' +
          '</div></div>' +

          '<div class="card mt-16" style="background:var(--bordeaux-800);color:var(--cream);border:0"><div class="card__body">' +
            '<b style="font-family:var(--font-display);font-size:1.1rem">Företagskonto?</b>' +
            '<p style="color:rgba(251,246,240,.8);font-size:13.5px;margin:8px 0 14px">Hantera deltagare, intyg och fakturor samlat.</p>' +
            '<a class="btn btn--primary btn--sm" href="#">Läs mer</a>' +
          '</div></div>' +
        '</aside>' +

        /* ---- main content ---- */
        '<div>' +
          '<h1 class="h2 mb-8" id="oversikt">Hej ' + escHtml(firstName(name)) + '! 👋</h1>' +
          '<p class="muted mb-24">Här är en överblick över dina kurser och köp.</p>' +

          /* KPI row — filled after data loads */
          '<div class="kpi mb-32" id="pa-kpi">' +
            '<div class="card"><div class="card__body"><b id="pa-kpi-bookings" style="font-family:var(--font-display);font-size:1.9rem;font-weight:800;display:block;line-height:1">–</b><span class="muted" style="font-size:14px">Bokningar</span></div></div>' +
            '<div class="card"><div class="card__body"><b id="pa-kpi-orders" style="font-family:var(--font-display);font-size:1.9rem;font-weight:800;display:block;line-height:1">–</b><span class="muted" style="font-size:14px">Beställningar</span></div></div>' +
          '</div>' +

          /* bookings section */
          '<h2 class="h3 mb-16" id="kurser" style="font-size:1.2rem">Mina kurser &amp; bokningar</h2>' +
          '<div class="card mb-32" id="pa-bookings-card"><div class="card__body">' +
            '<div id="pa-bookings-loading" class="pa-loading-row">Laddar bokningar…</div>' +
          '</div></div>' +

          /* orders section */
          '<h2 class="h3 mb-16" id="bestallningar" style="font-size:1.2rem">Mina beställningar</h2>' +
          '<div class="card mb-32" id="pa-orders-card"><div class="card__body">' +
            '<div id="pa-orders-loading" class="pa-loading-row">Laddar beställningar…</div>' +
          '</div></div>' +

          /* admin card — only for admins */
          (roleKey === "admin" ?
            '<div class="card mb-24" style="border:2px solid var(--bordeaux-700,#6b1f3a);background:var(--bordeaux-50,#fdf5f7)">' +
              '<div class="card__body" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
                '<div>' +
                  '<b style="font-size:1rem;display:block;margin-bottom:4px">Adminpanelen</b>' +
                  '<p class="muted" style="font-size:13.5px;margin:0">Hantera kurser, deltagare och betalningar.</p>' +
                '</div>' +
                '<a class="btn btn--primary" href="admin.html" style="white-space:nowrap">Öppna adminpanelen →</a>' +
              '</div>' +
            '</div>'
          : "") +

          /* profile section */
          '<h2 class="h3 mb-16" id="profil" style="font-size:1.2rem">Min profil</h2>' +
          '<div class="card mb-32"><div class="card__body">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px">' +
              '<div>' + roleBadgeHtml(roleKey) + '</div>' +
              '<button class="btn btn--sm btn--light" id="pa-profile-edit-btn">Redigera</button>' +
            '</div>' +
            /* read-only view */
            '<div id="pa-profile-view">' +
              '<table class="table" style="font-size:15px">' +
                '<tbody>' +
                  '<tr><td style="font-weight:600;width:140px">Namn</td><td id="pa-profile-name-display">' + escHtml(name || "–") + '</td></tr>' +
                  '<tr><td style="font-weight:600">E-post</td><td>' + escHtml(email || "–") + '</td></tr>' +
                  '<tr><td style="font-weight:600">Telefon</td><td id="pa-profile-phone-display">' + escHtml(phone || "–") + '</td></tr>' +
                  '<tr><td style="font-weight:600">Roll</td><td>' + escHtml(role) + '</td></tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            /* inline edit form (hidden initially) */
            '<div id="pa-profile-form" hidden>' +
              '<div id="pa-profile-form-notice" class="pa-notice" hidden></div>' +
              '<div class="field"><label for="pa-profile-name-input">Namn</label>' +
                '<input class="input" id="pa-profile-name-input" type="text" autocomplete="name" value="' + escHtml(name) + '">' +
                '<span id="pa-profile-name-err" class="pa-field-err" hidden></span>' +
              '</div>' +
              '<div class="field"><label for="pa-profile-phone-input">Telefonnummer</label>' +
                '<input class="input" id="pa-profile-phone-input" type="tel" autocomplete="tel" value="' + escHtml(phone) + '">' +
                '<span id="pa-profile-phone-err" class="pa-field-err" hidden></span>' +
              '</div>' +
              '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
                '<button class="btn btn--primary" id="pa-profile-save-btn">Spara</button>' +
                '<button class="btn btn--ghost" id="pa-profile-cancel-btn">Avbryt</button>' +
                '<span id="pa-profile-saved-msg" style="color:var(--green,#1a8c4e);font-weight:600;font-size:14px" hidden>Sparat ✓</span>' +
              '</div>' +
            '</div>' +
          '</div></div>' +

        '</div>' /* end main */+
      '</div>' +
      '</section>';

    /* logout button */
    var signoutBtn = el("pa-signout-btn");
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        setLoading(signoutBtn, true);
        PA.Auth.signOut().then(function () {
          window.location.reload();
        }).catch(function () {
          window.location.reload();
        });
      });
    }

    /* smooth anchor nav */
    root.querySelectorAll(".portal-nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          var target = document.getElementById(href.slice(1));
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          root.querySelectorAll(".portal-nav a").forEach(function (x) { x.classList.remove("on"); });
          a.classList.add("on");
        }
      });
    });

    /* profile editing */
    wireProfileEdit(user);

    /* load real data */
    loadBookings();
    loadOrders();
  }

  function wireProfileEdit(user) {
    var editBtn   = el("pa-profile-edit-btn");
    var cancelBtn = el("pa-profile-cancel-btn");
    var saveBtn   = el("pa-profile-save-btn");
    if (!editBtn) return;

    editBtn.addEventListener("click", function () {
      el("pa-profile-view").hidden = true;
      el("pa-profile-form").hidden = false;
      editBtn.hidden = true;
      /* clear stale feedback */
      setError("pa-profile-form-notice", "");
      setError("pa-profile-name-err", "");
      setError("pa-profile-phone-err", "");
      var saved = el("pa-profile-saved-msg");
      if (saved) saved.hidden = true;
    });

    cancelBtn.addEventListener("click", function () {
      el("pa-profile-form").hidden = true;
      el("pa-profile-view").hidden = false;
      editBtn.hidden = false;
    });

    saveBtn.addEventListener("click", function () {
      var newName  = (el("pa-profile-name-input").value  || "").trim();
      var newPhone = (el("pa-profile-phone-input").value || "").trim();
      var valid = true;

      setError("pa-profile-name-err",    "");
      setError("pa-profile-phone-err",   "");
      setError("pa-profile-form-notice", "");
      var saved = el("pa-profile-saved-msg");
      if (saved) saved.hidden = true;

      if (!newName) { setError("pa-profile-name-err", "Ange ditt namn."); valid = false; }
      if (!valid) return;

      setLoading(saveBtn, true);
      if (cancelBtn) cancelBtn.disabled = true;

      var profileUpdate = PA.sb
        .from("profiles")
        .update({ name: newName, phone: newPhone })
        .eq("id", user.id);

      var authUpdate = PA.sb.auth.updateUser({ data: { name: newName, phone: newPhone } });

      Promise.all([profileUpdate, authUpdate]).then(function (results) {
        var profileResult = results[0];
        if (profileResult.error) throw profileResult.error;
        /* update displayed values in the read-only view */
        var nameDisplay = el("pa-profile-name-display");
        if (nameDisplay) nameDisplay.textContent = newName || "–";
        var phoneDisplay = el("pa-profile-phone-display");
        if (phoneDisplay) phoneDisplay.textContent = newPhone || "–";

        setLoading(saveBtn, false);
        if (cancelBtn) cancelBtn.disabled = false;
        if (saved) saved.hidden = false;
      }).catch(function (err) {
        setLoading(saveBtn, false);
        if (cancelBtn) cancelBtn.disabled = false;
        var msg = err && err.message ? err.message : "Det gick inte att spara ändringarna.";
        setError("pa-profile-form-notice", msg);
      });
    });
  }

  function loadBookings() {
    var card = el("pa-bookings-card");
    if (!card) return;

    PA.db.myBookings().then(function (bookings) {
      var kpi = el("pa-kpi-bookings");
      if (kpi) kpi.textContent = bookings ? bookings.length : 0;

      if (!bookings || bookings.length === 0) {
        card.innerHTML = '<div class="card__body"><div class="pa-empty-state">' +
          '<p class="muted" style="text-align:center;padding:24px 0">Du har inga bokningar ännu. <a class="tlink" href="boka.html">Boka en kurs</a></p>' +
          '</div></div>';
        return;
      }

      var rows = bookings.map(function (b) {
        var course = (b.instance && b.instance.course && b.instance.course.title) || b.course_title || "–";
        var startAt = (b.instance && b.instance.start_at) ? formatDate(b.instance.start_at) : (b.date_label || "–");
        var city = (b.instance && b.instance.city) || "–";
        return '<tr>' +
          '<td><b>' + escHtml(course) + '</b></td>' +
          '<td>' + escHtml(startAt) + '</td>' +
          '<td>' + escHtml(city) + '</td>' +
          '<td>' + statusBadge(b.status) + '</td>' +
        '</tr>';
      }).join("");

      card.innerHTML =
        '<div style="overflow-x:auto"><table class="table">' +
        '<thead><tr><th>Kurs</th><th>Datum</th><th>Stad</th><th>Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '</table></div>';
    }).catch(function (err) {
      var msg = err && err.message ? err.message : "Kunde inte ladda bokningar.";
      card.innerHTML = '<div class="card__body"><p class="muted" style="font-size:14px">' + escHtml(msg) + '</p></div>';
      var kpi = el("pa-kpi-bookings");
      if (kpi) kpi.textContent = "–";
    });
  }

  function loadOrders() {
    var card = el("pa-orders-card");
    if (!card) return;

    PA.db.myOrders().then(function (orders) {
      var kpi = el("pa-kpi-orders");
      if (kpi) kpi.textContent = orders ? orders.length : 0;

      if (!orders || orders.length === 0) {
        card.innerHTML = '<div class="card__body"><p class="muted" style="text-align:center;padding:24px 0">Du har inga beställningar ännu. <a class="tlink" href="webbshop.html">Besök webbshopen</a></p></div>';
        return;
      }

      var rows = orders.map(function (o) {
        var items = (o.items || []).map(function (i) { return escHtml(i.product_name || ""); }).join(", ") || "–";
        var ordNum = escHtml(o.order_number || ("#" + o.id));
        var date   = formatDate(o.created_at);
        var total  = o.total_incl_vat ? (o.total_incl_vat.toLocaleString("sv-SE") + " kr") : "–";
        return '<tr>' +
          '<td><b>' + ordNum + '</b></td>' +
          '<td>' + date + '</td>' +
          '<td style="max-width:260px;word-break:break-word">' + items + '</td>' +
          '<td>' + escHtml(total) + '</td>' +
          '<td>' + statusBadge(o.status) + '</td>' +
        '</tr>';
      }).join("");

      card.innerHTML =
        '<div style="overflow-x:auto"><table class="table">' +
        '<thead><tr><th>Order</th><th>Datum</th><th>Produkter</th><th>Totalt</th><th>Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '</table></div>';
    }).catch(function (err) {
      var msg = err && err.message ? err.message : "Kunde inte ladda beställningar.";
      card.innerHTML = '<div class="card__body"><p class="muted" style="font-size:14px">' + escHtml(msg) + '</p></div>';
      var kpi = el("pa-kpi-orders");
      if (kpi) kpi.textContent = "–";
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Utilities                                                            */
  /* ------------------------------------------------------------------ */

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initials(name) {
    var parts = (name || "").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name || "?").slice(0, 2).toUpperCase();
  }

  function firstName(name) {
    return (name || "").trim().split(/\s+/)[0] || name || "";
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", function () {
    if (el("pa-auth-root"))   initLoginPage();
    if (el("pa-portal-root")) initPortalPage();
  });
})();
