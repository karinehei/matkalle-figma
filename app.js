import {
  ORIGINS,
  DESTINATIONS,
  STEPS,
  normalizeState,
  stateFromHash,
  hashFromState,
  originFor,
  destinationFor,
  routesFor,
  selectedRoute,
  ticketFor,
  euro,
  reduceJourney,
} from './model.js';

const app = document.querySelector('#app');
let state = stateFromHash(location.hash);
let paymentFailed = false;

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function sessionGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

let events = [];
try {
  events = JSON.parse(sessionGet('matkalle-events') || '[]');
  if (!Array.isArray(events)) events = [];
} catch {}

let tracking = sessionGet('matkalle-tracking') === 'yes';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}

function announce(message) {
  document.querySelector('#announcement').textContent = message;
}

function track(name, details = {}) {
  if (!tracking) return;
  events.push({ name, at: new Date().toISOString(), ...details });
  try {
    sessionStorage.setItem('matkalle-events', JSON.stringify(events));
  } catch {}
}

function href(view, extra = {}) {
  return escapeHtml(hashFromState({ ...state, ...extra, view }));
}

function go(view, extra = {}) {
  state = normalizeState({ ...state, ...extra, view });
  const hash = hashFromState(state);
  if (location.hash === hash) render(true);
  else location.hash = hash;
}

function backButton(view, label = 'Takaisin') {
  return `<button class="back" type="button" data-go="${view}"><span aria-hidden="true">←</span> ${label}</button>`;
}

function stepper() {
  const index = STEPS.indexOf(state.view);
  const group = index <= 2 ? 0 : index <= 4 ? 1 : 2;
  const steps = ['Reitti', 'Lippu ja maksu', 'Vahvistus'].map((label, i) => {
    const className = i === group ? 'active' : i < group ? 'done' : '';
    const current = i === group ? ' aria-current="step"' : '';
    const marker = i < group ? '✓' : i + 1;
    return `<li class="${className}"${current}><b aria-hidden="true">${marker}</b>${label}</li>`;
  }).join('');

  return `<ol class="stepper" aria-label="Asioinnin vaiheet">${steps}</ol>`;
}

function badge(route) {
  return `<span class="line-badge ${route.tone}">${route.line}</span>`;
}

function journey() {
  const origin = originFor(state).label;
  const destination = destinationFor(state).label;
  return [
    '<div class="journey-summary">',
    `<strong>${origin} <span aria-hidden="true">→</span><span class="sr-only">määränpää</span> ${destination}</strong>`,
    `<span class="muted">Esimerkkipäivä 22.10.2026 · lähtö ${state.time}</span>`,
    '</div>',
  ].join('');
}

