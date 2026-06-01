# Bildprompts för PulsAkademin.se

Alla prompts är skrivna på **engelska** (bäst för Gemini / Imagen).
Varje bild har en **svensk etikett** (var den används), **bildformat** och en färdig prompt.

---

## ⭐ Gemensam stil (klistra in FÖRE varje fotoprompt för enhetlig look)

> **STYLE:** Photorealistic Swedish medical-education brand photography. Warm, human and trustworthy mood. Natural soft daylight, shallow depth of field, authentic candid moment (not staged or "stocky"), real diverse Swedish people of mixed ages. Warm color grade with subtle deep-red/bordeaux (#8E1B2E) and cream (#FBF6F0) tones, a hint of coral (#FF5640). Clean, uncluttered, professional. No text, no watermarks, no logos, no brand names.

För **produktbilder** använd istället denna stil-rad:

> **STYLE:** Clean e-commerce studio product photography on a soft off-white / cream seamless background (#FBF6F0). Even, soft diffused lighting, subtle natural shadow, product centered and sharp, high detail. No text, no watermark, no logo, no brand markings.

---

# A. Foto – Hero & stora sektioner

**A1 — Startsida, hero** · `index.html` · format **4:3 (liggande)**
> A certified female instructor in a calm community room guiding two adult course participants performing CPR chest compressions on a training manikin on the floor. Hands-on, focused but warm atmosphere. A red AED trainer device visible nearby. Soft window daylight.

**A2 — Startsida + "För företag", och Företagssidans hero** · `index.html`, `foretag.html` · format **4:3**
> A workplace first-aid training session in a modern Scandinavian office. An instructor demonstrates CPR on a manikin while a small group of colleagues in casual business clothes watch and practice. Bright, airy room, plants, daylight.

**A3 — Webbshop, hero** · `webbshop.html` · format **4:3**
> A wall-mounted automated external defibrillator (AED) in a clean white indoor cabinet with a green heart-and-cross sign, mounted on a calm light-grey wall in a public building lobby. Clean, reassuring, well-lit.

**A4 — Hyr hjärtstartare, hero** · `hyr.html` · format **4:3**
> A portable AED defibrillator in an open carry bag placed on a table at an outdoor sports event, blurred crowd and tents in the background. Daylight, sense of readiness and safety.

**A5 — Service & underhåll, hero** · `service.html` · format **4:3**
> Close-up of a technician's hands in light gloves inspecting and replacing the electrode pads and battery of an AED defibrillator on a clean workbench. Focused, professional, soft light.

**A6 — Om oss, mission** · `om-oss.html` · format **4:3**
> A warm portrait-style moment of a CPR instructor kneeling beside a course participant, encouraging them during hands-on manikin practice. Genuine connection, soft daylight, community setting.

**A7 — Team, kvalitetssäkring** · `team.html` · format **4:3**
> A CPR instructor leading a small training exercise, pointing at a manikin while participants gather around attentively. Realistic Swedish training-room setting, daylight.

**A8 — Artikel, toppbild** · `artikel.html` · format **16:9 (liggande)**
> A bystander opening and switching on an AED defibrillator next to a person lying on the ground, about to place the electrode pads. Tense but hopeful real-life rescue scene, public indoor setting, natural light. Respectful, not graphic.

---

# B. Team-porträtt · `team.html` · format **3:4 (stående)**

**B1 — Hamza Samara (instruktör HLR & S-HLR)**
> Professional friendly portrait of a man in his 30s with short dark hair, light beard, wearing a dark polo or simple shirt, against a soft warm bordeaux-tinted background. Approachable confident smile, looking at camera, soft studio light. Head and shoulders.

**B2 — Sara Mahmud (utbildnings- & kvalitetsansvarig)**
> Professional friendly portrait of a woman in her 30s, warm confident expression, wearing a simple smart-casual top, against a soft warm cream background. Soft studio light, looking at camera. Head and shoulders.

**B3 — "Vill du bli instruktör?" (valfri)**
> Optional: a bright, welcoming photo of an empty training room with manikins and AED trainers neatly arranged, symbolizing "join our team". Or leave as a simple illustrated placeholder.

---

# C. Kurskort (8 st) · används på `index.html`, `utbildningar.html`, m.fl. · format **16:9**

**C1 — HLR vuxen**
> Hands performing CPR chest compressions on an adult training manikin, instructor's hands guiding. Close, practical, warm light.

**C2 — HLR barn**
> Gentle CPR demonstration on an infant/child training manikin, two fingers technique, caring atmosphere. Parents/preschool staff context.

**C3 — S-HLR vuxen (sjukvård)**
> Healthcare professionals in scrubs practicing advanced CPR as a team around a manikin with a defibrillator and bag-valve mask. Clinical training room.

**C4 — Första hjälpen & HLR**
> A first-aid training scene: someone applying a bandage / recovery position practice, with a first-aid kit open nearby. Workplace setting.

**C5 — Grundläggande brandskydd**
> A person practicing using a red fire extinguisher on a small controlled training flame outdoors, instructor supervising. Safe, practical.

**C6 — Krishantering & beredskap**
> A calm group workshop around a table discussing emergency preparedness, a whiteboard with simple diagrams, supportive atmosphere. Office/community room.

**C7 — Hot, våld & aggressivt beteende**
> A professional de-escalation training workshop, two people role-playing a calm conversation while a facilitator observes. Respectful, non-violent, office setting.

**C8 — Repetition HLR vuxen & barn**
> A short refresher CPR session, an adult quickly practicing compressions on a manikin, checking a timer. Bright, efficient mood.

---

# D. Produktfoton

> ⚠️ **OBS:** D1–D6 är riktiga varumärkesprodukter (Smarty Saver, DefiSign, Philips m.fl.). AI-modeller återger sällan exakta modeller korrekt — använd helst tillverkarens/leverantörens officiella produktbilder. Prompts nedan ger en *generisk* AED om du ändå vill generera.

**D1 — Hjärtstartare (generisk AED)** · `produkt.html`, kort på flera sidor · format **1:1 (kvadrat)**
> A modern semi-automatic AED defibrillator, white and red casing with a green heart symbol and two electrode pad icons, clean studio shot, centered, soft shadow on cream background.

**D2 — Produktdetalj galleri (4 vinklar)** · `produkt.html` · format **1:1**
> Same AED defibrillator shown from four angles: (1) front closed, (2) open with electrode pads visible, (3) side profile, (4) in use being held in a hand. Consistent cream studio background, e-commerce style.

**D3 — Batteri till hjärtstartare** · `produkt.html`, `kundvagn.html` · format **1:1**
> A replacement battery pack for an AED defibrillator, compact rectangular medical battery, clean studio shot on cream background, centered.

**D4 — Elektroder (defibrillator pads)** · format **1:1**
> A pair of adult AED defibrillation electrode pads with cables and connector, sealed and partly shown, clean studio shot on cream background.

**D5 — Skåp / utomhusskåp** · format **1:1**
> A wall-mounted outdoor AED cabinet, white with green heart-cross sign, lockable door with small window and alarm light, clean studio shot on cream background.

**D6 — Väska till hjärtstartare** · format **1:1**
> A soft protective carry bag for an AED defibrillator, durable fabric with red and grey detailing and a shoulder strap, clean studio shot on cream background.

**D7 — Väggskylt AED** · `kundvagn.html` · format **1:1**
> A green wall sign with a white heart and lightning-bolt AED symbol and a directional arrow, clean studio shot on cream background.

---

# E. Webbshop – kategori- & paketbilder

### Kategorikort · `webbshop.html` · format **5:4**
**E1 Hjärtstartare** → generic AED on cream (se D1)
**E2 Batterier** → se D3
**E3 Elektroder** → se D4
**E4 Skåp & fästen** → se D5
**E5 Väskor** → se D6
**E6 Paketlösningar**
> A neat flat-lay group of AED essentials together: a defibrillator, a wall cabinet, electrode pads and a sign, arranged tidily on a cream surface, top-down studio shot.
**E7 Service & underhåll** → se A5 (tekniker)
**E8 Hyr hjärtstartare** → se A4 (event)

### Paketkort · `webbshop.html` · format **16:10**
**E9 — Startpaket företag**
> An AED defibrillator, an indoor wall cabinet and a small sign arranged together as a company starter kit on a cream surface, soft studio light.

**E10 — Utomhuspaket**
> A rugged AED defibrillator next to a heated outdoor cabinet with alarm and keypad, arranged as an outdoor safety kit, cream studio background.

**E11 — Skol- & föreningspaket**
> An AED with child-mode pads and a simple wall bracket arranged as a school/sports-club kit, friendly and approachable, cream studio background.

---

# F. Kunskapsbank – artikelbilder · format **16:9**

**F1 — Utvald: "Så använder du en hjärtstartare"** · `kunskapsbank.html`
> A calm step-by-step scene of a person using an AED on a manikin during training, electrode pads being placed, clear and instructive. (Samma tema som A8 men lugnare, träningsmiljö.)

**F2 — Vad är HLR (HLR-grunder)**
> Close hands-on CPR compressions on an adult manikin, instructor guiding hand position.

**F3 — Helautomatisk vs halvautomatisk AED**
> Two AED defibrillators side by side on a cream surface, one with a clear "shock" button highlighted, comparison studio shot.

**F4 — Så ofta ska elektroder bytas**
> AED electrode pads with a visible expiry-date label, close-up on cream background.

**F5 — HLR på barn vs vuxna**
> Split-feel image: gentle infant manikin CPR on one side and adult manikin CPR on the other, caring training context.

**F6 — Första hjälpen på arbetsplatsen**
> An open workplace first-aid kit on a desk with a colleague tending to another's hand, office setting.

**F7 — Checklista för arbetsplatsen**
> A clipboard checklist next to a wall-mounted AED cabinet, someone ticking items, workplace safety context.

**F8 — Vanliga frågor om kompetensbevis**
> A person holding a printed CPR competence certificate / looking at a digital certificate on a phone, warm light.

**F9 — Var ska hjärtstartaren placeras?**
> A clearly visible wall-mounted AED cabinet with a directional sign in a public corridor, well-lit.

**F10 — Stabilt sidoläge**
> A first-aider gently placing a conscious volunteer into the recovery position on the floor, calm and instructive.

---

# G. Övrigt (ej AI-genererat)

**G1 — Karta** · `kontakt.html`
> Inte en genererad bild. Bädda in Google Maps / OpenStreetMap för **Centralgatan 14, 815 38 Tierp**. (Adressen bör verifieras först — handovern nämner att olika adresser/nummer förekommer idag.)

**G2 — Kundlogotyper (4 st)** · `om-oss.html` · format **5:2**
> Inte AI-genererat. Använd riktiga logotyper från referenskunder (med deras tillstånd). Lägg dem på vit/transparent bakgrund, gråskala för enhetlig look.

**G3 — PulsAkademin egen logotyp**
> Ritas redan som SVG i sajten (hjärt-puls/EKG-symbol). Vill du ha en "riktig" logotyp kan en designer vektorisera EKG-märket + ordmärket "PulsAkademin".

---

## Tips för enhetliga bilder i Gemini
1. Klistra in **stil-raden** först, sedan den specifika prompten.
2. Lägg gärna till `--ar 16:9` (eller motsvarande) eller skriv "aspect ratio 16:9" om verktyget stödjer det.
3. Generera 3–4 varianter per bild och välj den mest naturliga (undvik "stocky"/överposerade).
4. Be om "no text, no logos" så slipper du felstavad svensk text i bilden.
5. Håll **samma person** (Hamza/Sara) konsekvent genom att återanvända en godkänd bild som referens om verktyget stödjer bildreferens.
