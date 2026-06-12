/* PulsAkademin — shop feature module
 * Used by: hjartstartare.html, webbshop.html, produkt.html
 * Depends on: PA.db, PA.Cart, PA.formatSEK (loaded before this file)
 */

/* ─────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────── */

PA.shop = PA.shop || {};

/** Build a product card HTML string. mode: 'full'(default)|'compact' */
PA.shop.prodCardHTML = function (p, mode) {
  const slug = p.slug || p.id;
  const priceStr = PA.formatSEK(p.price_incl_vat);
  const priceExStr = PA.formatSEK(p.price_excl_vat);
  const inStock = (p.stock_status || '').toLowerCase().includes('lager');
  const stockBadge = inStock
    ? '<span class="badge badge--green"><span class="dot"></span>' + (p.stock_status || 'I lager') + '</span>'
    : '<span class="badge badge--amber"><span class="dot"></span>' + (p.stock_status || 'Få kvar') + '</span>';
  const badgesHTML = (p.badges || []).map(function (b) {
    return '<span class="badge badge--coral">' + b + '</span>';
  }).join('');

  if (mode === 'compact') {
    // webbshop featured row — card is a link with add-to-cart inside
    return (
      '<div class="card prodcard card--hover" data-pid="' + slug + '">' +
        '<a href="produkt.html?p=' + slug + '">' +
          '<div class="ph"><div class="prodcard__badges">' + badgesHTML + '</div>' + PA.phImg(p.img, p.name) + '</div>' +
        '</a>' +
        '<div class="card__body">' +
          '<div class="prodcard__name">' + p.name + '</div>' +
          '<div class="prodcard__usp">' + (p.usp || '') + '</div>' +
          '<div class="flex between center mb-12"><span class="price"><b>' + priceStr + '</b></span>' + stockBadge + '</div>' +
          '<button class="btn btn--primary btn--block js-add-cart" data-pid="' + slug + '" data-name="' + _esc(p.name) + '" data-price="' + p.price_incl_vat + '" data-priceex="' + p.price_excl_vat + '" data-img="' + _esc(p.img || '') + '">Lägg i kundvagn</button>' +
          '<div class="shop-added" style="display:none;margin-top:8px"></div>' +
        '</div>' +
      '</div>'
    );
  }

  // full card for hjartstartare grid
  return (
    '<div class="card prodcard card--hover" data-pid="' + slug + '">' +
      '<a href="produkt.html?p=' + slug + '">' +
        '<div class="ph"><div class="prodcard__badges">' + badgesHTML + '</div>' + PA.phImg(p.img, p.name) + '</div>' +
      '</a>' +
      '<div class="card__body">' +
        '<div class="muted" style="font-size:12px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">' + (p.brand || '') + '</div>' +
        '<a href="produkt.html?p=' + slug + '"><div class="prodcard__name">' + p.name + '</div></a>' +
        '<div class="prodcard__usp">' + (p.usp || '') + '</div>' +
        '<div class="price mb-16"><b>' + priceStr + '</b><small>' + priceExStr + ' exkl. moms</small></div>' +
        '<div class="flex gap-8">' +
          '<button class="btn btn--primary js-add-cart" style="flex:1" data-pid="' + slug + '" data-name="' + _esc(p.name) + '" data-price="' + p.price_incl_vat + '" data-priceex="' + p.price_excl_vat + '" data-img="' + _esc(p.img || '') + '">Lägg i kundvagn</button>' +
          '<label class="chip js-compare-lbl" style="padding:10px;cursor:pointer">' +
            '<input type="checkbox" class="js-compare-chk" data-pid="' + slug + '" data-name="' + _esc(p.name) + '" data-price="' + priceStr + '" style="width:16px;height:16px;accent-color:var(--bordeaux-700)"> Jämför' +
          '</label>' +
        '</div>' +
        '<div class="shop-added" style="display:none;margin-top:8px"></div>' +
        '<a class="tlink" style="font-size:14px;margin-top:6px;display:inline-block" href="produkt.html?p=' + slug + '">Läs mer →</a>' +
      '</div>' +
    '</div>'
  );
};

