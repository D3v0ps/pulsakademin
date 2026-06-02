/* PulsAkademin — Quote / offert feature
 *
 * Usage:
 *   PA.quote.init(formEl, { preselect: 'HLR Bas' })
 *
 * The function:
 *   1. Populates the utbildning <select> from PA.db.listCourses()
 *   2. If preselect is given, sets that value in the select
 *   3. Wires validation + PA.db.createQuote() on submit
 *   4. On success: hides form, shows inline confirmation panel
 *   5. On error: shows inline Swedish error message
 *   6. Never uses toast — all feedback is in-page
 */
(function () {
  'use strict';

  window.PA = window.PA || {};

  /* ---------- helpers ---------- */

  function setError(fieldEl, msg) {
    clearError(fieldEl);
    fieldEl.classList.add('field--error');
    var hint = document.createElement('span');
    hint.className = 'field__err';
    hint.setAttribute('role', 'alert');
    hint.textContent = msg;
    fieldEl.appendChild(hint);
  }

  function clearError(fieldEl) {
    fieldEl.classList.remove('field--error');
    var old = fieldEl.querySelector('.field__err');
    if (old) old.remove();
  }

  function clearAllErrors(formEl) {
    formEl.querySelectorAll('.field--error').forEach(function (f) { clearError(f); });
    var banner = formEl.querySelector('.form-error-banner');
    if (banner) banner.remove();
  }

  function showFormError(formEl, msg) {
    var old = formEl.querySelector('.form-error-banner');
    if (old) old.remove();
    var banner = document.createElement('div');
    banner.className = 'form-error-banner';
    banner.setAttribute('role', 'alert');
    banner.textContent = msg;
    formEl.insertBefore(banner, formEl.firstChild);
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function val(input) {
    return (input ? input.value.trim() : '');
  }

  function generateRef() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return 'PA-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  function locLabel(value) {
    var map = { 'hos-oss': 'Hos oss', 'er-lokal': 'I er lokal', 'annan': 'Annan ort' };
    return map[value] || value;
  }

  /* ---------- populate utbildning select ---------- */

  function populateCourseSelect(selectEl, preselect) {
    PA.db.listCourses().then(function (courses) {
      /* keep any existing <option> elements as fallback if listCourses returns empty */
      if (courses && courses.length) {
        /* clear existing hard-coded options */
        while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
        /* blank first option */
        var blank = document.createElement('option');
        blank.value = '';
        blank.textContent = '– Välj utbildning –';
        selectEl.appendChild(blank);
        courses.forEach(function (c) {
          var opt = document.createElement('option');
          opt.value = c.title;
          opt.textContent = c.title;
          if (preselect && c.title === preselect) opt.selected = true;
          selectEl.appendChild(opt);
        });
      } else {
        /* no backend courses — keep existing options, just add blank and try preselect */
        var opts = selectEl.querySelectorAll('option');
        var found = false;
        opts.forEach(function (o) {
          if (preselect && o.textContent.trim() === preselect) {
            o.selected = true;
            found = true;
          }
        });
        if (preselect && !found) {
          /* add as extra option and select it */
          var extra = document.createElement('option');
          extra.value = preselect;
          extra.textContent = preselect;
          extra.selected = true;
          selectEl.appendChild(extra);
        }
      }
    }).catch(function () {
      /* listCourses can never really throw hard (it falls back) — ignore */
    });
  }

  /* ---------- build confirmation panel ---------- */

  function buildConfirmation(ref, payload) {
    var panel = document.createElement('div');
    panel.className = 'quote-confirm';
    panel.setAttribute('role', 'status');
    panel.innerHTML = [
      '<div class="quote-confirm__icon" aria-hidden="true">✓</div>',
      '<h2 class="h3 quote-confirm__title">Tack! Vi återkommer inom ett par timmar.</h2>',
      '<p class="muted quote-confirm__sub">Din offertförfrågan har tagits emot. En bekräftelse skickas till <strong>' + escHtml(payload.email) + '</strong>.</p>',
      '<div class="quote-confirm__summary">',
        '<div class="quote-confirm__ref">Referensnr: <strong>' + escHtml(ref) + '</strong></div>',
        buildSummaryTable(payload),
      '</div>',
      '<a href="index.html" class="btn btn--outline mt-16">Tillbaka till startsidan</a>',
    ].join('');
    return panel;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildSummaryTable(p) {
    var rows = [
      ['Företag', p.company_name],
      ['Org.nr', p.org_number],
      ['Kontaktperson', p.contact_name],
      ['E-post', p.email],
      ['Telefon', p.phone],
      ['Utbildning', p.course_interest],
      ['Antal deltagare', p.participant_count],
      ['Ort', p.city],
      ['Önskat datum', p.preferred_date],
      ['Plats', locLabel(p.location_pref)],
      ['Meddelande', p.message],
    ];
    var html = '<table class="quote-confirm__table">';
    rows.forEach(function (r) {
      if (r[1]) {
        html += '<tr><th>' + escHtml(r[0]) + '</th><td>' + escHtml(String(r[1])) + '</td></tr>';
      }
    });
    html += '</table>';
    return html;
  }

  /* ---------- validate ---------- */

  function validate(formEl, fields) {
    clearAllErrors(formEl);
    var ok = true;

    function require(fieldWrapper, inputEl, msg) {
      if (!fieldWrapper) return;
      var v = inputEl ? val(inputEl) : '';
      if (!v) {
        setError(fieldWrapper, msg || 'Obligatoriskt fält.');
        ok = false;
      }
    }

    require(fields.companyField, fields.companyInput, 'Ange företagsnamn.');
    require(fields.contactField, fields.contactInput, 'Ange kontaktperson.');
    require(fields.emailField, fields.emailInput, 'Ange e-postadress.');
    if (fields.emailInput && val(fields.emailInput) && !val(fields.emailInput).includes('@')) {
      setError(fields.emailField, 'Ange en giltig e-postadress.');
      ok = false;
    }
    require(fields.courseField, fields.courseSelect, 'Välj utbildning.');

    /* consent */
    if (fields.consentCheckbox && !fields.consentCheckbox.checked && fields.consentField) {
      setError(fields.consentField, 'Du måste godkänna personuppgiftspolicyn.');
      ok = false;
    } else if (fields.consentCheckbox && !fields.consentCheckbox.checked) {
      ok = false;
    }

    return ok;
  }

  /* ---------- main init ---------- */

  function init(formEl, opts) {
    opts = opts || {};
    var preselect = opts.preselect || null;

    /* locate fields */
    var inputs = formEl.querySelectorAll('input, select, textarea');
    /* We find fields by position/type since the HTML uses unlabelled inputs */
    var allInputs = Array.prototype.slice.call(formEl.querySelectorAll('.input, .select, .textarea'));
    var allSelects = Array.prototype.slice.call(formEl.querySelectorAll('select.select'));
    var allTextareas = Array.prototype.slice.call(formEl.querySelectorAll('textarea.textarea'));

    /* Field wrappers (.field) in document order */
    var fieldEls = Array.prototype.slice.call(formEl.querySelectorAll('.field'));

    /* Map by label text */
    function fieldByLabel(labelText) {
      for (var i = 0; i < fieldEls.length; i++) {
        var lbl = fieldEls[i].querySelector('label');
        if (lbl && lbl.textContent.trim().toLowerCase().indexOf(labelText.toLowerCase()) !== -1) {
          return fieldEls[i];
        }
      }
      return null;
    }

    function inputIn(fieldEl) {
      if (!fieldEl) return null;
      return fieldEl.querySelector('input.input, input[type="text"], input[type="email"], input[type="number"], input[type="date"]');
    }

    var companyField   = fieldByLabel('Företagsnamn');
    var orgField       = fieldByLabel('Organisationsnummer');
    var contactField   = fieldByLabel('Kontaktperson');
    var phoneField     = fieldByLabel('Telefon');
    var emailField     = fieldByLabel('E-post');
    var courseField    = fieldByLabel('Utbildning');
    var countField     = fieldByLabel('Antal deltagare');
    var cityField      = fieldByLabel('Önskad ort');
    var dateField      = fieldByLabel('Önskat datum');
    var msgField       = fieldByLabel('Meddelande');

    var companyInput   = inputIn(companyField);
    var orgInput       = inputIn(orgField);
    var contactInput   = inputIn(contactField);
    var phoneInput     = inputIn(phoneField);
    var emailInput     = inputIn(emailField);
    var courseSelect   = courseField ? courseField.querySelector('select.select') : null;
    var countInput     = inputIn(countField);
    var cityInput      = inputIn(cityField);
    var dateInput      = inputIn(dateField);
    var msgTextarea    = msgField ? msgField.querySelector('textarea.textarea') : null;

    /* location radio (pillrow) — name may be "loc" or "floc" depending on page */
    var locRadios = formEl.querySelectorAll('.pillrow input[type="radio"]');
    if (!locRadios.length) {
      locRadios = formEl.querySelectorAll('input[type="radio"]');
    }

    /* consent checkbox */
    var consentCheckbox = formEl.querySelector('input[type="checkbox"]');
    var consentField = consentCheckbox ? consentCheckbox.closest('.field, label.checkbox') : null;
    /* wrap the checkbox label in a .field if it isn't already */
    if (consentCheckbox && !consentField) {
      var checkboxLabel = consentCheckbox.closest('label.checkbox');
      if (checkboxLabel) {
        var wrapper = document.createElement('div');
        wrapper.className = 'field';
        checkboxLabel.parentNode.insertBefore(wrapper, checkboxLabel);
        wrapper.appendChild(checkboxLabel);
        consentField = wrapper;
      }
    }

    var submitBtn = formEl.querySelector('button[type="submit"], button.btn--primary, button.btn--block');

    /* populate courses */
    if (courseSelect) {
      populateCourseSelect(courseSelect, preselect);
    }

    /* clear error on interaction */
    function clearFieldError(fieldEl) {
      if (fieldEl) clearError(fieldEl);
    }
    [companyInput, orgInput, contactInput, phoneInput, emailInput, countInput, cityInput, dateInput].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        var f = el.closest('.field');
        if (f) clearError(f);
      });
    });
    if (courseSelect) {
      courseSelect.addEventListener('change', function () {
        var f = courseSelect.closest('.field');
        if (f) clearError(f);
      });
    }
    if (consentCheckbox) {
      consentCheckbox.addEventListener('change', function () {
        if (consentField) clearError(consentField);
      });
    }

    /* submit */
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = {
        companyField: companyField, companyInput: companyInput,
        orgField: orgField,
        contactField: contactField, contactInput: contactInput,
        emailField: emailField, emailInput: emailInput,
        courseField: courseField, courseSelect: courseSelect,
        consentField: consentField, consentCheckbox: consentCheckbox,
      };

      if (!validate(formEl, fields)) {
        /* scroll to first error */
        var firstErr = formEl.querySelector('.field--error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      /* gather location_pref value — radios have explicit value attrs */
      var locationPref = 'hos-oss';
      locRadios.forEach(function (r) {
        if (r.checked) {
          /* prefer explicit value attribute; fall back to deriving from label text */
          if (r.value && r.value !== 'on') {
            locationPref = r.value;
          } else {
            var lbl = r.parentElement;
            var txt = lbl ? lbl.textContent.trim().toLowerCase() : '';
            if (txt.indexOf('er lokal') !== -1) locationPref = 'er-lokal';
            else if (txt.indexOf('annan') !== -1) locationPref = 'annan';
            else locationPref = 'hos-oss';
          }
        }
      });

      var payload = {
        company_name:      val(companyInput)  || null,
        org_number:        val(orgInput)      || null,
        contact_name:      val(contactInput)  || null,
        email:             val(emailInput)    || null,
        phone:             val(phoneInput)    || null,
        course_interest:   courseSelect ? val(courseSelect) : null,
        participant_count: countInput && val(countInput) ? parseInt(val(countInput), 10) : null,
        city:              val(cityInput)     || null,
        preferred_date:    val(dateInput)     || null,
        location_pref:     locationPref,
        message:           msgTextarea ? val(msgTextarea) : null,
      };

      /* disable submit */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Skickar…';
      }

      PA.db.createQuote(payload).then(function (row) {
        var ref = (row && row.id) ? String(row.id).substring(0, 8).toUpperCase() : generateRef();
        /* hide form, show confirmation in same container */
        var container = formEl.closest('.card') || formEl.parentElement;
        var cardBody = container.classList.contains('card__body') ? container : container.querySelector('.card__body');
        var target = cardBody || container;
        /* hide form */
        formEl.style.display = 'none';
        /* remove old heading if any (we'll include it in the panel) */
        var heading = target.querySelector('h2, h3');
        if (heading && !formEl.contains(heading)) heading.style.display = 'none';
        /* append confirmation */
        var panel = buildConfirmation(ref, payload);
        target.appendChild(panel);
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(function (err) {
        /* re-enable submit */
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Skicka offertförfrågan';
        }
        var msg = (err && err.message) ? err.message : 'Något gick fel. Försök igen eller ring oss på 0293-76 10 11.';
        showFormError(formEl, msg);
      });
    });
  }

  /* ---------- package card selection helper (foretag.html) ---------- */

  function initPackageCards(containerEl, quoteFormEl) {
    var cards = containerEl.querySelectorAll('[data-package]');
    var courseSelect = quoteFormEl.querySelector('select.select');

    cards.forEach(function (card) {
      var btns = card.querySelectorAll('[data-pkg-select], .btn');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          /* mark selected */
          cards.forEach(function (c) { c.classList.remove('pkg-card--selected'); });
          card.classList.add('pkg-card--selected');
          /* preselect course */
          var pkgName = card.getAttribute('data-package');
          if (courseSelect && pkgName) {
            var found = false;
            Array.prototype.slice.call(courseSelect.options).forEach(function (opt) {
              if (opt.value === pkgName || opt.textContent.trim() === pkgName) {
                opt.selected = true;
                found = true;
              }
            });
            if (!found) {
              var extra = document.createElement('option');
              extra.value = pkgName;
              extra.textContent = pkgName;
              extra.selected = true;
              courseSelect.appendChild(extra);
            }
          }
          /* scroll to form */
          var formSection = document.getElementById('offert-inline');
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    });
  }

  PA.quote = { init: init, populateCourseSelect: populateCourseSelect, initPackageCards: initPackageCards };
})();
