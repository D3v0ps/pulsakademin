/* PulsAkademin — Course detail feature
 * Powers kurs.html — loads course from ?slug= URL param.
 * Depends on: app/config.js → supabase-js CDN → app/supabase.js → app/cart.js → app/db.js
 * No toasts. Graceful loading/not-found/error states.
 */
(function () {
  'use strict';

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getSlug() {
    try {
      return new URLSearchParams(window.location.search).get('slug') || '';
    } catch (e) {
      var m = window.location.search.match(/[?&]slug=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    }
  }

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function fmtSeats(seats) {
    if (seats === 0) return '<span class="badge badge--danger"><span class="dot"></span>Fullbokad</span>';
    if (seats != null && seats <= 4) return '<span class="badge badge--amber"><span class="dot"></span>' + seats + ' platser kvar</span>';
    return '<span class="badge badge--green"><span class="dot"></span>Platser kvar</span>';
  }

  function normalise(s) {
    return (s || '').toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').trim();
  }

  function courseMatchesTitle(instance, courseTitle) {
    var instTitle = '';
    if (instance.course && instance.course.title) {
      instTitle = instance.course.title;
    } else if (instance.course_title) {
      instTitle = instance.course_title;
    }
    return normalise(instTitle) === normalise(courseTitle);
  }

  /* ---------- render not-found ---------- */

  function renderNotFound(main) {
    main.innerHTML =
      '<section class="pagehead bg-cream2"><div class="container">' +
        '<nav class="crumbs mb-16">' +
          '<a href="index.html">Hem</a><span class="sep">/</span>' +
          '<a href="utbildningar.html">Utbildningar</a><span class="sep">/</span>' +
          '<span>Kursen hittades inte</span>' +
        '</nav>' +
        '<h1 class="h1">Kursen hittades inte</h1>' +
        '<p class="lead measure mt-16">Vi hittade ingen kurs med det angivna namnet. Kolla gärna bland alla våra utbildningar.</p>' +
        '<a class="btn btn--primary mt-24" href="utbildningar.html">Se alla utbildningar</a>' +
      '</div></section>';
  }

  /* ---------- render loading ---------- */

  function renderLoading(main) {
    main.innerHTML =
      '<section class="pagehead bg-cream2"><div class="container">' +
        '<p class="muted" style="padding:48px 0">Laddar kurs…</p>' +
      '</div></section>';
  }

  /* ---------- render error ---------- */

  function renderError(main, msg) {
    main.innerHTML =
      '<section class="pagehead bg-cream2"><div class="container">' +
        '<h1 class="h1">Något gick fel</h1>' +
        '<p class="lead measure mt-16">' + esc(msg || 'Kunde inte ladda kursen. Försök ladda om sidan.') + '</p>' +
        '<a class="btn btn--outline mt-24" href="utbildningar.html">Tillbaka till utbildningar</a>' +
      '</div></section>';
  }

  /* ---------- build praktisk information grid ---------- */

  function buildInfoGrid(course) {
    var rows = [
      ['Längd', course.duration],
      ['Målgrupp', course.audience],
      ['Kompetensbevis', 'Digitalt, ingår i priset'],
      ['Språk', 'Svenska'],
      ['Förkunskaper', 'Inga krävs'],
      ['Utrustning', 'Vi tar med allt material'],
    ];
    return rows.map(function (r) {
      return '<div><b>' + esc(r[0]) + '</b>' + esc(r[1] || '') + '</div>';
    }).join('');
  }

  /* ---------- build related courses ---------- */

  function buildRelated(courses, currentSlug) {
    var others = courses.filter(function (c) { return c.slug !== currentSlug; }).slice(0, 3);
    if (!others.length) return '';
    return others.map(function (c) {
      var priceUnit = c.price_unit ? '<small> ' + esc(c.price_unit) + '</small>' : '';
      var badge = c.category ? '<span class="badge badge--coral">' + esc(c.category) + '</span>' : '';
      var imgHtml = (PA.phImg ? PA.phImg(c.img, c.title).replace('ph-img', 'ph-photo') : '<span>' + esc(c.img || c.title) + '</span>');
      return (
        '<a class="card card--hover" href="kurs.html?slug=' + esc(c.slug) + '">' +
          '<div class="ph ph--16x9" aria-hidden="true">' + imgHtml + '</div>' +
          '<div class="card__body">' +
            '<div class="coursecard__top">' +
              '<h3 class="h3" style="font-size:1.15rem">' + esc(c.title) + '</h3>' +
              badge +
            '</div>' +
            '<p class="muted" style="margin-top:10px;font-size:14.5px">' + esc(c.description || '') + '</p>' +
            '<div class="flex between center" style="margin-top:16px">' +
              '<span class="price-from">' + esc(c.price_label || '') + priceUnit + '</span>' +
              '<span class="tlink">Läs mer →</span>' +
            '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  /* ---------- build instances list ---------- */

  function buildInstances(instances, courseTitle) {
    var filtered = instances.filter(function (d) {
      return courseMatchesTitle(d, courseTitle);
    });

    if (!filtered.length) {
      return (
        '<div class="card"><div class="card__body" style="text-align:center;padding:32px 16px">' +
          '<p style="font-weight:600;margin-bottom:8px">Inga öppna tillfällen just nu</p>' +
          '<p class="muted" style="font-size:14px;margin-bottom:20px">Kontakta oss för att boka ett privat tillfälle för er grupp.</p>' +
          '<a class="btn btn--bordeaux" href="offert.html">Begär offert</a>' +
        '</div></div>'
      );
    }

    var rows = filtered.map(function (d) {
      var dateStr = d.start_at ? fmtDate(d.start_at) : (d.date_label || '');
      var timeStr = d.time_label || '';
      var city = d.city || '';
      var venue = d.venue || '';
      var seats = typeof d.seats_left === 'number' ? d.seats_left : (d.seats_left == null ? 99 : Number(d.seats_left));
      var price = d.price_label || '';
      var full = seats === 0;
      var href = (d.id && !String(d.id).startsWith('demo-')) ? 'boka-flode.html?instance=' + encodeURIComponent(d.id) : 'boka.html';
      return (
        '<div class="card" style="margin-bottom:10px">' +
          '<div class="card__body" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:180px">' +
              '<b style="display:block">' + esc(dateStr) + (timeStr ? ' · ' + esc(timeStr) : '') + '</b>' +
              '<span class="muted" style="font-size:14px">' + esc(city) + (venue ? ' · ' + esc(venue) : '') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
              (price ? '<span class="price-from" style="font-size:1rem">' + esc(price) + '</span>' : '') +
              fmtSeats(seats) +
              '<a class="btn btn--sm ' + (full ? 'btn--outline' : 'btn--primary') + '" href="' + esc(href) + '">' +
                (full ? 'Väntelista' : 'Boka') +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return rows;
  }

  /* ---------- render full page ---------- */

  function renderCourse(main, course, allCourses, instances) {
    var slug = course.slug || '';
    var imgHtml = (PA.phImg ? PA.phImg(course.img, course.title).replace('ph-img', 'ph-photo') : '<span>' + esc(course.img || course.title) + '</span>');
    var priceUnit = course.price_unit ? ' <small>' + esc(course.price_unit) + '</small>' : '';
    var badge = course.category ? '<span class="badge badge--coral mb-16">' + esc(course.category) + '</span>' : '';
    var isOffert = !course.price_unit || course.price_label === 'Offert';
    var relatedHtml = buildRelated(allCourses, slug);

    main.innerHTML = [
      /* ---- hero / pagehead ---- */
      '<section class="pagehead" data-screen-label="Kursdetalj – Hero">',
        '<div class="container">',
          '<nav class="crumbs mb-24">',
            '<a href="index.html">Hem</a><span class="sep">/</span>',
            '<a href="utbildningar.html">Utbildningar</a><span class="sep">/</span>',
            '<span id="cd-crumb">' + esc(course.title) + '</span>',
          '</nav>',
          '<div class="course-layout">',
            '<div>',
              badge,
              '<h1 class="h1" style="margin:10px 0 16px" id="cd-title">' + esc(course.title) + '</h1>',
              (course.description
                ? '<p class="lead measure" id="cd-desc">' + esc(course.description) + '</p>'
                : ''),
              '<div class="ph ph--16x9 mt-24" style="border-radius:var(--r-lg)">' + imgHtml + '</div>',

              /* ---- vad ingår ---- */
              '<h2 class="h2 mt-48 mb-16" data-cms="kurs.includes.title">Vad ingår</h2>',
              '<ul class="learn-list">',
                '<li><span class="ck">✓</span> Undervisning av certifierad instruktör</li>',
                '<li><span class="ck">✓</span> Praktiska övningar och realistiska scenarier</li>',
                '<li><span class="ck">✓</span> Kompetensbevis enligt HLR-rådets standard</li>',
                '<li><span class="ck">✓</span> Kursmaterial ingår</li>',
                '<li><span class="ck">✓</span> Möjlighet till utbildning på er arbetsplats</li>',
              '</ul>',

              /* ---- praktisk information ---- */
              '<h2 class="h2 mt-48 mb-16" data-cms="kurs.info.title">Praktisk information</h2>',
              '<div class="infogrid">' + buildInfoGrid(course) + '</div>',

              /* ---- kommande tillfällen ---- */
              '<h2 class="h2 mt-48 mb-16" data-cms="kurs.dates.title">Kommande tillfällen</h2>',
              '<div id="cd-instances">' + buildInstances(instances, course.title) + '</div>',
            '</div>',

            /* ---- booking box (aside) ---- */
            '<aside class="bookbox">',
              '<div class="card"><div class="card__body">',
                '<div class="flex between center">',
                  '<span class="price-from" style="font-size:2rem">' + esc(course.price_label || 'Offert') + priceUnit + '</span>',
                  '<span class="badge badge--green"><span class="dot"></span>Bokningsbar</span>',
                '</div>',
                '<p class="muted" style="font-size:13.5px;margin-top:2px">' +
                  (isOffert ? 'Kontakta oss för pris' : (course.price_unit || '') + ' · inkl. moms') +
                '</p>',
                '<hr class="rule" style="margin:18px 0">',
                '<div class="grid" style="gap:10px;font-size:14.5px">',
                  (course.duration ? '<div class="flex between"><span class="muted">Längd</span><b>' + esc(course.duration) + '</b></div>' : ''),
                  (course.audience ? '<div class="flex between"><span class="muted">Målgrupp</span><b>' + esc(course.audience) + '</b></div>' : ''),
                  '<div class="flex between"><span class="muted">Kompetensbevis</span><b>Ingår</b></div>',
                '</div>',
                '<a class="btn btn--primary btn--block btn--lg" href="boka.html" style="margin-top:20px">Boka kurs</a>',
                '<a class="btn btn--outline btn--block" href="offert.html?course=' + esc(slug) + '" style="margin-top:10px">Begär offert (företag)</a>',
                '<p class="muted tac" style="font-size:13px;margin-top:14px">Eller ring <a class="tlink" href="tel:0293761011">0293-76 10 11</a></p>',
              '</div></div>',
              '<div class="callout mt-16"><span>💡</span><div>Boka 8+ deltagare? Företagspris och utbildning på plats – <a href="offert.html?course=' + esc(slug) + '" class="tlink">begär offert</a>.</div></div>',
            '</aside>',
          '</div>',
        '</div>',
      '</section>',

      /* ---- related ---- */
      (relatedHtml
        ? '<section class="section bg-cream2" data-screen-label="Kursdetalj – Relaterat">' +
            '<div class="container">' +
              '<div class="sec-head">' +
                '<div class="sec-head__txt">' +
                  '<span class="eyebrow" data-cms="kurs.related.eyebrow">Relaterade utbildningar</span>' +
                  '<h2 class="h2" style="margin-top:14px" data-cms="kurs.related.title">Fortsätt utvecklas</h2>' +
                '</div>' +
                '<a class="tlink" href="utbildningar.html">Alla utbildningar →</a>' +
              '</div>' +
              '<div class="grid cols-3">' + relatedHtml + '</div>' +
            '</div>' +
          '</section>'
        : ''),
    ].join('');

    /* update document title */
    document.title = esc(course.title) + ' – PulsAkademin';

    /* mobile action bar */
    var mob = document.getElementById('cd-mobile-bar');
    if (mob) {
      mob.innerHTML =
        '<div style="flex:1">' +
          '<span class="price-from">' + esc(course.price_label || 'Offert') + '</span>' +
          '<span class="muted" style="font-size:12px;display:block">' + esc(course.price_unit || '') + '</span>' +
        '</div>' +
        '<a class="btn btn--primary" href="boka.html" style="flex:1">Boka kurs</a>';
    }
  }

  /* ---------- boot ---------- */

  function boot() {
    if (!window.PA || !window.PA.db) {
      console.error('coursedetail: PA.db not found — check script load order');
      return;
    }

    var main = document.querySelector('main');
    if (!main) return;

    var slug = getSlug();
    if (!slug) {
      renderNotFound(main);
      return;
    }

    renderLoading(main);

    Promise.all([
      PA.db.getCourse(slug),
      PA.db.listCourses(),
      PA.db.listInstances(),
    ]).then(function (results) {
      var course    = results[0];
      var allCourses = results[1] || [];
      var instances = results[2] || [];

      if (!course) {
        renderNotFound(main);
        return;
      }

      renderCourse(main, course, allCourses, instances);
    }).catch(function (err) {
      console.error('coursedetail error:', err);
      renderError(main, err && err.message ? err.message : null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