function _esc(s) {
  return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Wire up all .js-add-cart buttons in a container. */
PA.shop.bindAddToCart = function (container) {
  container.addEventListener('click', function (e) {
    var btn = e.target.closest('.js-add-cart');
    if (!btn) return;
    e.preventDefault();
    var pid = btn.dataset.pid;
    var item = {
      id: pid,
      name: btn.dataset.name,
      sku: pid,
      priceInclVat: parseFloat(btn.dataset.price) || 0,
      priceExclVat: parseFloat(btn.dataset.priceex) || 0,
      img: btn.dataset.img,
    };
    PA.Cart.add(item, 1);
    // show inline confirmation near the button
    var card = btn.closest('[data-pid]');
    var msg = card && card.querySelector('.shop-added');
    if (msg) {
      msg.innerHTML = '✓ Tillagd – <a class="tlink" href="kundvagn.html">Gå till kundvagn</a>';
      msg.style.display = 'block';
      msg.style.color = 'var(--green)';
      msg.style.fontSize = '14px';
    }
    btn.textContent = '✓ Tillagd';
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = 'Lägg i kundvagn';
      btn.disabled = false;
    }, 3000);
  });
};

/* ─────────────────────────────────────────────
   COMPARE BAR
   ───────────────────────────────────────────── */
PA.shop.compare = (function () {
  var KEY = 'pa_compare';
  var MAX = 3;

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
    render();
  }
  function toggle(item) {
    var list = get();
    var idx = list.findIndex(function (x) { return x.pid === item.pid; });
    if (idx >= 0) { list.splice(idx, 1); }
    else if (list.length < MAX) { list.push(item); }
    save(list);
    return get();
  }
  function clear() { save([]); }

  function render() {
    var list = get();
    var bar = document.getElementById('compare-bar');
    if (!bar) return;
    // sync checkboxes
    document.querySelectorAll('.js-compare-chk').forEach(function (chk) {
      chk.checked = list.some(function (x) { return x.pid === chk.dataset.pid; });
    });
    if (list.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    var slots = document.getElementById('compare-slots');
    if (slots) {
      slots.innerHTML = list.map(function (x) {
        return '<span class="chip">' + x.name + ' <button class="js-cmp-remove" data-pid="' + x.pid + '" style="background:none;border:none;cursor:pointer;margin-left:4px;font-size:12px">✕</button></span>';
      }).join('');
    }
    var countEl = document.getElementById('compare-count');
    if (countEl) countEl.textContent = list.length;
  }

  function showTable() {
    var list = get();
    if (list.length < 2) { alert('Välj minst 2 produkter för att jämföra.'); return; }
    var modal = document.getElementById('compare-modal');
    if (!modal) return;
    // build rows from stored data
    var rows = ['Pris'];
    var html = '<table style="width:100%;border-collapse:collapse;font-size:14px">';
    html += '<thead><tr><th style="text-align:left;padding:8px 12px;color:var(--muted)">Egenskap</th>';
    list.forEach(function (x) {
      html += '<th style="text-align:left;padding:8px 12px">' + x.name + '</th>';
    });
    html += '</tr></thead><tbody>';
    html += '<tr><td style="padding:8px 12px;color:var(--muted);border-top:1px solid var(--line)">Pris</td>';
    list.forEach(function (x) {
      html += '<td style="padding:8px 12px;border-top:1px solid var(--line);font-weight:700">' + (x.price || '–') + '</td>';
    });
    html += '</tr></tbody></table>';
    modal.querySelector('.compare-modal__body').innerHTML = html;
    modal.style.display = 'flex';
  }

  return { get: get, toggle: toggle, clear: clear, render: render, showTable: showTable };
})();

