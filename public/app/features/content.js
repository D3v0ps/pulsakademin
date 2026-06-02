/* PulsAkademin — content.js
 * Handles: kunskapsbank.html, artikel.html, hyr.html, service.html
 * No toasts. Inline confirmations. Swedish. Consent required on forms.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  FALLBACK ARTICLE DATA                                               */
  /*  PA.db.listArticles() returns [] when backend not configured.       */
  /*  This set is always available so the knowledge base is populated.   */
  /* ------------------------------------------------------------------ */

  var FALLBACK_ARTICLES = [
    {
      slug: "vad-ar-hlr",
      title: "Vad är HLR – och varför varje minut räknas",
      category: "HLR",
      excerpt: "Grunderna i hjärt-lungräddning och varför tidiga insatser räddar liv. En genomgång för dig som vill förstå vad HLR innebär och hur det utförs.",
      body: "<p>HLR – hjärt-lungräddning – är en livräddande teknik som utförs när en person slutat andas och hjärtat slutat slå. Varje minut utan insats minskar chansen att överleva med ungefär 10 procent.</p><h2 class='h2'>Vad innebär HLR?</h2><p>HLR består av bröstkompressioner och inblåsningar. Bröstkompressioner håller blodet cirkulerande till hjärna och hjärta medan inblåsningarna tillför syre. Kombinationen ger kroppen en chans tills professionell hjälp anländer.</p><h2 class='h2'>Varför är det viktigt att kunna?</h2><p>De flesta hjärtstopp inträffar i hemmet eller på offentliga platser. Vittnen till ett hjärtstopp som kan starta HLR fördubblar chansen till överlevnad. Lär dig – det kan vara en anhörig som drabbas.</p><h2 class='h2'>Vill ni lära er HLR?</h2><p>PulsAkademin erbjuder praktiska kurser för arbetsplatser, föreningar och privatpersoner. <a class='tlink' href='boka.html'>Boka en kurs →</a></p>",
      author: "Hamza Samara",
      read_time: "4 min läsning",
      updated: "maj 2026",
      featured: true,
    },
    {
      slug: "sa-anvander-du-en-hjartstartare",
      title: "Så använder du en hjärtstartare – steg för steg",
      category: "Hjärtstartare",
      excerpt: "En hjärtstartare guidar dig hela vägen. Här går vi igenom exakt vad du gör, från att slå på enheten till att fortsätta HLR.",
      body: "<p>En hjärtstartare (AED) är konstruerad för att vem som helst ska kunna använda den – den talar om exakt vad du ska göra. Här går vi igenom hur en insats ser ut i praktiken.</p><h2 class='h2'>Innan du börjar</h2><p>Om någon plötsligt blir medvetslös och inte andas normalt: larma 112 omedelbart, be någon hämta närmaste hjärtstartare och starta HLR direkt.</p><h2 class='h2'>Steg för steg</h2><ol><li>Slå på hjärtstartaren. Den börjar genast ge röstinstruktioner.</li><li>Blotta bröstkorgen och sätt elektroderna enligt bilderna på dynorna.</li><li>Se till att ingen rör personen medan AED:n analyserar hjärtrytmen.</li><li>Ge stöt om enheten uppmanar det – eller invänta automatisk stöt.</li><li>Fortsätt med HLR direkt efteråt och följ enhetens instruktioner tills hjälp anländer.</li></ol><p>Har ni barn på platsen? Använd barnläge eller barnelektroder om det finns. Saknas de – använd vuxenelektroder, det är bättre än ingenting.</p>",
      author: "Hamza Samara",
      read_time: "6 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "hel-vs-halvautomatisk-aed",
      title: "Helautomatisk vs halvautomatisk AED – vilken passar er?",
      category: "Hjärtstartare",
      excerpt: "Vilken typ av hjärtstartare passar er verksamhet? Vi reder ut skillnaderna mellan hel- och halvautomatiska modeller.",
      body: "<p>När ni väljer hjärtstartare stöter ni snabbt på frågan: helautomatisk eller halvautomatisk? Det påverkar hur enheten används i en akut situation.</p><h2 class='h2'>Halvautomatisk AED</h2><p>Den vanligaste typen. Enheten analyserar hjärtrytmen och ger instruktioner, men du måste trycka på en knapp för att avge stöten. Det ger användaren ett aktivt moment och minskar risken att stöten ges ofrivilligt.</p><h2 class='h2'>Helautomatisk AED</h2><p>Enheten avger stöten automatiskt efter en varning, utan att du behöver trycka på något. Passar miljöer där användaren kan vara stressad eller ha begränsad erfarenhet, exempelvis för personal utan regelbunden träning.</p><h2 class='h2'>Vilket ska ni välja?</h2><p>Båda typerna är lika effektiva kliniskt. Valet handlar om era rutiner och hur van personalen är. Kontakta oss så hjälper vi er hitta rätt. <a class='tlink' href='kontakt.html'>Kontakta oss →</a></p>",
      author: "Hamza Samara",
      read_time: "5 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "sa-ofta-byts-elektroder",
      title: "Så ofta ska elektroder bytas – och vad som händer efter användning",
      category: "Hjärtstartare",
      excerpt: "Hållbarhet, utgångsdatum och vad som händer efter användning. En guide till elektrodunderhåll för er hjärtstartare.",
      body: "<p>Elektroderna till en hjärtstartare har ett utgångsdatum och måste bytas regelbundet, oavsett om enheten använts eller inte. Att missa detta kan innebära att AED:n inte fungerar när det gäller.</p><h2 class='h2'>Hur länge håller elektroderna?</h2><p>De flesta elektroder har en hållbarhetstid på 2–4 år. Kontrollera förpackningens utgångsdatum och sätt en påminnelse i god tid.</p><h2 class='h2'>Efter användning</h2><p>Om hjärtstartaren har använts måste elektroderna bytas omedelbart – de är förbrukade efter en insats. Kontrollera också batteri och enhetens status.</p><h2 class='h2'>Slipp hålla koll själv</h2><p>Med ett <a class='tlink' href='service.html'>serviceavtal från PulsAkademin</a> får ni påminnelser och vi håller koll åt er.</p>",
      author: "Hamza Samara",
      read_time: "4 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "hlr-barn-vs-vuxna",
      title: "HLR på barn vs vuxna – de viktigaste skillnaderna",
      category: "HLR",
      excerpt: "De viktigaste skillnaderna i teknik och kraft när du utför HLR på barn jämfört med vuxna.",
      body: "<p>Att utföra HLR på ett barn skiljer sig från HLR på en vuxen. Att känna till skillnaderna kan vara avgörande i en akut situation.</p><h2 class='h2'>Bröstkompressioner</h2><p>På vuxna används båda händerna och man trycker ner bröstkorgen 5–6 cm. På barn under 8 år räcker det ofta med en hand, och på spädbarn används enbart två fingrar. Trycket ska vara ungefär en tredjedel av bröstkorg­ens djup.</p><h2 class='h2'>Inblåsningar</h2><p>På spädbarn täcker du barnets mun och näsa med din mun. Blås försiktigt – lungorna är små. Barn och vuxna: 30 kompressioner, 2 inblåsningar.</p><h2 class='h2'>Hjärtstartare och barn</h2><p>De flesta hjärtstartare har ett barnläge (lägre energinivå). Använd alltid barnelektroder om sådana finns. Saknas de, använd vuxenelektroderna – det är alltid bättre att försöka.</p><p>Lär er mer på en av våra <a class='tlink' href='boka.html'>praktiska kurser →</a></p>",
      author: "Hamza Samara",
      read_time: "5 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "forsta-hjalpen-arbetsplats",
      title: "Första hjälpen på arbetsplatsen – vad varje arbetsplats bör ha och kunna",
      category: "Arbetsplats",
      excerpt: "Vad varje arbetsplats bör ha och kunna. Krav, rekommendationer och praktiska råd för en trygg arbetsmiljö.",
      body: "<p>Enligt Arbetsmiljölagen ska varje arbetsgivare säkerställa att det finns möjlighet att ge första hjälpen vid olyckor och akuta sjukdomsfall. Men vad innebär det i praktiken?</p><h2 class='h2'>Utrustning</h2><p>Varje arbetsplats bör ha: förbandslåda med basinnehåll, hjärtstartare (AED) vid verksamheter med fler anställda eller hög risk, och brandtäcke.</p><h2 class='h2'>Utbildning</h2><p>Minst en person per arbetspass bör ha genomgått en godkänd HLR-utbildning. För arbetsplatser med fler anställda rekommenderas att en större andel av personalen är utbildad.</p><h2 class='h2'>Rutiner</h2><p>Ha tydliga rutiner för vem som larmar, vem som hämtar hjärtstartaren och vem som påbörjar HLR. Öva scenariot regelbundet.</p><p><a class='tlink' href='boka.html'>Boka en kurs för er arbetsplats →</a></p>",
      author: "Hamza Samara",
      read_time: "5 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "checklista-arbetsplatsen",
      title: "Checklista: hjärtstartare på arbetsplatsen",
      category: "Arbetsplats",
      excerpt: "En praktisk checklista för placering, skyltning och underhåll av hjärtstartaren på er arbetsplats.",
      body: "<p>Har ni en hjärtstartare på arbetsplatsen är det viktigt att den är rätt placerad, skyltad och underhållen. Använd den här checklistan för att se till att allt är på plats.</p><h2 class='h2'>Placering</h2><ul><li>Placerad centralt och lättillgänglig för alla</li><li>Maximalt 3 minuters gångavstånd från alla arbetsplatser</li><li>Synlig och fri från hinder</li></ul><h2 class='h2'>Skyltning</h2><ul><li>Tydlig skylt på hjärtstartarens plats</li><li>Vägvisningsskyltar från entréer och större ytor</li><li>Inkluderad i er karta över utrymningsvägar</li></ul><h2 class='h2'>Underhåll</h2><ul><li>Kontrollera statuslampan regelbundet (ska lysa grönt)</li><li>Kolla elektrodernas utgångsdatum</li><li>Kolla batteriets status</li><li>Dokumentera kontroller</li></ul><p>Vill ni slippa hålla koll? <a class='tlink' href='service.html'>Läs om vårt serviceavtal →</a></p>",
      author: "Hamza Samara",
      read_time: "3 min läsning",
      updated: "maj 2026",
      featured: false,
    },
    {
      slug: "vanliga-fragor-kompetensbevis",
      title: "Vanliga frågor om kompetensbevis i HLR",
      category: "Kompetensbevis",
      excerpt: "Hur det fungerar, giltighet och repetition. Svar på de vanligaste frågorna om kompetensbevis i hjärt-lungräddning.",
      body: "<p>När du genomgått en godkänd HLR-utbildning får du ett kompetensbevis. Här svarar vi på de vanligaste frågorna.</p><h2 class='h2'>Hur länge gäller kompetensbeviset?</h2><p>Svenska Rådet för Hjärt-Lungräddning rekommenderar repetitionsutbildning vartannat år. Vissa arbetsgivare och försäkringsbolag kan ha egna krav – stäm av med er verksamhet.</p><h2 class='h2'>Kan jag få intyg direkt?</h2><p>Ja, du får ditt kompetensbevis direkt i anslutning till kursen. Det kan utfärdas digitalt eller fysiskt beroende på kursen.</p><h2 class='h2'>Räknas alla kurser?</h2><p>Kursen ska följa Svenska Rådet för HLR:s riktlinjer för att kompetensbeviset ska vara giltigt. Alla PulsAkademins kurser uppfyller dessa krav.</p><h2 class='h2'>Vad kostar en repetitionskurs?</h2><p>Vi erbjuder kortare repetitionskurser till reducerat pris för er som redan gått en grundkurs hos oss. <a class='tlink' href='boka.html'>Se kurser och priser →</a></p>",
      author: "Hamza Samara",
      read_time: "4 min läsning",
      updated: "maj 2026",
      featured: false,
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  Utility helpers                                                     */
  /* ------------------------------------------------------------------ */

  function escHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getSlug(article) {
    return article.slug || "";
  }
  function getTitle(article) {
    return article.title || "";
  }
  function getCategory(article) {
    return article.category || article.cat || "";
  }
  function getExcerpt(article) {
    return article.excerpt || article.body_preview || article.body || "";
  }
  function getBody(article) {
    return article.body || article.body_html || "";
  }
  function getAuthor(article) {
    return article.author || article.author_name || "PulsAkademin";
  }
  function getReadTime(article) {
    return article.read_time || article.read_minutes
      ? (article.read_minutes ? article.read_minutes + " min läsning" : article.read_time)
      : "5 min läsning";
  }
  function getUpdated(article) {
    return article.updated || (article.updated_at ? formatDate(article.updated_at) : "maj 2026");
  }
  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  KUNSKAPSBANK PAGE                                                   */
  /* ------------------------------------------------------------------ */

  function initKunskapsbank() {
    var grid = document.getElementById("artGrid");
    if (!grid) return;

    // Active category filter
    var activeCategory = "Alla";
    var chips = document.querySelectorAll(".pillrow .chip");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("chip--active"); });
        chip.classList.add("chip--active");
        activeCategory = chip.textContent.trim();
        renderGrid(allArticles, activeCategory);
      });
    });

    var allArticles = [];

    PA.db.listArticles().then(function (remoteArticles) {
      allArticles = (remoteArticles && remoteArticles.length > 0)
        ? remoteArticles
        : FALLBACK_ARTICLES;

      // Update featured article link with first featured or first article slug
      var featured = allArticles.find(function (a) { return a.featured; }) || allArticles[0];
      if (featured) {
        var featuredLink = document.querySelector(".section a.card[href='artikel.html']");
        if (featuredLink) {
          featuredLink.href = "artikel.html?slug=" + encodeURIComponent(getSlug(featured));
          var featuredBadge = featuredLink.querySelector(".badge");
          if (featuredBadge) featuredBadge.textContent = "Utvald · " + getCategory(featured);
          var featuredH2 = featuredLink.querySelector(".h2");
          if (featuredH2) featuredH2.textContent = getTitle(featured);
          var featuredLead = featuredLink.querySelector(".lead");
          if (featuredLead) featuredLead.textContent = getExcerpt(featured).slice(0, 140) + (getExcerpt(featured).length > 140 ? "…" : "");
        }
      }

      renderGrid(allArticles, activeCategory);
    }).catch(function () {
      allArticles = FALLBACK_ARTICLES;
      renderGrid(allArticles, activeCategory);
    });

    function renderGrid(articles, cat) {
      var filtered = (cat === "Alla")
        ? articles
        : articles.filter(function (a) { return getCategory(a) === cat; });

      // Exclude the featured article from the grid (it already shows above)
      var featured = articles.find(function (a) { return a.featured; }) || articles[0];
      var gridArticles = filtered.filter(function (a) {
        return !(featured && getSlug(a) === getSlug(featured) && cat === "Alla");
      });

      if (gridArticles.length === 0) {
        grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center;padding:40px 0">Inga artiklar i den här kategorin.</p>';
        return;
      }

      grid.innerHTML = gridArticles.map(function (a) {
        var slug = getSlug(a);
        var title = escHtml(getTitle(a));
        var cat = escHtml(getCategory(a));
        var excerpt = escHtml(getExcerpt(a).slice(0, 110) + (getExcerpt(a).length > 110 ? "…" : ""));
        var img = a.img ? escHtml(a.img) : (getTitle(a).split(" ").slice(0, 2).join(" "));
        return (
          '<a class="card card--hover" href="artikel.html?slug=' + encodeURIComponent(slug) + '">' +
          '<div class="ph ph--16x9"><span>' + (a.img ? '' : 'Bild: ' + img) + (a.img ? '<img src="' + img + '" alt="' + title + '" style="width:100%;height:100%;object-fit:cover">' : '') + '</span></div>' +
          '<div class="card__body"><span class="badge mb-8">' + cat + '</span>' +
          '<h3 class="h3" style="font-size:1.2rem">' + title + '</h3>' +
          '<p class="muted mt-8" style="font-size:14px">' + excerpt + '</p>' +
          '<span class="tlink mt-16" style="font-size:14.5px">Läs mer →</span>' +
          '</div></a>'
        );
      }).join("");
    }
  }

  /* ------------------------------------------------------------------ */
  /*  ARTIKEL PAGE                                                        */
  /* ------------------------------------------------------------------ */

  function initArtikel() {
    var articleRoot = document.getElementById("articleRoot");
    if (!articleRoot) return;

    var params = new URLSearchParams(window.location.search);
    var slugParam = params.get("slug");

    PA.db.listArticles().then(function (remoteArticles) {
      var articles = (remoteArticles && remoteArticles.length > 0)
        ? remoteArticles
        : FALLBACK_ARTICLES;

      var article;
      if (slugParam) {
        article = articles.find(function (a) { return getSlug(a) === slugParam; });
      }
      if (!article) {
        article = articles.find(function (a) { return a.featured; }) || articles[0];
      }

      if (!article) {
        articleRoot.innerHTML = '<div class="container article"><p class="muted">Artikeln hittades inte. <a class="tlink" href="kunskapsbank.html">Tillbaka till kunskapsbanken</a></p></div>';
        return;
      }

      renderArticle(article, articles);
    }).catch(function () {
      var articles = FALLBACK_ARTICLES;
      var article;
      if (slugParam) {
        article = articles.find(function (a) { return getSlug(a) === slugParam; });
      }
      if (!article) {
        article = articles.find(function (a) { return a.featured; }) || articles[0];
      }
      renderArticle(article, articles);
    });
  }

  function renderArticle(article, allArticles) {
    var articleRoot = document.getElementById("articleRoot");

    // Update <title> and <meta>
    document.title = escHtml(getTitle(article)) + " | PulsAkademin";
    var metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) metaDesc.setAttribute("content", getExcerpt(article).slice(0, 155));

    // Build body HTML: prefer stored HTML, else wrap plain text
    var bodyHtml = getBody(article);
    if (!bodyHtml && getExcerpt(article)) {
      bodyHtml = "<p>" + escHtml(getExcerpt(article)) + "</p>";
    }

    // Related articles (excluding current)
    var related = allArticles.filter(function (a) { return getSlug(a) !== getSlug(article); }).slice(0, 3);
    var relatedHtml = related.map(function (a) {
      return (
        '<a class="card card--hover" href="artikel.html?slug=' + encodeURIComponent(getSlug(a)) + '">' +
        '<div class="ph ph--16x9"><span>' + escHtml(getTitle(a).split(" ").slice(0, 3).join(" ")) + '</span></div>' +
        '<div class="card__body"><span class="badge mb-8">' + escHtml(getCategory(a)) + '</span>' +
        '<h3 class="h3" style="font-size:1.2rem">' + escHtml(getTitle(a)) + '</h3>' +
        '</div></a>'
      );
    }).join("");

    articleRoot.innerHTML =
      '<section class="pagehead"><div class="container article">' +
      '  <nav class="crumbs mb-24"><a href="index.html">Hem</a><span class="sep">/</span><a href="kunskapsbank.html">Kunskapsbank</a><span class="sep">/</span><span>' + escHtml(getCategory(article)) + '</span></nav>' +
      '  <span class="badge badge--coral mb-16">' + escHtml(getCategory(article)) + '</span>' +
      '  <h1 class="h1" style="margin:8px 0 18px">' + escHtml(getTitle(article)) + '</h1>' +
      '  <div class="flex gap-16 center muted" style="font-size:14px"><span>Av ' + escHtml(getAuthor(article)) + '</span><span>·</span><span>' + escHtml(getReadTime(article)) + '</span><span>·</span><span>Uppdaterad ' + escHtml(getUpdated(article)) + '</span></div>' +
      '</div></section>' +
      '<section class="section" style="padding-top:8px">' +
      '  <div class="container article">' +
      '    <div class="ph ph--16x9 mb-32" style="border-radius:var(--r-lg)"><span>' + escHtml(getTitle(article)) + '</span></div>' +
      '    <p class="lead">' + escHtml(getExcerpt(article)) + '</p>' +
      '    <div class="article-body mt-24">' + bodyHtml + '</div>' +
      '    <div class="card bg-bordeaux mt-48" style="border:0"><div class="card__body split center" style="padding:clamp(24px,3vw,40px)">' +
      '      <div><h3 class="h3" style="color:var(--cream)">Vill ni lära er på riktigt?</h3><p style="color:rgba(251,246,240,.8);margin-top:8px">Boka en praktisk HLR-kurs med hjärtstartare – för er grupp eller arbetsplats.</p></div>' +
      '      <a class="btn btn--primary" href="boka.html" style="white-space:nowrap">Boka kurs →</a>' +
      '    </div></div>' +
      '  </div>' +
      '</section>' +
      (related.length > 0
        ? '<section class="section bg-cream2">' +
          '  <div class="container">' +
          '    <div class="sec-head"><div class="sec-head__txt"><h2 class="h2">Läs vidare</h2></div><a class="tlink" href="kunskapsbank.html">Till kunskapsbanken →</a></div>' +
          '    <div class="grid cols-3">' + relatedHtml + '</div>' +
          '  </div>' +
          '</section>'
        : '');
  }

  /* ------------------------------------------------------------------ */
  /*  SHARED FORM HELPERS                                                 */
  /* ------------------------------------------------------------------ */

  function fieldVal(form, name) {
    var el = form.querySelector("[name='" + name + "']");
    return el ? (el.value || "").trim() : "";
  }

  function showFormError(box, msg) {
    if (!box) return;
    box.textContent = msg;
    box.removeAttribute("hidden");
    box.style.display = "";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearFormError(box) {
    if (!box) return;
    box.textContent = "";
    box.setAttribute("hidden", "");
    box.style.display = "none";
  }

  function showConfirmation(formWrapper, html) {
    formWrapper.innerHTML =
      '<div class="conf-box" role="alert" aria-live="polite">' +
      '  <div class="conf-icon" aria-hidden="true">&#10003;</div>' +
      '  <div>' + html + '</div>' +
      '</div>';
  }

  function setBtnPending(btn, pending) {
    btn.disabled = pending;
    if (pending) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Skickar…";
    } else {
      btn.textContent = btn.dataset.originalText || btn.textContent;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  HYR PAGE                                                            */
  /* ------------------------------------------------------------------ */

  function initHyr() {
    var form = document.getElementById("hyrForm");
    if (!form) return;

    var btn = form.querySelector("button[type='submit'], button.btn--primary");
    var errorBox = document.getElementById("hyrError");
    var consentCb = form.querySelector("input[type='checkbox']");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearFormError(errorBox);

      // Validate required fields
      var errors = [];
      var nameVal = fieldVal(form, "contact_name");
      var emailVal = fieldVal(form, "email");
      var phoneVal = fieldVal(form, "phone");
      var startDate = fieldVal(form, "start_date");
      var endDate = fieldVal(form, "end_date");
      var city = fieldVal(form, "city");
      var purpose = fieldVal(form, "message");

      if (!nameVal) errors.push("Namn / företag saknas");
      if (!emailVal || !emailVal.includes("@")) errors.push("Ange en giltig e-postadress");
      if (!phoneVal) errors.push("Telefonnummer saknas");
      if (!city) errors.push("Leveransort saknas");
      if (!consentCb || !consentCb.checked) errors.push("Du måste samtycka till personuppgiftsbehandling");

      if (errors.length) {
        showFormError(errorBox, errors.join(" · "));
        return;
      }

      var units = fieldVal(form, "units") || "1";
      var datePart = startDate && endDate ? (startDate + " – " + endDate) : (startDate || "");
      var messageText = [
        purpose,
        datePart ? ("Period: " + datePart) : "",
        "Antal enheter: " + units,
        "Leveransort: " + city,
      ].filter(Boolean).join("\n");

      setBtnPending(btn, true);

      try {
        await PA.db.createQuote({
          company_name: nameVal,
          org_number: null,
          contact_name: nameVal,
          email: emailVal,
          phone: phoneVal,
          course_interest: "Hyra hjärtstartare",
          participant_count: parseInt(units, 10) || 1,
          city: city,
          preferred_date: startDate || null,
          location_pref: null,
          message: messageText,
        });
        showConfirmation(form.closest(".card") || form,
          '<h3 class="h3 mb-8">Tack för din förfrågan!</h3>' +
          '<p>Vi återkommer med ett hyresförslag inom en arbetsdag. Har du brådskande frågor kan du ringa oss direkt på <a class="tlink" href="tel:0293761011">029-376 10 11</a>.</p>'
        );
      } catch (err) {
        setBtnPending(btn, false);
        showFormError(errorBox, err.message || "Något gick fel. Försök igen eller ring oss direkt.");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  SERVICE PAGE                                                        */
  /* ------------------------------------------------------------------ */

  function initService() {
    var form = document.getElementById("serviceForm");
    if (!form) return;

    var btn = form.querySelector("button[type='submit'], button.btn--primary");
    var errorBox = document.getElementById("serviceError");
    var consentCb = form.querySelector("input[type='checkbox']");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearFormError(errorBox);

      var errors = [];
      var company = fieldVal(form, "company_name");
      var contact = fieldVal(form, "contact_name");
      var emailVal = fieldVal(form, "email");
      var phoneVal = fieldVal(form, "phone");
      var units = fieldVal(form, "units");
      var model = fieldVal(form, "model");
      var plan = fieldVal(form, "plan");

      if (!company && !contact) errors.push("Företag eller kontaktperson krävs");
      if (!emailVal || !emailVal.includes("@")) errors.push("Ange en giltig e-postadress");
      if (!phoneVal) errors.push("Telefonnummer saknas");
      if (!consentCb || !consentCb.checked) errors.push("Du måste samtycka till personuppgiftsbehandling");

      if (errors.length) {
        showFormError(errorBox, errors.join(" · "));
        return;
      }

      var messageText = [
        "Önskat avtal: " + (plan || "Full service"),
        model ? ("Modell(er): " + model) : "",
        units ? ("Antal hjärtstartare: " + units) : "",
      ].filter(Boolean).join("\n");

      setBtnPending(btn, true);

      try {
        await PA.db.createQuote({
          company_name: company || contact,
          org_number: null,
          contact_name: contact || company,
          email: emailVal,
          phone: phoneVal,
          course_interest: "Service & underhåll",
          participant_count: parseInt(units, 10) || 1,
          city: null,
          preferred_date: null,
          location_pref: null,
          message: messageText,
        });
        showConfirmation(form.closest(".card") || form,
          '<h3 class="h3 mb-8">Tack för din förfrågan!</h3>' +
          '<p>Vi skickar ett avtalsförslag till <strong>' + escHtml(emailVal) + '</strong> inom en arbetsdag. Frågor? Ring oss på <a class="tlink" href="tel:0293761011">029-376 10 11</a>.</p>'
        );
      } catch (err) {
        setBtnPending(btn, false);
        showFormError(errorBox, err.message || "Något gick fel. Försök igen eller ring oss direkt.");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  BOOT                                                               */
  /* ------------------------------------------------------------------ */

  function boot() {
    initKunskapsbank();
    initArtikel();
    initHyr();
    initService();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