function mapSvg() {
  const route = selectedRoute(state);
  const airport = state.destination === 'airport';
  const kamppi = state.destination === 'kamppi';
  const destination = destinationFor(state).label;
  const routePath = airport
    ? 'M354 139 L328 105 L276 58 L239 26'
    : kamppi
      ? 'M354 139 L328 188 L350 263 L383 340 L417 402'
      : 'M354 139 L328 188 L266 211 L204 240 L155 258';
  const endX = airport ? 239 : kamppi ? 417 : 155;
  const endY = airport ? 26 : kamppi ? 402 : 258;
  const labelX = airport ? 45 : kamppi ? 305 : 33;
  const labelY = airport ? 31 : kamppi ? 420 : 276;
  const textX = airport ? 58 : kamppi ? 318 : 46;
  const textY = airport ? 57 : kamppi ? 446 : 302;
  const originLabel = state.origin === 'pasila' ? 'Pasilan asema' : 'Lähtöasema';
  const pillWidth = kamppi ? 100 : 102;

  return [
    '<svg class="map-svg" viewBox="0 0 620 500" role="img" aria-labelledby="map-title map-desc" xmlns="http://www.w3.org/2000/svg">',
    '<title id="map-title">Havainnollistava reittikartta</title>',
    `<desc id="map-desc">Lähtöpaikka ${originFor(state).label}, määränpää ${destination}. Kaaviokuva ei vastaa todellista karttaa. Reitin tekstiohjeet ovat reitin tiedoissa.</desc>`,
    '<defs><pattern id="blocks" width="94" height="85" patternTransform="rotate(-16)" patternUnits="userSpaceOnUse"><rect x="13" y="13" width="63" height="52" rx="8" fill="#d6e3d2"/><rect x="15" y="15" width="59" height="48" rx="7" fill="#dce7d7"/></pattern></defs>',
    '<rect width="620" height="500" fill="#eaf0e3"/>',
    '<rect width="620" height="500" fill="url(#blocks)"/>',
    '<path d="M0 282 Q61 267 88 326 Q105 363 148 376 Q174 400 153 447 L119 500 H0Z" fill="#d7e9ea"/>',
    '<path d="M620 315 Q546 298 523 355 Q505 395 451 407 Q443 458 395 500 H620Z" fill="#d7e9ea"/>',
    '<path d="M68 0 Q70 115 153 176 Q186 210 170 280 Q157 337 211 500" stroke="#bfd5b2" stroke-width="43" fill="none"/>',
    '<path d="M560 30 Q440 40 431 136 Q418 184 365 204 Q337 233 350 275" stroke="#c6dab7" stroke-width="50" fill="none"/>',
    '<g fill="none" stroke="#fcfdf8" stroke-width="12">',
    '<path d="M-20 102 L650 302"/>',
    '<path d="M0 205 L620 405"/>',
    '<path d="M0 345 L620 124"/>',
    '<path d="M202 -20 L368 520"/>',
    '<path d="M352 -20 L516 520"/>',
    '<path d="M100 -20 L263 520"/>',
    '</g>',
    '<g fill="none" stroke="#c9d3bf" stroke-width="2">',
    '<path d="M0 151 L620 350"/>',
    '<path d="M0 282 L620 61"/>',
    '<path d="M145 0 L309 500"/>',
    '<path d="M410 0 L565 500"/>',
    '</g>',
    '<g font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13" fill="#6c806c" letter-spacing="1.3">',
    '<text x="326" y="95">PASILA</text>',
    '<text x="62" y="221">MEILAHTI</text>',
    '<text x="320" y="336">TÖÖLÖ</text>',
    '<text x="418" y="452">KESKUSTA</text>',
    '</g>',
    '<path d="M354 139 L328 188 L266 211 L204 240 L155 258" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
    `<path d="${routePath}" fill="none" stroke="#124c43" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    '<circle cx="354" cy="139" r="12" fill="white" stroke="#124c43" stroke-width="5"/>',
    `<circle cx="${endX}" cy="${endY}" r="12" fill="#124c43" stroke="white" stroke-width="5"/>`,
    '<g font-family="Inter,Segoe UI,Arial,sans-serif">',
    `<rect x="370" y="115" width="159" height="42" rx="10" fill="white" stroke="#d0ddc8"/>`,
    `<text x="383" y="141" font-size="13" font-weight="600" fill="#173e37">${originLabel}</text>`,
    `<rect x="${labelX}" y="${labelY}" width="155" height="42" rx="10" fill="white" stroke="#d0ddc8"/>`,
    `<text x="${textX}" y="${textY}" font-size="13" font-weight="600" fill="#173e37">${destination}</text>`,
    `<rect x="254" y="200" width="${pillWidth}" height="33" rx="9" fill="#124c43"/>`,
    `<text x="269" y="221" font-size="12" font-weight="650" fill="white">${route.line} · ${route.minutes} min</text>`,
    '</g>',
    '</svg>',
  ].join('');
}

function mapPanel() {
  const collapsed = innerWidth <= 700;
  return [
    `<aside class="map-shell ${collapsed ? 'collapsed' : ''}" aria-label="Reitin karttakuva">`,
    '<div class="map-header">',
    '<h2>Matkasi yhdellä silmäyksellä</h2>',
    '<span>HAVAINNOLLISTAVA KAAVIO</span>',
    `<button type="button" class="map-toggle" aria-expanded="${innerWidth > 700}" data-action="toggle-map">Näytä karttakuva</button>`,
    '</div>',
    mapSvg(),
    '<div class="map-legend">',
    '<span class="legend-line" aria-hidden="true"></span>Valittu esimerkkireitti<br>',
    '<span class="muted">Tekstiohjeet reitin tiedoissa</span>',
    '</div>',
    '<p class="map-caption">Reitit, linjat ja sijainnit ovat esimerkkejä. Kaaviota ei voi käyttää navigointiin.</p>',
    '</aside>',
  ].join('');
}

function support() {
  const items = [
    ['↗', 'Reitti ja lippu yhdessä', 'Näet, millaisen lipun esimerkkimatkasi tarvitsee.'],
    ['≡', 'Myös ilman karttaa', 'Reitti on luettavissa vaiheittaisena tekstiohjeena.'],
    ['☆', 'Oman matkasi mukaan', 'Suosi vähäisempää kävelyä tai tallenna matka.'],
  ];

  return [
    '<div class="support-row">',
    ...items.map(([icon, title, text]) => [
      '<div class="support-item">',
      `<span class="support-icon" aria-hidden="true">${icon}</span>`,
      '<div>',
      `<strong>${title}</strong>`,
      `<p>${text}</p>`,
      '</div>',
      '</div>',
    ].join('')),
    '</div>',
  ].join('');
}

function intro(title, description, number) {
  return [
    '<div class="intro">',
    '<div>',
    '<div class="eyebrow">Reitistä oikeaan lippuun</div>',
    `<h1 id="view-heading" tabindex="-1">${title}</h1>`,
    `<p>${description}</p>`,
    '</div>',
    '<div class="chapter">',
    `<strong>${number || '01'}<span aria-hidden="true"> / </span>06</strong>`,
    'Yksi matka. Selkeä valinta.',
    '</div>',
    '</div>',
  ].join('');
}

function tools() {
  const status = tracking ? 'Keruu käytössä.' : 'Keruu pois käytöstä.';
  return [
    '<details class="test-tools">',
    '<summary>Portfolion testityökalut</summary>',
    '<p>Nämä ovat demon arviointia varten. Tapahtumat tallentuvat vain tähän selainvälilehteen. Niitä ei lähetetä palvelimelle.</p>',
    `<label class="checkbox"><input type="checkbox" id="tracking" ${tracking ? 'checked' : ''}>Kerää testitapahtumat tässä välilehdessä</label>`,
    `<p id="event-count">Kerättyjä tapahtumia: ${events.length}. ${status}</p>`,
    '<button class="button secondary" data-action="export-events">Lataa tapahtumat JSON-tiedostona</button>',
    '<button class="button secondary" data-action="clear-events">Tyhjennä tapahtumat</button>',
    '<button class="button secondary" data-action="payment-error">Kokeile maksun virhetilannetta</button>',
    '</details>',
  ].join('');
}

function searchView() {
  const originOptions = ORIGINS.map((item) =>
    `<option value="${item.id}" ${state.origin === item.id ? 'selected' : ''}>${item.label}</option>`
  ).join('');
  const destinationOptions = DESTINATIONS.map((item) =>
    `<option value="${item.id}" ${state.destination === item.id ? 'selected' : ''}>${item.label}</option>`
  ).join('');

  return {
    title: 'Minne olet<br>matkalla?',
    description: 'Löydä sopiva reitti ja ymmärrä, millaisen lipun tarvitset.',
    number: '01',
    body: [
      stepper(),
      '<h2>Suunnittele esimerkkimatka</h2>',
      '<p class="small muted" style="margin-bottom:22px">Valitse lähtöpaikka ja määränpää.</p>',
      '<form id="search-form">',
      `<label class="field" for="origin"><span>Lähtöpaikka</span><select id="origin" name="origin">${originOptions}</select></label>`,
      `<label class="field" for="destination"><span>Määränpää</span><select id="destination" name="destination">${destinationOptions}</select></label>`,
      '<div class="field-row">',
      '<div class="field"><span id="date-label">Esimerkkipäivä</span><div class="static-field" aria-labelledby="date-label">22.10.2026</div></div>',
      `<label class="field" for="departure"><span>Lähtöaika</span><input id="departure" name="time" type="time" value="${state.time}" required></label>`,
      '</div>',
      `<label class="checkbox"><input type="checkbox" name="lessWalk" ${state.lessWalk ? 'checked' : ''}>Suosi vähäisempää kävelyä</label>`,
      '<button class="button full" type="submit">Näytä reittivaihtoehdot <span aria-hidden="true">→</span></button>',
      '<p class="form-note">Kokeilu ei edellytä kirjautumista.</p>',
      '</form>',
    ].join(''),
  };
}

function resultsView() {
  const routes = routesFor(state);
  const sortLabel = state.lessWalk
    ? '<span class="label-pill">Järjestetty kävelymatkan mukaan</span>'
    : '<span class="label-pill neutral">Järjestetty matka-ajan mukaan</span>';
  const cards = routes.map((route, index) => {
    const changes = route.changes === 0 ? 'ei vaihtoja' : '1 vaihto';
    return [
      `<button type="button" data-route="${route.id}" class="route-card ${index === 0 ? 'recommended' : ''}" aria-label="${route.label}, ${route.minutes} minuuttia, kävelyä ${route.walk} metriä, ${route.changes} vaihtoa. Näytä reitin tiedot.">`,
      '<div class="route-card-top">',
      `<span class="label-pill ${index === 0 ? 'lime' : 'neutral'}">${route.label}</span>`,
      `<span class="route-duration">${route.minutes} min</span>`,
      '</div>',
      `<div class="route-time">${route.departure} <span class="muted" aria-hidden="true">—</span> ${route.arrival}</div>`,
      '<div class="route-meta">',
      badge(route),
      `<span>Kävelyä ${route.walk} m · ${changes}</span>`,
      '<span class="route-arrow" aria-hidden="true">→</span>',
      '</div>',
      '</button>',
    ].join('');
  }).join('');

  return {
    title: 'Sinulle sopiva<br>reitti.',
    description: 'Vertaa matka-aikaa, kävelyä ja vaihtoja. Valitse omaan tilanteeseesi sopiva vaihtoehto.',
    number: '02',
    body: [
      stepper(),
      backButton('search', 'Muokkaa hakua'),
      journey(),
      sortLabel,
      `<div class="route-list">${cards}</div>`,
      '<p class="small muted">Ajat ja linjat ovat esimerkkejä, eivät voimassa olevia aikatauluja.</p>',
    ].join(''),
  };
}

function detailsView() {
  const route = selectedRoute(state);
  const walkToStop = route.id === 'walkless' ? 80 : 250;
  const transfer = route.changes ? ' Vaihda esimerkkipysäkillä linjalle B3.' : '';
  const zones = destinationFor(state).zones.split('').join(' ja ');
  const saveLabel = isSaved() ? '✓ Matka on tallennettu' : '☆ Tallenna matka suosikiksi';

  return {
    title: 'Matkasi vaihe<br>vaiheelta.',
    description: 'Tarkista reitti rauhassa. Seuraavaksi autamme lipun valinnassa.',
    number: '03',
    body: [
      stepper(),
      backButton('results', 'Kaikki reittivaihtoehdot'),
      journey(),
      '<dl class="route-facts">',
      `<div><dt>Matka-aika</dt><dd>${route.minutes} min</dd></div>`,
      `<div><dt>Kävelyä</dt><dd>${route.walk} m</dd></div>`,
      `<div><dt>Vaihtoja</dt><dd>${route.changes}</dd></div>`,
      '</dl>',
      '<ol class="timeline">',
      `<li><strong>${route.departure} · ${originFor(state).label}</strong><p>Kävele esimerkkipysäkille, noin ${walkToStop} metriä.</p></li>`,
      `<li><strong>${badge(route)} ${route.mode} kohti määränpäätä</strong><p>Seuraa linjan ${route.line} esimerkkireittiä.${transfer}</p></li>`,
      `<li><strong>${route.arrival} · ${destinationFor(state).label}</strong><p>Kävele loppumatka määränpäähän. Kävelyä yhteensä ${route.walk} metriä.</p></li>`,
      '</ol>',
      `<div class="info-box"><strong>Matka kulkee vyöhykkeillä ${zones}.</strong>Näytämme seuraavaksi tähän esimerkkimatkaan sopivan lipun.</div>`,
      '<button type="button" class="button full" data-go="ticket">Valitse matkaan sopiva lippu <span aria-hidden="true">→</span></button>',
      `<button type="button" class="button quiet full" data-action="save">${saveLabel}</button>`,
    ].join(''),
  };
}

function ticketView() {
  const ticket = ticketFor(state);
  const coverage = ticket.zones === 'ABC'
    ? 'Lentoasemalle suuntautuva esimerkkireitti kulkee vyöhykkeillä A, B ja C.'
    : 'Valittu esimerkkireitti kulkee vyöhykkeillä A ja B.';
  const zoneMarks = ['A', 'B', 'C', 'D'].map((zone) =>
    `<span class="zone ${ticket.zones.includes(zone) ? 'included' : ''}" aria-hidden="true">${zone}</span>`
  ).join('');
  const options = ['single', 'day'].map((id) => {
    const option = ticketFor({ ...state, ticket: id });
    const note = id === 'single'
      ? 'Yhdelle matkalle ja sen vaihdoille.'
      : 'Useampaan matkaan saman vuorokauden aikana.';
    return [
      '<label class="ticket-option">',
      `<input type="radio" name="ticket" value="${id}" ${state.ticket === id ? 'checked' : ''}>`,
      '<span class="ticket-content">',
      `<span class="ticket-heading"><span>${option.name} ${option.zones}</span><span>${euro(option.price)}</span></span>`,
      `<small>${option.validity} · ${note}</small>`,
      '</span>',
      '</label>',
    ].join('');
  }).join('');

  return {
    title: 'Oikea lippu.<br>Selkeä perustelu.',
    description: 'Näet, mitä lippu kattaa ja miksi se sopii juuri tähän esimerkkimatkaan.',
    number: '04',
    body: [
      stepper(),
      backButton('details', 'Reitin tiedot'),
      journey(),
      '<div class="info-box">',
      `<strong>Tarvitset esimerkissä ${ticket.zones}-lipun.</strong>`,
      coverage,
      `<div class="zone-row" aria-label="Lipun kattamat vyöhykkeet ${ticket.zones}">${zoneMarks}</div>`,
      '<span class="small">Vyöhykkeet havainnollistavat valintaa tässä demossa.</span>',
      '</div>',
      '<fieldset style="border:0;padding:0;margin:20px 0">',
      '<legend class="field-label">Valitse lipputyyppi · aikuinen</legend>',
      options,
      '</fieldset>',
      '<p class="small muted" style="margin:0 0 20px">Hinnat ja voimassaoloajat ovat esimerkkejä. Ne eivät ole HSL:n hinnasto.</p>',
      `<button class="button full" type="button" data-go="checkout">Jatka yhteenvetoon · ${euro(ticket.price)} <span aria-hidden="true">→</span></button>`,
    ].join(''),
  };
}

function checkoutView() {
  const ticket = ticketFor(state);
  const error = paymentFailed
    ? '<div class="error-box" role="alert" tabindex="-1" id="payment-error"><strong>Demomaksu ei onnistunut.</strong><br>Mitään ei veloitettu. Valintasi ovat tallessa. Voit yrittää uudelleen tai muokata lippua.</div>'
    : '';
  const payLabel = paymentFailed ? 'Yritä demomaksua uudelleen' : 'Vahvista demomaksu';

  return {
    title: 'Kaikki valmiina<br>vahvistukseen.',
    description: 'Tarkista valintasi. Tässä demossa maksaminen on simuloitu.',
    number: '05',
    body: [
      stepper(),
      backButton('ticket', 'Muokkaa lippua'),
      '<h2>Ostoksen yhteenveto</h2>',
      '<dl class="summary-list">',
      `<div><dt>Matka</dt><dd>${originFor(state).label}<br>→ ${destinationFor(state).label}</dd></div>`,
      `<div><dt>Lippu</dt><dd>${ticket.name} ${ticket.zones}</dd></div>`,
      '<div><dt>Matkustaja</dt><dd>Aikuinen</dd></div>',
      `<div><dt>Voimassaolo</dt><dd>${ticket.validity}<br><span class="small muted">Esimerkkitieto</span></dd></div>`,
      '<div><dt>Maksutapa</dt><dd>Simuloitu maksu</dd></div>',
      `<div class="total"><dt>Yhteensä</dt><dd>${euro(ticket.price)}</dd></div>`,
      '</dl>',
      error,
      '<div class="info-box"><strong>Tämä on turvallinen demovaihe.</strong>Kortti- tai henkilötietoja ei kysytä eikä rahaa veloiteta. Demovahvistus ei kelpaa matkalipuksi.</div>',
      `<button type="button" class="button full" data-action="pay">${payLabel} <span aria-hidden="true">→</span></button>`,
    ].join(''),
  };
}

function successView() {
  const ticket = ticketFor(state);
  const saveLabel = isSaved() ? '✓ Matka on tallennettu' : '☆ Tallenna tämä matka';

  return {
    title: 'Hyvä matka<br>alkaa selkeydestä.',
    description: 'Olet kulkenut reitin valinnasta lipun demovahvistukseen.',
    number: '06',
    body: [
      stepper(),
      '<div class="success-icon" aria-hidden="true">✓</div>',
      '<div class="success-title"><h2>Demovahvistus valmis</h2><p>Esimerkkitilauksesi onnistui.<br>Mitään ei veloitettu.</p></div>',
      '<div class="receipt">',
      `<div class="receipt-heading"><span class="label-pill">Vain demo</span><strong>${ticket.zones}</strong></div>`,
      `<p><strong>${ticket.name} · aikuinen</strong><br>${originFor(state).label} → ${destinationFor(state).label}</p>`,
      `<small>Esimerkkihinta ${euro(ticket.price)}<br>Ei kelpaa matkalipuksi.</small>`,
      '</div>',
      `<button type="button" class="button full" data-action="save">${saveLabel}</button>`,
      '<button type="button" class="button secondary full" style="margin-top:12px" data-action="share">Kopioi matkasuunnitelman linkki</button>',
      '<p class="form-note">Linkki avaa reitin tiedot myös toisella laitteella. Se ei sisällä maksua tai matkalippua.</p>',
      '<button class="button quiet full" data-go="search">Suunnittele uusi matka <span aria-hidden="true">→</span></button>',
    ].join(''),
  };
}

const savedKey = (item) => `${item.origin}-${item.destination}-${item.route}`;

function getSaved() {
  const data = readStore('matkalle-saved', []);
  if (!Array.isArray(data)) return [];
  return data.filter((item) => item && typeof item === 'object').map(normalizeState).slice(0, 20);
}

function isSaved() {
  return getSaved().some((item) => savedKey(item) === savedKey(state));
}

function savedView() {
  const saved = getSaved();
  const cards = saved.map((item, index) => {
    const route = selectedRoute(item);
    return [
      '<article class="saved-card">',
      '<div>',
      '<span class="label-pill">Suosikkimatka</span>',
      `<h2 style="margin-top:12px">${originFor(item).label} → ${destinationFor(item).label}</h2>`,
      `<p>${route.minutes} min · kävelyä ${route.walk} m · ${destinationFor(item).zones}-vyöhykkeet</p>`,
      '</div>',
      '<div class="saved-actions">',
      `<button class="button" data-open-saved="${index}">Avaa matka <span aria-hidden="true">→</span></button>`,
      `<button class="button secondary" data-remove-saved="${index}" aria-label="Poista tallennettu matka ${originFor(item).label}, ${destinationFor(item).label}">Poista</button>`,
      '</div>',
      '</article>',
    ].join('');
  }).join('');
  const empty = [
    '<div class="panel">',
    '<h2>Ei vielä tallennettuja matkoja</h2>',
    '<p class="muted" style="margin:12px 0 22px">Kun löydät sopivan reitin, voit tallentaa sen reitin tiedoista tai demovahvistuksesta.</p>',
    '<button class="button" data-go="search">Suunnittele ensimmäinen matka <span aria-hidden="true">→</span></button>',
    '</div>',
  ].join('');

  return [
    '<div class="page-wrap">',
    intro('Omat tutut<br>matkasi.', 'Tallennetut matkat säilyvät vain tässä selaimessa. Voit avata ne uudelleen ja muuttaa valintojasi.', ''),
    `<div class="saved-list">${saved.length ? cards : empty}</div>`,
    tools(),
    '</div>',
  ].join('');
}

function caseView() {
  return [
    '<div class="page-wrap">',
    intro(
      'Miten selkeä<br>valinta syntyy?',
      'Matkalle on Karine Heinosen itsenäinen UX/UI-portfoliokonsepti. Tämä on testattava ensimmäinen versio.',
      '',
    ),
    '<div class="case-layout">',
    '<aside class="case-aside">',
    '<span class="label-pill">Versio 0.1 · testattava</span>',
    '<p><strong>Rooli</strong><br>UX/UI-suunnittelu ja frontend</p>',
    '<p><strong>Rajaus</strong><br>Yksi matka, kuusi näkymää</p>',
    '<a href="downloads/Matkalle-suunnittelupaketti.zip" download>Figma- ja tutkimuspaketti ↓</a>',
    '<a href="downloads/Matkalle-tapaustutkimus.md" download>Tapaustutkimus ↓</a>',
    '<a href="#search">Avaa verkkodemo →</a>',
    '</aside>',
    '<article class="case-content">',
    '<h2>Ongelma ja tavoite</h2>',
    '<p>Suunnitteluhypoteesi: satunnaisesti Helsingin seudulla matkustava voi tarvita tukea reitin, vyöhykkeiden ja lipun yhdistämiseen. Hypoteesia ei ole vielä vahvistettu haastatteluilla.</p>',
    '<div class="callout"><strong>Tutkimuskysymys</strong><p>Ymmärtääkö käyttäjä ilman ulkopuolista apua, mikä lippu sopii hänen valitsemaansa matkaan ja miksi?</p></div>',
    '<h2>Mitä tässä versiossa voi kokeilla?</h2>',
    '<ol>',
    '<li>Vertaa esimerkkireittejä ja suosi vähäisempää kävelyä.</li>',
    '<li>Lue reitti myös tekstimuodossa.</li>',
    '<li>Tarkista lipun vyöhykkeet ja valitse lipputyyppi.</li>',
    '<li>Vahvista demomaksu tai kokeile maksun epäonnistumista.</li>',
    '<li>Tallenna matka selaimeen tai jatka reittisuunnitelmasta toisella laitteella jaetun linkin avulla.</li>',
    '</ol>',
    '<h2>Suunnitteluratkaisut ja arviointi</h2>',
    '<table>',
    '<thead><tr><th>Ratkaisu</th><th>Perustelu ja testattava oletus</th></tr></thead>',
    '<tbody>',
    '<tr><td>Reittikortit ennen lipun valintaa</td><td>Rajaa ensin matka. Testaa, löytyvätkö vertailuun tarvittavat tiedot korteilta.</td></tr>',
    '<tr><td>Vyöhykkeen perustelu lipun vieressä</td><td>Testaa, osaako käyttäjä selittää omin sanoin, miksi valittu lippu sopii matkaan.</td></tr>',
    '<tr><td>Tekstimuotoinen reitti kartan rinnalla</td><td>Reittitieto on käytettävissä ilman kartan tulkitsemista. Tarkista toiminta myös näppäimistöllä ja ruudunlukijalla.</td></tr>',
    '<tr><td>Valintojen säilyminen virheessä</td><td>Testaa, ymmärtääkö käyttäjä maksun tilan ja löytääkö hän seuraavan toiminnon.</td></tr>',
    '</tbody>',
    '</table>',
    '<h2>Käyttäjätutkimuksen tila</h2>',
    '<p><strong>Haastatteluja ja käyttäjätestejä ei ole vielä tehty.</strong> Demossa ei esitetä keksittyjä käyttäjälausuntoja, mitattua käytettävyyden parannusta tai saavutettavuussertifiointia.</p>',
    '<p>Seuraava vaihe on 3–5 haastattelua ja 3–5 ohjattua käytettävyystestiä. Kirjaa tehtävän onnistuminen, avun tarve, väärät valinnat ja käyttäjän selitys lipun sopivuudesta. Pienen otoksen tulokset käsitellään laadullisina havaintoina.</p>',
    '<h2>Tekoälyn rooli</h2>',
    '<p>Ensimmäinen versio on luotu tekoälyavusteisesti: käyttäjäpolun rakenne, käyttöliittymän luonnos, käyttöliittymätekstit, koodi ja tapaustutkimuksen teksti. Suunnitteluratkaisut ovat vielä arvioitavia ehdotuksia. Karinen tehtävä seuraavassa vaiheessa on tarkastaa ratkaisut, haastatella ja testata oikeilla käyttäjillä sekä dokumentoida omat muutoksensa.</p>',
    '<h2>Rajat ja tiedot</h2>',
    '<p>Palvelu ei ole HSL:n tilaama eikä virallinen HSL-palvelu. Kaikki reitit, linjat, ajat, hinnat ja voimassaoloajat ovat esimerkkiaineistoa. Kartta on itse tehty kaaviokuva. Oikeaa liikennedataa tai maksurajapintaa ei ole kytketty.</p>',
    '<p>Tallennetut matkat säilyvät vain selaimen paikallisessa tallennustilassa. Testitapahtumien keruu on oletuksena pois käytöstä; päälle kytkettynä tapahtumat säilyvät vain tässä välilehdessä. Henkilö- tai maksutietoja ei kysytä. Jaettu linkki sisältää valitut esimerkkimatkan asetukset, jotka näkyvät linkin vastaanottajalle.</p>',
    '<h2>Muokattava Figma-prototyyppi</h2>',
    '<p>Figma-tiedostossa on kuusi päävaihetta, maksun virhetila, Auto Layout -näkymät, Simple Design Systemin painikkeita ja lomakekenttiä sekä konseptin omat kortit ja tyylit. Pääpolussa on 12 prototyyppilinkkiä. Vaihtoehtoiset valinnat ovat Figmassa staattisia; verkkodemossa niitä voi muuttaa.</p>',
    '<p><a href="https://www.figma.com/design/rmlkjd0VnSlmzUqju4ktjN?node-id=3-594" target="_blank" rel="noopener">Avaa Figma-prototyyppi ↗</a></p>',
    '<p>Ladattavassa paketissa on erilliset SVG-luonnokset, tyyli- ja sisältömäärittelyt sekä tapaustutkimus.</p>',
    '<div class="download-links">',
    '<a class="button" href="downloads/Matkalle-suunnittelupaketti.zip" download>Lataa suunnittelupaketti ↓</a>',
    '<a class="button secondary" href="downloads/Matkalle-tapaustutkimus.md" download>Lataa tapaustutkimus ↓</a>',
    '</div>',
    '<h2>Mitä portfoliossa kannattaa näyttää seuraavaksi?</h2>',
    '<p>Ensimmäisen version kuvat, oikeista testeistä syntyneet havainnot, niiden perusteella tehty toinen versio sekä perustelut tärkeimmille muutoksille. Erottele oma työ, tekoälyn ehdotukset ja käyttäjien havainnot.</p>',
    '</article>',
    '</div>',
    tools(),
    '</div>',
  ].join('');
}

const viewTitles = {
  search: 'Suunnittele matka',
  results: 'Reittivaihtoehdot',
  details: 'Reitin tiedot',
  ticket: 'Valitse lippu',
  checkout: 'Ostoksen yhteenveto',
  success: 'Demovahvistus',
  saved: 'Tallennetut matkat',
  case: 'Tapaustutkimus',
};

const journeyViews = {
  search: searchView,
  results: resultsView,
  details: detailsView,
  ticket: ticketView,
  checkout: checkoutView,
  success: successView,
};

function render(focus = false) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === 'search'
      ? STEPS.includes(state.view)
      : link.dataset.nav === state.view;
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.href = hashFromState({ ...state, view: link.dataset.nav });
  });

  if (state.view === 'saved') {
    app.innerHTML = savedView();
  } else if (state.view === 'case') {
    app.innerHTML = caseView();
  } else {
    const view = journeyViews[state.view]();
    app.innerHTML = [
      '<div class="page-wrap">',
      intro(view.title, view.description, view.number),
      '<div class="app-grid">',
      `<section class="panel" aria-label="Matkan suunnittelu">${view.body}</section>`,
      mapPanel(),
      '</div>',
      support(),
      tools(),
      '</div>',
    ].join('');
  }

  document.title = `${viewTitles[state.view]} · Matkalle`;
  if (focus) {
    document.querySelector('#view-heading')?.focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'search-form') return;
  event.preventDefault();
  const data = new FormData(event.target);
  state = reduceJourney(state, {
    type: 'SEARCH',
    values: {
      origin: data.get('origin'),
      destination: data.get('destination'),
      time: data.get('time'),
      lessWalk: data.has('lessWalk'),
    },
  });
  track('search_completed', { destination: state.destination, lessWalk: state.lessWalk });
  go('results');
});

app.addEventListener('change', (event) => {
  if (event.target.name === 'ticket') {
    state = reduceJourney(state, { type: 'SELECT_TICKET', id: event.target.value });
    track('ticket_selected', { ticket: state.ticket });
    history.replaceState(null, '', hashFromState(state));
    render();
    document.querySelector(`input[name="ticket"][value="${state.ticket}"]`)?.focus();
  }

  if (event.target.id === 'tracking') {
    tracking = event.target.checked;
    try {
      sessionStorage.setItem('matkalle-tracking', tracking ? 'yes' : 'no');
    } catch {}
    const count = document.querySelector('#event-count');
    const status = tracking ? 'Keruu käytössä.' : 'Keruu pois käytöstä.';
    if (count) count.textContent = `Kerättyjä tapahtumia: ${events.length}. ${status}`;
    announce(tracking
      ? 'Testitapahtumien keruu käytössä tässä välilehdessä.'
      : 'Testitapahtumien keruu pois käytöstä.');
  }
});

app.addEventListener('click', async (event) => {
  const element = event.target.closest('button,a');
  if (!element) return;

  if (element.dataset.go) {
    paymentFailed = false;
    track('step_opened', { view: element.dataset.go });
    go(element.dataset.go);
    return;
  }

  if (element.dataset.route) {
    state = reduceJourney(state, { type: 'SELECT_ROUTE', id: element.dataset.route });
    track('route_selected', { route: state.route });
    go('details');
    return;
  }

  if (element.dataset.openSaved !== undefined) {
    const saved = getSaved()[Number(element.dataset.openSaved)];
    if (saved) go('details', saved);
    return;
  }

  if (element.dataset.removeSaved !== undefined) {
    const items = getSaved();
    items.splice(Number(element.dataset.removeSaved), 1);
    if (!writeStore('matkalle-saved', items)) {
      announce('Tallennuksen muuttaminen ei onnistunut selaimen asetusten vuoksi.');
      return;
    }
    render();
    document.querySelector('[data-open-saved], [data-go="search"]')?.focus();
    announce('Matka poistettu tallennetuista.');
    return;
  }

  switch (element.dataset.action) {
    case 'save': {
      if (isSaved()) {
        announce('Matka on jo tallennettu. Löydät sen Tallennetut-näkymästä.');
        return;
      }
      const ok = writeStore('matkalle-saved', [...getSaved(), { ...state, view: 'details' }].slice(-20));
      if (ok) {
        track('journey_saved');
        element.textContent = '✓ Matka on tallennettu';
        announce('Matka tallennettu tähän selaimeen.');
      } else {
        announce('Tallentaminen ei onnistunut selaimen asetusten vuoksi.');
      }
      break;
    }
    case 'share': {
      const url = new URL(location.href);
      url.hash = hashFromState({ ...state, view: 'details' });
      try {
        await navigator.clipboard.writeText(url.href);
        announce('Matkasuunnitelman linkki kopioitu.');
        element.textContent = '✓ Linkki kopioitu';
      } catch {
        const field = document.createElement('input');
        field.value = url.href;
        field.readOnly = true;
        field.setAttribute('aria-label', 'Kopioitava matkasuunnitelman linkki');
        field.style.width = '100%';
        field.style.marginTop = '12px';
        element.after(field);
        field.focus();
        field.select();
        announce('Kopioi valittu linkki.');
      }
      break;
    }
    case 'pay':
      paymentFailed = false;
      state = reduceJourney(state, { type: 'PAY_SUCCESS' });
      track('demo_payment_completed', { ticket: state.ticket, zones: ticketFor(state).zones });
      go('success');
      break;
    case 'payment-error':
      paymentFailed = true;
      track('demo_payment_failed');
      go('checkout');
      setTimeout(() => document.querySelector('#payment-error')?.focus(), 50);
      break;
    case 'toggle-map': {
      const panel = element.closest('.map-shell');
      const collapsed = panel.classList.toggle('collapsed');
      element.setAttribute('aria-expanded', String(!collapsed));
      element.textContent = collapsed ? 'Näytä karttakuva' : 'Piilota karttakuva';
      break;
    }
    case 'export-events': {
      const blob = new Blob([JSON.stringify({
        project: 'Matkalle',
        version: '0.1',
        source: 'local-test-events',
        events,
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'matkalle-testitapahtumat.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce('Testitapahtumat ladattu.');
      break;
    }
    case 'clear-events':
      events = [];
      try {
        sessionStorage.removeItem('matkalle-events');
      } catch {}
      document.querySelector('#event-count').textContent = `Kerättyjä tapahtumia: 0. ${tracking ? 'Keruu käytössä.' : 'Keruu pois käytöstä.'}`;
      announce('Testitapahtumat tyhjennetty.');
      break;
  }
});

window.addEventListener('hashchange', () => {
  state = stateFromHash(location.hash);
  if (state.view !== 'checkout') paymentFailed = false;
  track('page_view', { view: state.view });
  render(true);
});

const normalizedHash = hashFromState(state);
if (location.hash !== normalizedHash) history.replaceState(null, '', normalizedHash);
render();
