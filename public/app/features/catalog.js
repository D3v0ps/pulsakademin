/* PulsAkademin — Catalogue feature
 * Renders courses on utbildningar.html and price rows on prislista.html.
 * Reads via PA.db.listCourses() with automatic demo-data fallback.
 * No toasts. No external dependencies beyond PA.db.
 */
(function () {
  'use strict';

  /* ---- helpers ---- */
  function cardLink(course) {
    return course.slug === 'hlr-vuxen' ? 'kurs-hlr-vuxen.html' : 'utbildningar.html#' + course.slug;
  }

  function normalise(s) {
    return (s || '').toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o');
  }

  function matchesFilter(course, targetValue, field) {
    if (!targetValue) return true;
    var v = normalise(targetValue);
    if (field === 'audience') {
      var aud = normalise(course.audience || '');
      if (aud === 'alla') return true;
      return aud.indexOf(v) !== -1;
    }
    if (field === 'category') {
      return normalise(course.category || '').indexOf(v) !== -1;
    }
    return true; // format / plats: no-op filter (data doesn't carry these)
  }

  function buildCard(course) {
    var link = cardLink(course);
    var priceUnit = course.price_unit ? '<small> ' + course.price_unit + '</small>' : '';
    var badge = course.category ? '<span class="badge badge--coral">' + course.category + '</span>' : '';
    return (
      '<div class="card card--hover catalog-card" id="c-' + course.slug + '" style="display:flex;flex-direction:column">' +
        '<div class="ph ph--16x9" aria-hidden="true">' + (PA.phImg ? PA.phImg(course.img, course.title).replace('ph-img', 'ph-photo') : '<span>' + (course.img || 'Bild: ' + course.title) + '</span>') + '</div>' +
        '<div class="card__body" style="display:flex;flex-direction:column;flex:1">' +
          '<div class="coursecard__top">' +
            '<h3 class="h3" style="font-size:1.15rem">' + course.title + '</h3>' +
            badge +
          '</div>' +
          '<p class="muted" style="margin-top:10px;font-size:14.5px;flex:1">' + (course.description || '') + '</p>' +
          '<div class="coursecard__meta" style="margin-top:14px">' +
            '<span>⏱ <b>' + (course.duration || '') + '</b></span>' +
            '<span>👥 <b>' + (course.audience || '') + '</b></span>' +
            '<span>📜 Kompetensbevis</span>' +
          '</div>' +
          '<div class="price-row" style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">' +
            '<span class="price-from">' + (course.price_label || '') + priceUnit + '</span>' +
            '<div class="flex gap-8">' +
              '<a class="btn btn--outline btn--sm" href="' + link + '">Läs mer</a>' +
              (course.price_label === 'Offert' || !course.price_unit
                ? '<a class="btn btn--bordeaux btn--sm" href="offert.html">Begär offert</a>'
                : '<a class="btn btn--bordeaux btn--sm" href="boka.html">Boka</a>') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderEmpty(grid) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;padding:48px 0;text-align:center">' +
        '<p style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Inga utbildningar matchar filtren</p>' +
        '<p class="muted">Prova att ändra eller rensa filtren ovan.</p>' +
      '</div>';
  }

  /* ---- catalogue page (utbildningar.html) ---- */
  function initCatalogue() {
    var grid = document.getElementById('catGrid');
    if (!grid) return;

    var countEl = document.getElementById('ccount');
    var selects = document.querySelectorAll('.select');
    // selects: [0]=Målgrupp [1]=Kategori [2]=Format [3]=Plats
    var selAud  = selects[0] || null;
    var selCat  = selects[1] || null;
    var selFmt  = selects[2] || null;
    var selPla  = selects[3] || null;

    var allCourses = [];

    function getVal(el) {
      if (!el) return '';
      var v = el.value || '';
      // "Målgrupp: alla" → empty means no filter
      if (v.indexOf(':') !== -1) return ''; // default "Xxx: alla" option
      return v;
    }

    function applyFilters() {
      var aud = getVal(selAud);
      var cat = getVal(selCat);
      // Format and Plats have no matching data fields → treat as no-op but still interactive
      var filtered = allCourses.filter(function (c) {
        return matchesFilter(c, aud, 'audience') && matchesFilter(c, cat, 'category');
      });
      if (filtered.length === 0) {
        renderEmpty(grid);
      } else {
        grid.innerHTML = filtered.map(buildCard).join('');
      }
      if (countEl) countEl.textContent = filtered.length;
    }

    PA.db.listCourses().then(function (courses) {
      allCourses = courses;
      applyFilters();
      if (selAud) selAud.addEventListener('change', applyFilters);
      if (selCat) selCat.addEventListener('change', applyFilters);
      if (selFmt) selFmt.addEventListener('change', applyFilters);
      if (selPla) selPla.addEventListener('change', applyFilters);
    }).catch(function (err) {
      console.error('PA catalog error:', err);
      grid.innerHTML =
        '<div style="grid-column:1/-1;padding:48px 0;text-align:center">' +
          '<p class="muted">Kunde inte ladda utbildningar. Försök ladda om sidan.</p>' +
        '</div>';
    });
  }

  /* ---- price list page (prislista.html) ---- */
  function initPriceList() {
    var privList = document.getElementById('pricePrivList');
    var bizEl    = document.getElementById('priceBizFrom');
    var shlrList = document.getElementById('priceShlrList');
    if (!privList && !bizEl && !shlrList) return;

    PA.db.listCourses().then(function (courses) {

      /* ---- Privatpersoner: open-seat courses (audience "Alla", priceUnit "/person") ---- */
      if (privList) {
        var privCourses = courses.filter(function (c) {
          return c.price_unit && c.price_unit.indexOf('/person') !== -1;
        });
        if (privCourses.length) {
          privList.innerHTML = privCourses.map(function (c) {
            return (
              '<li>' +
                '<span class="ck">✓</span> ' + c.title +
                ' — <b style="margin-left:auto">' + c.price_label + ' inkl. moms</b>' +
              '</li>'
            );
          }).join('') +
          '<li><span class="ck">✓</span> Kompetensbevis ingår</li>';
        }
      }

      /* ---- Företag: lowest group price from first qualifying course ---- */
      if (bizEl) {
        var bizCourses = courses.filter(function (c) {
          return (c.audience || '').toLowerCase().indexOf('företag') !== -1 ||
                 (c.audience || '').toLowerCase() === 'alla';
        });
        // keep existing static HTML (4 900 kr default) unless we have real data
        // This element just shows the "från" price — the current static copy is fine.
        // We do nothing (static copy is intentional design).
      }

      /* ---- Sjukvård: S-HLR courses ---- */
      if (shlrList) {
        var shlrCourses = courses.filter(function (c) {
          return (c.category || '').toLowerCase().indexOf('s-hlr') !== -1 ||
                 (c.audience || '').toLowerCase().indexOf('vård') !== -1;
        });
        if (shlrCourses.length) {
          shlrList.innerHTML = shlrCourses.map(function (c) {
            return (
              '<li>' +
                '<span class="ck">✓</span> ' + c.title +
                ' — <b style="margin-left:auto">' + (c.price_label || 'Offert') + '</b>' +
              '</li>'
            );
          }).join('') +
          '<li><span class="ck">✓</span> Teamträning &amp; scenarier</li>' +
          '<li><span class="ck">✓</span> Enligt HLR-rådets riktlinjer</li>';
        }
      }

      /* ---- VAT toggle ---- */
      initVatToggle(courses);

    }).catch(function (err) {
      console.error('PA prislista error:', err);
    });
  }

  /* ---- VAT toggle: inkl. / exkl. moms ---- */
  function initVatToggle(courses) {
    var toggle = document.querySelector('.toggle');
    if (!toggle) return;
    var btns = toggle.querySelectorAll('button');
    if (btns.length < 2) return;

    var inclMoms = true;

    function updatePrices() {
      // Update all price cells that show /person prices
      var items = document.querySelectorAll('[data-price-incl]');
      items.forEach(function (el) {
        var incl = parseFloat(el.getAttribute('data-price-incl')) || 0;
        var excl = parseFloat(el.getAttribute('data-price-excl')) || 0;
        el.textContent = inclMoms ? incl + ' kr' : excl + ' kr';
      });
    }

    btns[0].addEventListener('click', function () {
      inclMoms = true;
      btns[0].classList.add('on');
      btns[1].classList.remove('on');
      updatePrices();
    });
    btns[1].addEventListener('click', function () {
      inclMoms = false;
      btns[1].classList.add('on');
      btns[0].classList.remove('on');
      updatePrices();
    });

    // Annotate private list items with data attributes for toggling
    if (courses) {
      var privList = document.getElementById('pricePrivList');
      if (privList) {
        var privCourses = courses.filter(function (c) {
          return c.price_unit && c.price_unit.indexOf('/person') !== -1;
        });
        var items = privList.querySelectorAll('li');
        var ci = 0;
        items.forEach(function (li) {
          if (ci >= privCourses.length) return;
          var c = privCourses[ci];
          var inclNum = parseFloat((c.price_label || '').replace(/[^\d]/g, '')) || 0;
          if (!inclNum) return; // "Offert" rows — skip
          var exclNum = Math.round(inclNum / 1.25);
          var b = li.querySelector('b');
          if (b) {
            b.setAttribute('data-price-incl', inclNum);
            b.setAttribute('data-price-excl', exclNum);
          }
          ci++;
        });
      }
    }
  }

  /* ---- entry point ---- */
  function init() {
    // Guard: PA.db must exist
    if (!window.PA || !window.PA.db) {
      console.error('PA.db not found — check script load order');
      return;
    }
    initCatalogue();
    initPriceList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
