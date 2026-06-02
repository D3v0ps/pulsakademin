/* PulsAkademin — booking feature logic
 * Used by: boka.html, boka-flode.html, kurs-hlr-vuxen.html
 * DO NOT import/modify shared files (site.js, styles.css, db.js, etc.)
 */
(function () {
  'use strict';

  /* ---- util ---- */
  function fmtDate(inst) {
    // Real Supabase row has start_at/end_at ISO strings
    if (inst.start_at) {
      const d = new Date(inst.start_at);
      const datePart = d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
      let timePart = d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      if (inst.end_at) {
        const e = new Date(inst.end_at);
        timePart += '–' + e.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      }
      return { date: datePart, time: timePart };
    }
    // Demo fallback rows use date_label / time_label
    return { date: inst.date_label || '', time: inst.time_label || '' };
  }

  function seatBadge(seats) {
    if (seats === 0) return ['badge--danger', 'Fullbokad'];
    if (seats <= 4)  return ['badge--amber', seats + ' platser kvar'];
    return ['badge--green', 'Platser kvar'];
  }

  function courseTitle(inst) {
    // Supabase join: inst.course.title  Demo: inst.course_title
    return (inst.course && inst.course.title) || inst.course_title || '';
  }

  function priceLabel(inst) {
    return inst.price_label || '';
  }

  /* ================================================================
   * boka.html — render course list + city filter chips
   * ================================================================ */
  function initBokaList() {
    const list   = document.getElementById('bookList');
    const dcount = document.getElementById('dcount');
    if (!list) return;

    const params      = new URLSearchParams(location.search);
    let   activeCity  = params.get('city') || 'Alla städer';

    // Build chip bar from known cities
    const CITIES = ['Alla städer', 'Stockholm', 'Uppsala', 'Tierp & Gävle', 'Göteborg'];
    const chipBar = document.getElementById('cityChips');
    if (chipBar) {
      chipBar.innerHTML = CITIES.map(c =>
        `<button class="chip${c === activeCity ? ' chip--active' : ''}" data-city="${c}">${c}</button>`
      ).join('');
      chipBar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-city]');
        if (!btn) return;
        activeCity = btn.dataset.city;
        chipBar.querySelectorAll('[data-city]').forEach(b => b.classList.toggle('chip--active', b === btn));
        loadList();
      });
    }

    // Sidebar select filter
    const citySelect = document.getElementById('filterCity');
    if (citySelect) {
      citySelect.value = activeCity;
      citySelect.addEventListener('change', () => {
        activeCity = citySelect.value;
        if (chipBar) chipBar.querySelectorAll('[data-city]').forEach(b =>
          b.classList.toggle('chip--active', b.dataset.city === activeCity));
        loadList();
      });
    }

    async function loadList() {
      list.innerHTML = '<div class="muted" style="padding:32px 0;text-align:center">Hämtar tillfällen…</div>';
      let opts = {};
      if (activeCity && activeCity !== 'Alla städer') {
        // "Tierp & Gävle" is handled inside db.js listInstances
        opts.city = activeCity;
      }
      const instances = await PA.db.listInstances(opts);
      dcount && (dcount.textContent = instances.length);
      if (!instances.length) {
        list.innerHTML = '<p class="muted" style="padding:32px 0">Inga tillfällen hittades för valt filter.</p>';
        return;
      }
      list.innerHTML = instances.map(inst => renderRow(inst)).join('');
    }

    function renderRow(inst) {
      const title   = courseTitle(inst);
      const { date, time } = fmtDate(inst);
      const price   = priceLabel(inst);
      const seats   = inst.seats_left;
      const [bcls, btxt] = seatBadge(seats);
      const isFull  = seats === 0;
      const link    = isFull ? '#' : `boka-flode.html?instance=${encodeURIComponent(inst.id)}`;
      const btnCls  = isFull ? 'btn--outline' : 'btn--primary';
      const btnTxt  = isFull ? 'Väntelista' : 'Boka plats';
      return `<div class="card courserow">
        <div>
          <div class="flex gap-8 center wrap" style="margin-bottom:6px">
            <span class="badge ${bcls}"><span class="dot"></span>${btxt}</span>
          </div>
          <h3 class="h3" style="font-size:1.2rem">${title}</h3>
          <p class="muted" style="font-size:13.5px;margin-top:2px">👤 ${inst.instructor || ''} · 🌐 Svenska</p>
        </div>
        <div>
          <div class="muted" style="font-size:12px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em">Plats &amp; tid</div>
          <b>${inst.city || ''}</b> · ${inst.venue || ''}
          <br><span class="muted" style="font-size:14px">${date}${time ? ', ' + time : ''}</span>
        </div>
        <div>
          <div class="muted" style="font-size:12px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em">Pris</div>
          <span class="price-from" style="font-size:1.4rem">${price}</span>
        </div>
        <div>
          <a class="btn ${btnCls} btn--block" href="${link}">${btnTxt}</a>
        </div>
      </div>`;
    }

    loadList();
  }

  /* ================================================================
   * boka-flode.html — multi-step booking flow
   * ================================================================ */
  function initBokaFlode() {
    const root = document.getElementById('bokaFlode');
    if (!root) return;

    const params     = new URLSearchParams(location.search);
    const preselect  = params.get('instance');
    let   instances  = [];
    let   selected   = null;   // the chosen instance object
    let   step       = preselect ? 2 : 1;
    let   bookingType = 'private'; // 'private' | 'company'

    // participant list starts with one empty row
    let participants = [{ first: '', last: '', email: '' }];

    const stepsEl   = document.getElementById('flowSteps');
    const asideEl   = document.getElementById('flowAside');
    const contentEl = document.getElementById('flowContent');
    const confirmEl = document.getElementById('flowConfirm');

    function setStep(n) {
      step = n;
      renderSteps();
      renderContent();
    }

    function renderSteps() {
      if (!stepsEl) return;
      const labels = ['Tillfälle', 'Deltagare', 'Kontakt', 'Granska', 'Skicka'];
      stepsEl.innerHTML = labels.map((lbl, i) => {
        const num = i + 1;
        const isDone   = num < step;
        const isActive = num === step;
        const cls = isDone ? 'done' : isActive ? 'active' : '';
        const nContent = isDone ? '&#10003;' : num;
        return `<li class="${cls}"><span class="n">${nContent}</span> ${lbl}</li>`;
      }).join('');
    }

    function renderAside() {
      if (!asideEl) return;
      if (!selected) {
        asideEl.innerHTML = `<div class="card"><div class="card__body">
          <h3 class="h3 mb-16" style="font-size:1.1rem">Din bokning</h3>
          <p class="muted">Inget tillfälle valt än.</p>
        </div></div>`;
        return;
      }
      const title = courseTitle(selected);
      const { date, time } = fmtDate(selected);
      const price = priceLabel(selected);
      const pCount = participants.length;
      const priceNum = parseFloat(String(price).replace(/[^\d.,]/g,'').replace(',','.')) || 0;
      const total   = priceNum > 0 ? priceNum * pCount : null;
      asideEl.innerHTML = `<div class="card"><div class="card__body">
        <h3 class="h3 mb-16" style="font-size:1.1rem">Din bokning</h3>
        <div class="ph ph--16x9 mb-16" style="border-radius:var(--r-md)"><span>${title}</span></div>
        <b>${title}</b>
        <p class="muted" style="font-size:14px;margin:4px 0 14px">
          ${selected.city || ''} · ${selected.venue || ''}<br>${date}${time ? ', ' + time : ''}
        </p>
        <hr class="rule" style="margin:14px 0">
        <div class="grid" style="gap:10px;font-size:14.5px">
          ${priceNum > 0 ? `
          <div class="flex between"><span class="muted">${price} × ${pCount} deltagare</span><b>${PA.formatSEK ? PA.formatSEK(total) : total + ' kr'}</b></div>
          ` : `<div class="flex between"><span class="muted">Pris</span><b>${price || 'Se offert'}</b></div>`}
        </div>
        <hr class="rule" style="margin:14px 0">
        <div class="flex between center">
          <b style="font-size:1.05rem">Totalt</b>
          <span class="price-from" style="font-size:1.6rem">${priceNum > 0 ? (PA.formatSEK ? PA.formatSEK(total) : total + ' kr') : price || 'Offert'}</span>
        </div>
      </div></div>
      <div class="callout mt-16"><span>&#128274;</span><div>Platsen reserveras när du skickar bokningen.</div></div>`;
    }

    /* --- Step 1: choose occasion --- */
    function renderStep1() {
      let html = `<h1 class="h2 mb-8">Välj tillfälle</h1>
        <p class="muted mb-24">Klicka på ett kurstillfälle för att fortsätta.</p>
        <div id="step1List"><div class="muted">Hämtar tillfällen…</div></div>`;
      contentEl.innerHTML = html;

      PA.db.listInstances().then(rows => {
        instances = rows;
        const container = document.getElementById('step1List');
        if (!rows.length) {
          container.innerHTML = '<p class="muted">Inga tillfällen tillgängliga just nu.</p>';
          return;
        }
        container.innerHTML = rows.map((inst, idx) => {
          const title   = courseTitle(inst);
          const { date, time } = fmtDate(inst);
          const price   = priceLabel(inst);
          const seats   = inst.seats_left;
          const [bcls, btxt] = seatBadge(seats);
          const isFull  = seats === 0;
          return `<div class="card courserow" style="cursor:${isFull?'default':'pointer'};${isFull?'opacity:.65':''}" data-idx="${idx}">
            <div>
              <span class="badge ${bcls}" style="margin-bottom:6px"><span class="dot"></span>${btxt}</span>
              <h3 class="h3" style="font-size:1.1rem">${title}</h3>
            </div>
            <div><b>${inst.city || ''}</b><br><span class="muted" style="font-size:14px">${date}${time ? ', ' + time : ''}</span></div>
            <div><span class="price-from" style="font-size:1.3rem">${price}</span></div>
            <div><button class="btn ${isFull?'btn--outline':'btn--primary'}" ${isFull?'disabled':''} data-idx="${idx}">${isFull?'Fullbokad':'Välj'}</button></div>
          </div>`;
        }).join('');
        container.querySelectorAll('[data-idx]').forEach(el => {
          el.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-idx]');
            if (!btn || btn.disabled) return;
            const idx = parseInt(btn.dataset.idx);
            selected = instances[idx];
            renderAside();
            setStep(2);
          });
        });
      });

      const nav = `<div class="flex between center mt-32 wrap gap-12">
        <a class="btn btn--ghost" href="boka.html">&#8592; Tillbaka</a>
      </div>`;
      contentEl.innerHTML += nav;
    }

    /* --- Step 2: participants --- */
    function renderStep2() {
      contentEl.innerHTML = buildStep2HTML();
      bindStep2();
    }

    function buildStep2HTML() {
      return `<h1 class="h2 mb-8">Vem ska gå kursen?</h1>
        <p class="muted mb-24">Lägg till deltagarnas uppgifter. Kompetensbevis skickas till respektive e-post.</p>
        <div class="card"><div class="card__body">
          <div class="flex between center mb-16">
            <h3 class="h3" style="font-size:1.15rem">Deltagare (<span id="partCount">${participants.length}</span>)</h3>
            <span class="badge">Max 12</span>
          </div>
          <div id="partList">${participants.map((p, i) => partRowHTML(p, i)).join('')}</div>
          <button class="btn btn--outline" id="addPart" style="margin-top:6px">+ Lägg till deltagare</button>
        </div></div>
        <div class="flex between center mt-32 wrap gap-12">
          <button class="btn btn--ghost" id="stepBack">&#8592; Tillbaka</button>
          <button class="btn btn--primary btn--lg" id="stepNext">Fortsätt &#8594;</button>
        </div>`;
    }

    function partRowHTML(p, i) {
      return `<div class="partrow" data-row="${i}" style="margin-bottom:12px">
        <div class="field" style="margin:0"><label>Förnamn</label>
          <input class="input" name="first" placeholder="Förnamn" value="${escHtml(p.first)}">
        </div>
        <div class="field" style="margin:0"><label>Efternamn</label>
          <input class="input" name="last" placeholder="Efternamn" value="${escHtml(p.last)}">
        </div>
        <button class="icon-btn" aria-label="Ta bort" style="background:var(--danger-bg);color:var(--danger)" data-remove="${i}">&#10005;</button>
        <div class="field" style="grid-column:1/-1;margin:8px 0 0">
          <label>E-post (för kompetensbevis)</label>
          <input class="input" name="email" type="email" placeholder="namn@exempel.se" value="${escHtml(p.email)}">
        </div>
      </div><hr class="rule" style="margin:4px 0 12px">`;
    }

    function bindStep2() {
      // collect from DOM → update participants before re-render
      function syncParticipants() {
        document.querySelectorAll('[data-row]').forEach(row => {
          const i = parseInt(row.dataset.row);
          if (!participants[i]) return;
          participants[i].first = row.querySelector('[name=first]').value.trim();
          participants[i].last  = row.querySelector('[name=last]').value.trim();
          participants[i].email = row.querySelector('[name=email]').value.trim();
        });
      }
      document.getElementById('addPart')?.addEventListener('click', () => {
        syncParticipants();
        if (participants.length >= 12) return;
        participants.push({ first: '', last: '', email: '' });
        renderStep2();
        renderAside();
      });
      document.getElementById('partList')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove]');
        if (!btn) return;
        syncParticipants();
        const i = parseInt(btn.dataset.remove);
        if (participants.length > 1) { participants.splice(i, 1); renderStep2(); renderAside(); }
      });
      document.getElementById('stepBack')?.addEventListener('click', () => {
        syncParticipants();
        setStep(preselect ? 1 : 1);
      });
      document.getElementById('stepNext')?.addEventListener('click', () => {
        syncParticipants();
        // basic validation
        const bad = participants.some(p => !p.first || !p.last || !p.email);
        if (bad) { showInlineError('step2Err', 'Fyll i förnamn, efternamn och e-post för alla deltagare.'); return; }
        clearInlineError('step2Err');
        setStep(3);
      });
    }

    /* --- Step 3: contact --- */
    let contactData = { name: '', email: '', phone: '', company: '', org: '' };

    function renderStep3() {
      const isCompany = bookingType === 'company';
      contentEl.innerHTML = `<h1 class="h2 mb-8">Dina kontaktuppgifter</h1>
        <p class="muted mb-24">Bokningsbekräftelse skickas till din e-post.</p>
        <div class="card"><div class="card__body">
          <div class="grid cols-2" style="gap:14px">
            <div class="field"><label>Namn</label>
              <input class="input" id="cName" placeholder="För- och efternamn" value="${escHtml(contactData.name)}">
            </div>
            <div class="field"><label>Telefon</label>
              <input class="input" id="cPhone" placeholder="07X-XXX XX XX" value="${escHtml(contactData.phone)}">
            </div>
          </div>
          <div class="field"><label>E-post</label>
            <input class="input" id="cEmail" type="email" placeholder="namn@exempel.se" value="${escHtml(contactData.email)}">
          </div>
          <label class="checkbox mb-16" style="margin-top:6px">
            <input type="checkbox" id="isCompany" ${isCompany?'checked':''}>
            <span>Jag bokar för ett företag (faktura &amp; org.nr)</span>
          </label>
          <div id="companyFields" style="display:${isCompany?'block':'none'}">
            <div class="field"><label>Företagsnamn</label>
              <input class="input" id="cCompany" placeholder="AB Exempelföretaget" value="${escHtml(contactData.company)}">
            </div>
            <div class="field"><label>Organisationsnummer</label>
              <input class="input" id="cOrg" placeholder="556XXX-XXXX" value="${escHtml(contactData.org)}">
            </div>
          </div>
          <div id="step3Err"></div>
        </div></div>
        <div class="flex between center mt-32 wrap gap-12">
          <button class="btn btn--ghost" id="stepBack">&#8592; Tillbaka</button>
          <button class="btn btn--primary btn--lg" id="stepNext">Granska bokning &#8594;</button>
        </div>`;

      document.getElementById('isCompany')?.addEventListener('change', (e) => {
        bookingType = e.target.checked ? 'company' : 'private';
        document.getElementById('companyFields').style.display = e.target.checked ? 'block' : 'none';
      });
      document.getElementById('stepBack')?.addEventListener('click', () => setStep(2));
      document.getElementById('stepNext')?.addEventListener('click', () => {
        contactData.name    = document.getElementById('cName')?.value.trim();
        contactData.email   = document.getElementById('cEmail')?.value.trim();
        contactData.phone   = document.getElementById('cPhone')?.value.trim();
        contactData.company = document.getElementById('cCompany')?.value.trim() || '';
        contactData.org     = document.getElementById('cOrg')?.value.trim() || '';
        if (!contactData.name || !contactData.email) {
          showInlineError('step3Err', 'Namn och e-post är obligatoriska.'); return;
        }
        if (bookingType === 'company' && (!contactData.company || !contactData.org)) {
          showInlineError('step3Err', 'Ange företagsnamn och organisationsnummer.'); return;
        }
        clearInlineError('step3Err');
        setStep(4);
      });
    }

    /* --- Step 4: review --- */
    function renderStep4() {
      const title = courseTitle(selected);
      const { date, time } = fmtDate(selected);
      contentEl.innerHTML = `<h1 class="h2 mb-8">Granska din bokning</h1>
        <p class="muted mb-24">Kontrollera uppgifterna och skicka bokningen.</p>
        <div class="card mb-24"><div class="card__body">
          <h3 class="h3 mb-12" style="font-size:1.05rem">Tillfälle</h3>
          <b>${title}</b>
          <p class="muted" style="font-size:14.5px;margin-top:4px">${selected.city || ''} · ${selected.venue || ''}<br>${date}${time ? ', ' + time : ''}</p>
        </div></div>
        <div class="card mb-24"><div class="card__body">
          <h3 class="h3 mb-12" style="font-size:1.05rem">Deltagare (${participants.length})</h3>
          ${participants.map(p =>
            `<div class="flex gap-12 center" style="padding:6px 0;border-bottom:1px solid var(--line)">
              <span>${escHtml(p.first)} ${escHtml(p.last)}</span>
              <span class="muted" style="font-size:14px">${escHtml(p.email)}</span>
            </div>`
          ).join('')}
        </div></div>
        <div class="card mb-24"><div class="card__body">
          <h3 class="h3 mb-12" style="font-size:1.05rem">Beställare</h3>
          <p style="font-size:14.5px;line-height:1.9">
            ${escHtml(contactData.name)}<br>
            ${escHtml(contactData.email)}<br>
            ${contactData.phone ? escHtml(contactData.phone)+'<br>' : ''}
            ${bookingType==='company' ? `<b>${escHtml(contactData.company)}</b> · ${escHtml(contactData.org)}` : '<em>Privatperson</em>'}
          </p>
        </div></div>
        <div id="submitErr"></div>
        <div class="flex between center mt-24 wrap gap-12">
          <button class="btn btn--ghost" id="stepBack">&#8592; Ändra</button>
          <button class="btn btn--primary btn--lg" id="btnSubmit">Skicka bokning &#8594;</button>
        </div>`;

      document.getElementById('stepBack')?.addEventListener('click', () => setStep(3));
      document.getElementById('btnSubmit')?.addEventListener('click', submitBooking);
    }

    /* --- Submit --- */
    async function submitBooking() {
      const btn = document.getElementById('btnSubmit');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = 'Skickar…';
      clearInlineError('submitErr');

      try {
        const booking = await PA.db.createBooking({
          instance_id:  selected.id,
          type:         bookingType,
          contact:      contactData,
          participants: participants,
        });
        showConfirmation(booking);
      } catch (err) {
        const msg = err.message || 'Något gick fel. Försök igen eller ring oss.';
        showInlineError('submitErr', msg);
        btn.disabled = false;
        btn.textContent = 'Skicka bokning →';
      }
    }

    function showConfirmation(booking) {
      const title = courseTitle(selected);
      const { date, time } = fmtDate(selected);
      contentEl.style.display = 'none';
      if (stepsEl) {
        stepsEl.innerHTML = ['Tillfälle','Deltagare','Kontakt','Granska','Skicka'].map((lbl, i) =>
          `<li class="done"><span class="n">&#10003;</span> ${lbl}</li>`
        ).join('');
      }
      if (confirmEl) {
        confirmEl.style.display = 'block';
        confirmEl.innerHTML = `
          <div class="card" style="border-color:var(--green);background:var(--green-bg)">
            <div class="card__body">
              <div class="flex gap-12 center mb-16">
                <span style="font-size:2rem">&#9989;</span>
                <div>
                  <h2 class="h3" style="color:var(--green)">Bokning mottagen!</h2>
                  <p class="muted" style="font-size:14px">Bekräftelse skickas till ${escHtml(contactData.email)}</p>
                </div>
              </div>
              <hr class="rule" style="margin:16px 0">
              <div class="grid" style="gap:10px;font-size:15px">
                <div class="flex between"><span class="muted">Bokningsreferens</span><b style="font-family:var(--font-mono)">${booking.id ? booking.id.toString().toUpperCase().slice(0,8) : '—'}</b></div>
                <div class="flex between"><span class="muted">Kurs</span><b>${title}</b></div>
                <div class="flex between"><span class="muted">Datum</span><b>${date}${time ? ', ' + time : ''}</b></div>
                <div class="flex between"><span class="muted">Plats</span><b>${selected.city || ''} · ${selected.venue || ''}</b></div>
                <div class="flex between"><span class="muted">Deltagare</span><b>${participants.length} st</b></div>
                <div class="flex between"><span class="muted">Typ</span><b>${bookingType==='company'?'Företagsbokning':'Privatbokning'}</b></div>
              </div>
              <hr class="rule" style="margin:16px 0">
              <p class="muted" style="font-size:14px">Vi återkommer med fullständig bekräftelse. Frågor? Ring <a class="tlink" href="tel:0293761011">0293-76 10 11</a>.</p>
              <a class="btn btn--primary btn--block" href="boka.html" style="margin-top:16px">Boka fler platser</a>
            </div>
          </div>`;
      }
    }

    /* --- Render current step --- */
    function renderContent() {
      if (!contentEl) return;
      if (step === 1) renderStep1();
      else if (step === 2) renderStep2();
      else if (step === 3) renderStep3();
      else if (step === 4) renderStep4();
      renderAside();
    }

    /* --- Load preselected instance if ?instance= given --- */
    async function boot() {
      if (preselect) {
        const rows = await PA.db.listInstances();
        instances  = rows;
        selected   = rows.find(r => String(r.id) === String(preselect)) || null;
        if (!selected && rows.length) {
          // If demo IDs like "demo-0" – just pick first
          selected = rows[0];
        }
      }
      renderSteps();
      renderContent();
      renderAside();
    }

    boot();
  }

  /* ================================================================
   * kurs-hlr-vuxen.html — occasions table + quote form
   * ================================================================ */
  function initHlrVuxen() {
    /* Occasions table */
    const tbl = document.getElementById('courseDates');
    if (tbl) {
      function fmtSeats(s) {
        if (s === 0) return '<span class="badge badge--danger"><span class="dot"></span>Fullbokad</span>';
        if (s <= 4)  return `<span class="badge badge--amber"><span class="dot"></span>${s} kvar</span>`;
        return '<span class="badge badge--green"><span class="dot"></span>Platser kvar</span>';
      }
      PA.db.listInstances().then(rows => {
        const hlr = rows.filter(r => {
          const t = courseTitle(r).toLowerCase();
          return t.includes('hlr vuxen') || t === 'hlr vuxen';
        });
        if (!hlr.length) {
          tbl.innerHTML = '<caption class="muted" style="padding:24px;text-align:center">Inga kommande tillfällen – kontakta oss.</caption>';
          return;
        }
        tbl.innerHTML = `<thead><tr><th>Stad</th><th>Lokal</th><th>Datum</th><th>Tid</th><th>Instruktör</th><th>Platser</th><th></th></tr></thead>
          <tbody>${hlr.map(inst => {
            const { date, time } = fmtDate(inst);
            const isFull = inst.seats_left === 0;
            const href   = isFull ? '#' : `boka-flode.html?instance=${encodeURIComponent(inst.id)}`;
            return `<tr>
              <td><b>${inst.city || ''}</b></td>
              <td>${inst.venue || ''}</td>
              <td>${date}</td>
              <td>${time}</td>
              <td>${inst.instructor || ''}</td>
              <td>${fmtSeats(inst.seats_left)}</td>
              <td><a class="btn btn--sm ${isFull?'btn--outline':'btn--primary'}" href="${href}">${isFull?'Väntelista':'Boka'}</a></td>
            </tr>`;
          }).join('')}</tbody>`;
      });
    }

    /* Quote form */
    const quoteForm = document.getElementById('courseQuoteForm');
    if (quoteForm) {
      quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn    = quoteForm.querySelector('[type=submit]');
        const errEl  = document.getElementById('quoteErr');
        const okEl   = document.getElementById('quoteOk');
        if (errEl)  errEl.style.display = 'none';
        if (okEl)   okEl.style.display  = 'none';
        btn.disabled = true;
        btn.textContent = 'Skickar…';
        const fd = new FormData(quoteForm);
        try {
          const result = await PA.db.createQuote({
            company_name:      fd.get('company_name')?.trim() || '',
            org_number:        fd.get('org_number')?.trim()   || '',
            contact_name:      fd.get('contact_name')?.trim() || '',
            email:             fd.get('email')?.trim()        || '',
            phone:             fd.get('phone')?.trim()        || '',
            course_interest:   'HLR vuxen',
            participant_count: parseInt(fd.get('participant_count')) || 0,
            city:              fd.get('city')?.trim()         || '',
            preferred_date:    fd.get('preferred_date')?.trim() || '',
            location_pref:     fd.get('location_pref')?.trim() || '',
            message:           fd.get('message')?.trim()      || '',
          });
          quoteForm.style.display = 'none';
          if (okEl) {
            okEl.style.display = 'block';
            okEl.innerHTML = `<div class="callout" style="background:var(--green-bg);border-color:rgba(31,138,91,.25);color:var(--green)">
              <span>&#9989;</span>
              <div><b>Offertförfrågan skickad!</b><br>
              Referens: <span style="font-family:var(--font-mono)">${result.id ? result.id.toString().toUpperCase().slice(0,8) : '—'}</span><br>
              Vi återkommer inom 1 arbetsdag till <b>${escHtml(result.email || fd.get('email'))}</b>.</div>
            </div>`;
          }
        } catch (err) {
          const msg = err.message || 'Något gick fel. Försök igen.';
          if (errEl) { errEl.style.display='block'; errEl.textContent = msg; }
          btn.disabled = false;
          btn.textContent = 'Skicka förfrågan';
        }
      });
    }
  }

  /* ---- helpers ---- */
  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function showInlineError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<div class="callout callout--warn" style="margin-top:14px"><span>&#9888;</span><div>${escHtml(msg)}</div></div>`;
  }
  function clearInlineError(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  }

  /* ---- boot ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initBokaList();
    initBokaFlode();
    initHlrVuxen();
  });

})();