/* ─────────────────────────────────────────────
   CATEGORY PAGE (hjartstartare.html — generic, driven by ?cat=)
   ───────────────────────────────────────────── */
PA.shop.initHjartstartare = function () {
  var CAT_LABELS = {
    hjartstartare: 'Hjärtstartare',
    batterier: 'Batterier till hjärtstartare',
    elektroder: 'Elektroder',
    skap: 'Skåp & väggfästen',
    vaskor: 'Väskor',
    paket: 'Paketlösningar',
  };
  var ALL_CATS = ['hjartstartare', 'batterier', 'elektroder', 'skap', 'vaskor'];

  var params = new URLSearchParams(window.location.search);
  var activeCat = params.get('cat') || 'hjartstartare';
  var catLabel = CAT_LABELS[activeCat] || activeCat;

  // Update page title and hero text
  document.title = catLabel + ' – köp online | PulsAkademin';
  var crumbCat = document.getElementById('crumb-cat');
  if (crumbCat) crumbCat.textContent = catLabel;

  var heroEyebrow = document.querySelector('[data-cms="hjartstartare.hero.eyebrow"]');
  var heroTitle = document.querySelector('[data-cms="hjartstartare.hero.title"]');
  var heroLead = document.querySelector('[data-cms="hjartstartare.hero.lead"]');

  var titleMap = {
    hjartstartare: 'Rätt hjärtstartare för er miljö',
    batterier: 'Batterier till hjärtstartare',
    elektroder: 'Elektroder & defibrillationsplattor',
    skap: 'Skåp & väggfästen för hjärtstartare',
    vaskor: 'Väskor & transportväskor',
    paket: 'Kompletta paketlösningar',
  };
  var leadMap = {
    hjartstartare: 'Välj hjärtstartare för arbetsplats, skola, förening eller offentlig miljö. Osäker? Använd vår guide eller få rådgivning.',
    batterier: 'Håll din hjärtstartare redo med rätt batteri. Vi erbjuder batterier till de flesta modeller på marknaden.',
    elektroder: 'Elektroder för vuxna och barn till de vanligaste hjärtstartarna. Vi skickar påminnelse när det är dags att byta.',
    skap: 'Skydda och exponera din hjärtstartare med rätt skåp eller väggfäste – för inomhus och utomhus.',
    vaskor: 'Transportväskor och ryggsäckar för säker förvaring och snabb tillgång till hjärtstartaren.',
    paket: 'Allt-i-ett-lösningar med hjärtstartare, skåp, elektroder och utbildning. Vi sätter ihop paketet åt er.',
  };

  if (heroEyebrow) heroEyebrow.textContent = catLabel;
  if (heroTitle) heroTitle.textContent = titleMap[activeCat] || catLabel;
  if (heroLead) heroLead.textContent = leadMap[activeCat] || '';

  // Category quick-chips
  var chipsEl = document.getElementById('cat-chips');
  if (chipsEl) {
    chipsEl.innerHTML = ALL_CATS.map(function (slug) {
      var lbl = CAT_LABELS[slug] || slug;
      var isActive = slug === activeCat;
      return '<a class="chip' + (isActive ? ' active' : '') + '" href="hjartstartare.html?cat=' + slug + '">' + lbl + '</a>';
    }).join('');
    chipsEl.style.display = 'flex';
  }

  var grid = document.getElementById('prodCat');
  var countEl = document.getElementById('pcount');
  var sortSel = document.querySelector('.select');
  var searchBox = document.getElementById('prod-search');
  var inStockChk = document.getElementById('filter-instock');
  var clearBtn = document.getElementById('clear-filters');
  var compareModal = document.getElementById('compare-modal');
  var brandFilterList = document.getElementById('brand-filter-list');

  // brand checkboxes — rebuilt dynamically after first load
  var brandChks = [];

  function rebuildBrandFilter(products) {
    if (!brandFilterList) return;
    var brands = [];
    products.forEach(function (p) {
      if (p.brand && brands.indexOf(p.brand) === -1) brands.push(p.brand);
    });
    brands.sort();
    if (brands.length === 0) {
      brandFilterList.innerHTML = '<span class="muted" style="font-size:13px">Inga varumärken</span>';
      brandChks = [];
      return;
    }
    brandFilterList.innerHTML = brands.map(function (b) {
      return '<label class="fopt"><input type="checkbox" class="js-brand-chk" value="' + _esc(b) + '"> ' + b + '</label>';
    }).join('');
    brandChks = Array.from(brandFilterList.querySelectorAll('.js-brand-chk'));
    brandChks.forEach(function (chk) { chk.addEventListener('change', loadAndRender); });
  }

  function currentOpts() {
    var brands = [];
    brandChks.forEach(function (chk) { if (chk.checked) brands.push(chk.value); });
    var sortVal = sortSel ? sortSel.value : '';
    var sort = sortVal === 'price-asc' ? 'price-asc' : sortVal === 'price-desc' ? 'price-desc' : '';
    return {
      inStock: inStockChk ? inStockChk.checked : false,
      q: searchBox ? searchBox.value.trim() : '',
      sort: sort,
      brands: brands,
    };
  }

  function renderLoading() {
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">Laddar produkter…</div>';
  }

  function renderEmpty() {
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)"><p>Inga produkter matchade din sökning.</p><button class="btn btn--outline mt-16" id="reset-empty">Rensa filter</button></div>';
    var rb = document.getElementById('reset-empty');
    if (rb) rb.addEventListener('click', resetFilters);
  }

  var brandsBuilt = false;

  async function loadAndRender() {
    renderLoading();
    var opts = currentOpts();
    var products;
    try {
      // Always filter by active category (omitting category returns ALL)
      var fetchOpts = {
        category: activeCat,
        inStock: opts.inStock,
        q: opts.q,
        sort: opts.sort,
      };
      var raw = await PA.db.listProducts(fetchOpts);

      // Build brand filter from the full unfiltered set once
      if (!brandsBuilt) {
        rebuildBrandFilter(raw);
        brandsBuilt = true;
      }

      // Apply multi-brand filter locally
      if (opts.brands && opts.brands.length > 0) {
        products = raw.filter(function (p) { return opts.brands.indexOf(p.brand) !== -1; });
      } else {
        products = raw;
      }
    } catch (err) {
      if (grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">Kunde inte ladda produkter.</div>';
      return;
    }

    if (!products || products.length === 0) { renderEmpty(); if (countEl) countEl.textContent = '0'; return; }
    if (countEl) countEl.textContent = products.length;
    grid.innerHTML = products.map(function (p) { return PA.shop.prodCardHTML(p, 'full'); }).join('');
    PA.shop.bindAddToCart(grid);

    // bind compare checkboxes
    grid.querySelectorAll('.js-compare-chk').forEach(function (chk) {
      var list = PA.shop.compare.get();
      chk.checked = list.some(function (x) { return x.pid === chk.dataset.pid; });
      chk.addEventListener('change', function () {
        var result = PA.shop.compare.toggle({ pid: chk.dataset.pid, name: chk.dataset.name, price: chk.dataset.price });
        if (chk.checked && result.length >= 3) {
          grid.querySelectorAll('.js-compare-chk:not(:checked)').forEach(function (c) { c.disabled = true; });
        } else {
          grid.querySelectorAll('.js-compare-chk').forEach(function (c) { c.disabled = false; });
        }
      });
    });

    PA.shop.compare.render();
  }

  function resetFilters() {
    brandChks.forEach(function (chk) { chk.checked = false; });
    if (inStockChk) inStockChk.checked = false;
    if (searchBox) searchBox.value = '';
    if (sortSel) sortSel.value = 'recommended';
    loadAndRender();
  }

  // event bindings
  if (inStockChk) inStockChk.addEventListener('change', loadAndRender);
  if (searchBox) searchBox.addEventListener('input', debounce(loadAndRender, 300));
  if (sortSel) sortSel.addEventListener('change', loadAndRender);
  if (clearBtn) clearBtn.addEventListener('click', resetFilters);

  // compare bar events (delegated)
  var bar = document.getElementById('compare-bar');
  if (bar) {
    bar.addEventListener('click', function (e) {
      var rem = e.target.closest('.js-cmp-remove');
      if (rem) { PA.shop.compare.toggle({ pid: rem.dataset.pid, name: '', price: '' }); loadAndRender(); return; }
      if (e.target.closest('#compare-bar-btn2')) { PA.shop.compare.showTable(); }
    });
  }

  // modal close
  if (compareModal) {
    compareModal.addEventListener('click', function (e) {
      if (e.target === compareModal || e.target.closest('.js-modal-close')) {
        compareModal.style.display = 'none';
      }
    });
    var clearCmpBtn = compareModal.querySelector('.js-compare-clear');
    if (clearCmpBtn) clearCmpBtn.addEventListener('click', function () {
      PA.shop.compare.clear(); compareModal.style.display = 'none'; loadAndRender();
    });
  }

  // update compare button in header
  document.addEventListener('pa:compare', function () { PA.shop.compare.render(); });

  loadAndRender();
};

