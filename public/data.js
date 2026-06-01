/* PulsAkademin — shared demo data for hi-fi pages */
const PA_COURSES = [
  { title:"HLR vuxen", slug:"hlr-vuxen", cat:"HLR", desc:"Grundläggande hjärt-lungräddning på vuxna med träning på docka och hjärtstartare.", dur:"2 timmar", aud:"Alla", price:"699 kr", priceUnit:"/person", img:"Bild: HLR vuxen" },
  { title:"HLR barn", slug:"hlr-barn", cat:"HLR", desc:"HLR anpassad för spädbarn och barn – för föräldrar, förskola och skola.", dur:"2 timmar", aud:"Alla", price:"699 kr", priceUnit:"/person", img:"Bild: HLR barn" },
  { title:"S-HLR vuxen", slug:"s-hlr-vuxen", cat:"S-HLR", desc:"Sjukvårds-HLR med hjärtstartare och teamarbete för vårdpersonal.", dur:"3 timmar", aud:"Vårdpersonal", price:"Offert", priceUnit:"", img:"Bild: S-HLR" },
  { title:"Första hjälpen & HLR", slug:"forsta-hjalpen", cat:"Första hjälpen", desc:"Första hjälpen-åtgärder kombinerat med HLR och hjärtstartare.", dur:"Halvdag", aud:"Företag", price:"Från 995 kr", priceUnit:"/person", img:"Bild: Första hjälpen" },
  { title:"Grundläggande brandskydd", slug:"brandskydd", cat:"Brandskydd", desc:"Förebyggande brandskydd, släckutrustning och utrymning i praktiken.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Brandskydd" },
  { title:"Krishantering & beredskap", slug:"krishantering", cat:"Kris", desc:"Krisberedskap och första psykologiska hjälpen för arbetsplatsen.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Krishantering" },
  { title:"Hot, våld & aggressivt beteende", slug:"hot-vald", cat:"Säkerhet", desc:"Förebygga och hantera hotfulla situationer och aggressivt beteende.", dur:"Halvdag", aud:"Företag", price:"Offert", priceUnit:"", img:"Bild: Hot & våld" },
  { title:"Repetition HLR vuxen & barn", slug:"repetition", cat:"Repetition", desc:"Kort uppdateringskurs för att hålla kompetensbeviset aktuellt.", dur:"1 timme", aud:"Alla", price:"499 kr", priceUnit:"/person", img:"Bild: Repetition" },
];

const PA_DATES = [
  { course:"HLR vuxen", city:"Stockholm", venue:"Kungsgatan 12", date:"12 jun 2026", time:"09:00–11:00", price:"699 kr", seats:8, instr:"Hamza Samara" },
  { course:"HLR barn", city:"Uppsala", venue:"Dragarbrunnsg. 3", date:"14 jun 2026", time:"13:00–15:00", price:"699 kr", seats:3, instr:"Sara Mahmud" },
  { course:"S-HLR vuxen", city:"Tierp", venue:"Centralgatan 14", date:"18 jun 2026", time:"09:00–12:00", price:"Offert", seats:6, instr:"Hamza Samara" },
  { course:"Första hjälpen & HLR", city:"Göteborg", venue:"Avenyn 21", date:"20 jun 2026", time:"09:00–13:00", price:"995 kr", seats:0, instr:"Sara Mahmud" },
  { course:"HLR vuxen", city:"Gävle", venue:"Norra Kungsg. 5", date:"24 jun 2026", time:"17:00–19:00", price:"699 kr", seats:12, instr:"Hamza Samara" },
  { course:"Repetition HLR", city:"Stockholm", venue:"Kungsgatan 12", date:"27 jun 2026", time:"12:00–13:00", price:"499 kr", seats:2, instr:"Sara Mahmud" },
  { course:"HLR barn", city:"Göteborg", venue:"Avenyn 21", date:"2 jul 2026", time:"09:00–11:00", price:"699 kr", seats:9, instr:"Sara Mahmud" },
  { course:"S-HLR barn", city:"Uppsala", venue:"Dragarbrunnsg. 3", date:"5 jul 2026", time:"13:00–16:00", price:"Offert", seats:5, instr:"Hamza Samara" },
];

const PA_PRODUCTS = [
  { name:"Smarty Saver Halvautomatisk", usp:"Barnläge · IP56 · 10 års garanti", price:"11 999 kr", priceEx:"9 599 kr", badges:["Populär","Barnläge"], stock:"I lager", brand:"Smarty Saver", img:"Bild: Smarty Saver" },
  { name:"DefiSign LIFE AED", usp:"Pekskärm med guidning · Hel-/halvautomatisk", price:"18 499 kr", priceEx:"14 799 kr", badges:["Skärm"], stock:"I lager", brand:"DefiSign", img:"Bild: DefiSign LIFE" },
  { name:"Philips HeartStart HS1", usp:"Marknadsledande · Enkel & pålitlig", price:"19 999 kr", priceEx:"15 999 kr", badges:["Bästsäljare"], stock:"Få i lager", brand:"Philips", img:"Bild: Philips HS1" },
  { name:"Primedic HeartSave AED", usp:"Robust · För utomhusbruk", price:"14 999 kr", priceEx:"11 999 kr", badges:["Utomhus"], stock:"I lager", brand:"Primedic", img:"Bild: Primedic" },
  { name:"CU Medical iPAD SP1", usp:"Automatisk barn-/vuxenläge", price:"13 499 kr", priceEx:"10 799 kr", badges:["Barnläge"], stock:"I lager", brand:"CU Medical", img:"Bild: CU Medical SP1" },
  { name:"Mindray BeneHeart C1A", usp:"Kompakt · QR-guidning i realtid", price:"15 999 kr", priceEx:"12 799 kr", badges:["Nyhet"], stock:"I lager", brand:"Mindray", img:"Bild: Mindray C1A" },
];

const PA_FAQ = [
  { q:"Hur lång är en HLR-kurs?", a:"En grundläggande HLR-kurs tar cirka 2 timmar. Första hjälpen och kombinationskurser är ofta en halvdag. Repetitionsutbildning kan göras på en timme." },
  { q:"Får man intyg efter kursen?", a:"Ja. Efter genomförd utbildning registreras deltagarna och får ett digitalt kompetensbevis enligt HLR-rådets riktlinjer." },
  { q:"Kan ni komma till vår arbetsplats?", a:"Absolut. Vi utbildar gärna på plats hos er, i vår lokal eller på valfri ort i Sverige. Begär en offert så återkommer vi med upplägg och pris." },
  { q:"Vad kostar det?", a:"HLR vuxen och barn kostar 699 kr per person, repetition 499 kr. Företagsutbildning och S-HLR offereras utifrån antal deltagare, plats och upplägg." },
  { q:"Behöver man förkunskaper?", a:"Nej. Våra grundkurser är till för alla – inga medicinska förkunskaper krävs. Vi anpassar tempot efter gruppen." },
  { q:"Vad är skillnaden mellan HLR och S-HLR?", a:"HLR är grundläggande hjärt-lungräddning för allmänheten. S-HLR (sjukvårds-HLR) är en fördjupning för vårdpersonal med fokus på teamarbete, läkemedel och avancerad utrustning." },
  { q:"Hur väljer man rätt hjärtstartare?", a:"Det beror på miljö (inne/ute), om barn vistas på platsen och budget. Använd vår köpguide eller kontakta oss – vi hjälper er att hitta rätt modell, skåp och utbildning." },
];