/* ─────────────────────────────────────────────
   WEBBSHOP PAGE
   ───────────────────────────────────────────── */
PA.shop.initWebbshop = function () {
  var grid = document.getElementById('shopProds');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column:1/-1;padding:32px;text-align:center;color:var(--muted)">Laddar…</div>';

  PA.db.listProducts({ category: 'hjartstartare' }).then(function (products) {
    var featured = products.slice(0, 4);
    if (!featured.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = featured.map(function (p) { return PA.shop.prodCardHTML(p, 'compact'); }).join('');
    PA.shop.bindAddToCart(grid);
  }).catch(function () {
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted)">Kunde inte ladda produkter.</div>';
  });
};

/** Update live product counts on the category cards in webbshop.html */
PA.shop.initWebbshopCounts = function () {
  var countEls = document.querySelectorAll('.js-catcount');
  if (!countEls.length) return;

  PA.db.listProducts({}).then(function (all) {
    // Tally per category slug
    var counts = {};
    all.forEach(function (p) {
      var slug = p.category && p.category.slug ? p.category.slug : null;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    countEls.forEach(function (el) {
      var cat = el.dataset.cat;
      var n = counts[cat] || 0;
      el.textContent = n > 0 ? n + ' →' : '→';
    });
  }).catch(function () {
    // silently leave arrows as-is if backend is unavailable
  });
};

/* ─────────────────────────────────────────────
   PRODUKT (PDP) PAGE
   ───────────────────────────────────────────── */
PA.shop.initProdukt = function () {
  var slug = new URLSearchParams(window.location.search).get('p');
  var wrap = document.getElementById('pdp-wrap');
  var crossGrid = document.getElementById('crossGrid');
  var mobileBar = document.getElementById('pdp-mobile-bar');

  if (!wrap) return;

  wrap.innerHTML = '<div style="padding:60px;text-align:center;color:var(--muted)">Laddar produkt…</div>';

  PA.db.getProduct(slug || '').then(function (p) {
    if (!p) {
      wrap.innerHTML = '<div style="padding:60px;text-align:center"><p class="lead">Produkten hittades inte.</p><a class="btn btn--outline mt-16" href="hjartstartare.html">Tillbaka till hjärtstartare</a></div>';
      return;
    }

    var inStock = (p.stock_status || '').toLowerCase().includes('lager');
    var stockBadge = inStock
      ? '<span class="badge badge--green"><span class="dot"></span>' + (p.stock_status || 'I lager') + '</span>'
      : '<span class="badge badge--amber"><span class="dot"></span>' + (p.stock_status || 'Kontakta oss') + '</span>';

    var uspLines = (p.usp || '').split('·').map(function (s) { return s.trim(); }).filter(Boolean);
    var uspHTML = uspLines.map(function (u) {
      return '<li><span style="color:var(--green)">✓</span> ' + u + '</li>';
    }).join('');

    var badgesHTML = (p.badges || []).map(function (b) {
      return '<span class="badge badge--coral">' + b + '</span>';
    }).join('');

    // update page title and breadcrumb
    document.title = p.name + ' | PulsAkademin';
    var crumbName = document.getElementById('crumb-name');
    if (crumbName) crumbName.textContent = p.name;
    var crumbCatLink = document.getElementById('crumb-cat-link');
    if (crumbCatLink && p.category && p.category.slug) {
      var CAT_LABELS_PDP = {
        hjartstartare: 'Hjärtstartare', batterier: 'Batterier till hjärtstartare',
        elektroder: 'Elektroder', skap: 'Skåp & väggfästen', vaskor: 'Väskor', paket: 'Paketlösningar',
      };
      crumbCatLink.href = 'hjartstartare.html?cat=' + p.category.slug;
      crumbCatLink.textContent = CAT_LABELS_PDP[p.category.slug] || p.category.name || 'Produkter';
    }

    // Render description as readable paragraphs
    var descHTML = (function () {
      var raw = (p.description || p.usp || p.name).trim();
      // Split on double newline first, then group sentences ~2-3 at a time
      var parts = raw.split(/\n{2,}/);
      if (parts.length > 1) {
        return parts.map(function (chunk) { return '<p>' + chunk.trim() + '</p>'; }).join('');
      }
      // Single block: split on sentence endings and group into chunks of 2-3
      var sentences = raw.match(/[^.!?]+[.!?]+["']?/g) || [raw];
      var paras = [];
      for (var i = 0; i < sentences.length; i += 2) {
        var chunk = sentences.slice(i, i + 2).join(' ').trim();
        if (chunk) paras.push('<p>' + chunk + '</p>');
      }
      return paras.length ? paras.join('') : '<p>' + raw + '</p>';
    })();

    // Category label for spec table
    var catName = (p.category && p.category.name) ? p.category.name : '';

    wrap.innerHTML =
      '<div class="gallery">' +
        '<div class="thumbs" id="pdp-thumbs">' +
          '<div class="ph sel js-thumb" data-idx="0">' + PA.phImg(p.img, p.name) + '</div>' +
        '</div>' +
        '<div class="main"><div class="ph" id="pdp-main-img">' + PA.phImg(p.img, p.name) + '</div></div>' +
      '</div>' +

      '<div class="tabs mt-48" id="pdp-tabs">' +
        '<button class="on" data-tab="desc">Beskrivning</button>' +
        '<button data-tab="spec">Specifikationer</button>' +
        '<button data-tab="includes">Detta ingår</button>' +
        '<button data-tab="shipping">Frakt & retur</button>' +
      '</div>' +

      '<div class="mt-24" style="max-width:62ch">' +
        '<div id="tab-desc">' +
          descHTML +
          (uspLines.length ? '<ul class="usp mt-24" style="font-size:14.5px">' + uspHTML + '</ul>' : '') +
        '</div>' +
        '<div id="tab-spec" style="display:none">' +
          '<h3 class="h3 mb-16">Specifikationer</h3>' +
          '<table class="spec-table" style="width:100%">' +
            '<tr><td>Varumärke</td><td>' + (p.brand || '–') + '</td></tr>' +
            (catName ? '<tr><td>Kategori</td><td>' + catName + '</td></tr>' : '') +
            '<tr><td>Artikelnr</td><td>' + (p.id || p.slug || '–') + '</td></tr>' +
            '<tr><td>Lagerstatus</td><td>' + (p.stock_status || '–') + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div id="tab-includes" style="display:none">' +
          '<ul style="margin-top:8px;display:grid;gap:8px;font-size:15px">' +
            '<li>✓ ' + p.name + '</li>' +
            '<li>✓ Bruksanvisning på svenska</li>' +
            '<li>✓ Elektroder (vuxna)</li>' +
          '</ul>' +
        '</div>' +
        '<div id="tab-shipping" style="display:none">' +
          '<p>Fri frakt vid köp. Leverans 1–3 arbetsdagar med DHL eller PostNord.</p>' +
          '<p style="margin-top:12px">14 dagars öppet köp för ej använd produkt i originalförpackning.</p>' +
        '</div>' +
      '</div>';

    // buy box
    var buyBox = document.getElementById('pdp-buybox');
    if (buyBox) {
      buyBox.innerHTML =
        '<div class="card"><div class="card__body">' +
          '<div class="muted" style="font-size:12px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em">' + (p.brand || '') + '</div>' +
          '<h1 class="h3" style="margin:4px 0 10px">' + p.name + '</h1>' +
          '<div style="margin-bottom:12px">' + badgesHTML + '</div>' +
          '<ul class="usp mb-16" style="font-size:14.5px">' + uspHTML + '</ul>' +
          '<hr class="rule" style="margin:16px 0">' +
          '<div class="flex between center">' +
            '<span class="price-from" style="font-size:2.1rem">' + PA.formatSEK(p.price_incl_vat) + '</span>' +
            stockBadge +
          '</div>' +
          '<p class="muted" style="font-size:13.5px">' + PA.formatSEK(p.price_excl_vat) + ' exkl. moms · fri frakt</p>' +
          '<div class="flex gap-8 mt-16">' +
            '<div class="flex center" style="border:1.5px solid var(--line-strong);border-radius:var(--r-sm);overflow:hidden">' +
              '<button class="icon-btn" id="qty-minus" style="width:42px;border-radius:0">−</button>' +
              '<span id="qty-val" style="padding:0 14px;font-weight:600">1</span>' +
              '<button class="icon-btn" id="qty-plus" style="width:42px;border-radius:0">+</button>' +
            '</div>' +
            '<button class="btn btn--primary" id="pdp-add-btn" style="flex:1">Lägg i kundvagn</button>' +
          '</div>' +
          '<div id="pdp-added" style="display:none;margin-top:10px;color:var(--green);font-size:14px"></div>' +
          '<div class="grid" style="gap:8px;margin-top:10px">' +
            '<a class="btn btn--dark btn--block" href="kassa.html">Köp nu</a>' +
            '<a class="btn btn--outline btn--block" href="offert.html">Företag? Begär offert</a>' +
          '</div>' +
          '<ul style="margin-top:18px;font-size:13.5px;color:var(--muted);display:grid;gap:8px">' +
            '<li>🚚 Leverans 1–3 arbetsdagar</li>' +
            '<li>🧾 Faktura för företag (30 dagar)</li>' +
            '<li>↩️ 14 dagars öppet köp</li>' +
          '</ul>' +
        '</div></div>';

      // qty stepper
      var qtyVal = document.getElementById('qty-val');
      var qty = 1;
      document.getElementById('qty-minus').addEventListener('click', function () {
        if (qty > 1) { qty--; qtyVal.textContent = qty; }
      });
      document.getElementById('qty-plus').addEventListener('click', function () {
        qty++; qtyVal.textContent = qty;
      });

      // add to cart
      document.getElementById('pdp-add-btn').addEventListener('click', function () {
        PA.Cart.add({
          id: p.slug || p.id,
          name: p.name,
          sku: p.id || p.slug,
          priceInclVat: p.price_incl_vat,
          priceExclVat: p.price_excl_vat,
          img: p.img || '',
        }, qty);
        var addedMsg = document.getElementById('pdp-added');
        addedMsg.innerHTML = '✓ Tillagd – <a class="tlink" href="kundvagn.html">Gå till kundvagn</a>';
        addedMsg.style.display = 'block';
        var btn = document.getElementById('pdp-add-btn');
        btn.textContent = '✓ Tillagd';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = 'Lägg i kundvagn';
          btn.disabled = false;
        }, 3000);

        // sync mobile bar
        if (mobileBar) {
          var mBarBtn = mobileBar.querySelector('.js-mob-add');
          if (mBarBtn) { mBarBtn.textContent = '✓ Tillagd'; mBarBtn.disabled = true; setTimeout(function () { mBarBtn.textContent = 'Lägg i kundvagn'; mBarBtn.disabled = false; }, 3000); }
        }
      });
    }

    // update mobile bar price
    if (mobileBar) {
      var priceSpan = mobileBar.querySelector('.price-from');
      if (priceSpan) priceSpan.textContent = PA.formatSEK(p.price_incl_vat);
      var mobAddBtn = mobileBar.querySelector('.js-mob-add');
      if (mobAddBtn) {
        mobAddBtn.addEventListener('click', function () {
          document.getElementById('pdp-add-btn') && document.getElementById('pdp-add-btn').click();
        });
      }
    }

    // tab switching
    var tabBtns = document.querySelectorAll('#pdp-tabs button');
    var tabPanels = { desc: 'tab-desc', spec: 'tab-spec', includes: 'tab-includes', shipping: 'tab-shipping' };
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        Object.values(tabPanels).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        var active = tabPanels[btn.dataset.tab];
        if (active) { var el = document.getElementById(active); if (el) el.style.display = ''; }
      });
    });

    // thumbnail switching
    var thumbs = document.querySelectorAll('.js-thumb');
    var mainImg = document.getElementById('pdp-main-img');
    thumbs.forEach(function (th) {
      th.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('sel'); });
        th.classList.add('sel');
        if (mainImg) mainImg.querySelector('span').textContent = th.querySelector('span').textContent;
      });
    });

    // cross-sell: prefer same-category products
    if (crossGrid) {
      var thisCatSlug = (p.category && p.category.slug) ? p.category.slug : null;
      var crossFetch = thisCatSlug
        ? PA.db.listProducts({ category: thisCatSlug })
        : PA.db.listProducts({});
      crossFetch.then(function (all) {
        var others = all.filter(function (x) { return (x.slug || x.id) !== (p.slug || p.id); }).slice(0, 4);
        // If same-category yields fewer than 2, fall back to all products
        if (others.length < 2 && thisCatSlug) {
          return PA.db.listProducts({}).then(function (allFallback) {
            var fb = allFallback.filter(function (x) { return (x.slug || x.id) !== (p.slug || p.id); }).slice(0, 4);
            if (!fb.length) { var sec = crossGrid.closest('section'); if (sec) sec.style.display = 'none'; return; }
            crossGrid.innerHTML = fb.map(function (x) { return PA.shop.prodCardHTML(x, 'compact'); }).join('');
            PA.shop.bindAddToCart(crossGrid);
          });
        }
        if (!others.length) { var sec = crossGrid.closest('section'); if (sec) sec.style.display = 'none'; return; }
        crossGrid.innerHTML = others.map(function (x) { return PA.shop.prodCardHTML(x, 'compact'); }).join('');
        PA.shop.bindAddToCart(crossGrid);
      }).catch(function () {});
    }

  }).catch(function () {
    wrap.innerHTML = '<div style="padding:60px;text-align:center;color:var(--muted)">Produkten kunde inte laddas.</div>';
  });
};

/* ─────────────────────────────────────────────
   Utility
   ───────────────────────────────────────────── */
function debounce(fn, ms) {
  var t;
  return function () {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}
