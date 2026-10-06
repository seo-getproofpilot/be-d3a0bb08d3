/* Blackout Electric demo: panel, terminal, reviews, grid map, quote form. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const mobile = () => matchMedia('(max-width: 900px)').matches;

  /* ---------- intro skip ---------- */
  const endIntro = () => { html.classList.remove('intro'); html.classList.add('no-intro'); };
  $('#skipIntro')?.addEventListener('click', endIntro);
  if (html.classList.contains('intro')) {
    addEventListener('keydown', e => { if (e.key === 'Escape') endIntro(); }, { once: true });
  }

  /* ---------- hero power lines: each conduit gets a glow, a lingering trail and the bright run ---------- */
  $$('.st-power .pw path').forEach(p => {
    const mk = cls => { const n = p.cloneNode(); n.setAttribute('class', cls); return n; };
    p.before(mk('trail'), mk('glow')); p.setAttribute('class', 'run');
  });

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), mnav = $('#mnav'), mbar = $('#mbar'), hero = $('.hero');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    mbar.classList.toggle('show', hero.getBoundingClientRect().bottom < 80);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); mnav.hidden = !open;
  });
  $$('#mnav a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; }));

  /* ---------- services panel ---------- */
  // what each breaker pre-checks in the quote form
  const PICK = { panel: 'Main panel upgrade', ev: 'EV charger', surge: 'Surge protection', repair: 'Electrical repair',
    lighting: 'Electrical repair', commercial: 'Electrical repair', newcon: 'Something else', ac: 'HVAC / AC',
    minisplit: 'Solar mini split', dr: 'Solar detach & reset', solar: 'New solar', solarfix: 'Solar repair / maintenance',
    battery: 'Battery / Powerwall', clean: 'Panel cleaning / pest guard', inspect: 'Solar repair / maintenance',
    remodel: 'Construction / remodel', backyard: 'Construction / remodel', roofing: 'Solar detach & reset' };
  const board = $('.board'), readout = $('#readout'), brks = $$('.brk'), cta = $('#svcCta');
  function selectSvc(id, { scroll = false, toggle = false } = {}) {
    const btn = brks.find(b => b.dataset.svc === id);
    if (toggle && btn.getAttribute('aria-selected') === 'true' && mobile()) {
      btn.setAttribute('aria-selected', 'false'); readout.classList.add('parked'); board.appendChild(readout); readout.classList.remove('inline'); return;
    }
    brks.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    $$('.svc', readout).forEach(a => { a.hidden = a.dataset.svc !== id; });
    cta.dataset.pick = PICK[id] || '';
    cta.firstChild.textContent = 'Get a quote for ' + btn.querySelector('.brk-lbl').textContent.toLowerCase().replace('ev ', 'EV ').replace('ac ', 'AC ').replace('powerwall', 'Powerwall') + ' ';
    if (mobile()) { btn.after(readout); readout.classList.add('inline'); readout.classList.remove('parked'); }
    else if (readout.parentElement !== board) { board.appendChild(readout); readout.classList.remove('inline', 'parked'); }
    if (scroll) (mobile() ? btn : $('#services')).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  brks.forEach(b => b.addEventListener('click', () => selectSvc(b.dataset.svc, { toggle: true })));
  // arrow keys move between breakers
  $('.cols').addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const i = brks.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); const n = brks[(i + (e.key === 'ArrowDown' ? 1 : -1) + brks.length) % brks.length];
    n.focus(); selectSvc(n.dataset.svc);
  });
  if (mobile()) { readout.classList.add('parked'); brks.forEach(b => b.setAttribute('aria-selected', 'false')); }
  else selectSvc('panel');
  addEventListener('resize', () => { if (!mobile() && readout.parentElement !== board) { board.appendChild(readout); readout.classList.remove('inline', 'parked'); } });
  $$('[data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); selectSvc(a.dataset.open, { scroll: true }); }));

  /* ---------- quote prefill from any CTA ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#quote"]'); if (!a) return;
    const pick = a.dataset.pick, role = a.dataset.role;
    if (pick) $$('#picks input').forEach(i => { if (i.value === pick.replace('&amp;', '&')) i.checked = true; });
    if (role) $$('input[name=role]').forEach(i => { i.checked = i.value === role; });
    if (pick || role) goStep(1);
  });

  /* ---------- solar service terminal ---------- */
  const tabs = $$('.term-tabs button'), cases = $$('.case');
  cases.forEach(c => $$('.ln', c).forEach((l, i) => l.style.setProperty('--i', i)));
  function playCase(n) {
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.case == n)));
    cases.forEach(c => { const on = c.dataset.case == n; c.hidden = !on; c.classList.remove('play'); if (on) { void c.offsetWidth; c.classList.add('play'); } });
  }
  tabs.forEach(t => t.addEventListener('click', () => playCase(t.dataset.case)));

  /* ---------- reviews (verbatim from Google, typos fixed only) ---------- */
  const REVIEWS = [
    ['dr', 'Detach & reset', 'Arizona Roofing Authority', 'Roofing company', 'Mar 2025', 'Whenever we have a roof replacement and need solar detached and reset we always reach out to Jon and his crew. Their work is bar none and done in a timely fashion. I always know my homeowners are in good hands with Jon and the guys at Blackout!'],
    ['solar', 'Solar repair', 'Jose P.', 'Realtor, homeowner', 'Aug 2025', 'My inverter had gone out which caused my solar system to stop producing. As soon as I hit up Jon about the issue he immediately sent out Irvin, his installer, to take a look at my system & right within the hour of contacting him! Really fast, friendly and efficient! Irvin verified that my SolarEdge inverter had a fault, contacted SolarEdge and by the end of the week had the new inverter shipped to my home and installed almost immediately!'],
    ['dr', 'Detach & reset', 'Louis L.', 'Homeowner', 'Jan 2026', 'Blackout Electric was the solar company that removed and replaced 43 solar panels so the roofing contractor could perform work on my roof. Irving Corona and his team were excellent! They arrived as promised. Their work was efficient and perfect.'],
    ['com', 'Commercial', 'Farhad E.', 'Commercial property', 'Sep 2025', 'This was an OLD commercial panel that 2 other companies didn’t want to touch. Jon and his team were on site first thing in the morning and resolved the issues they were having. Everything was fixed and property managers are happy with price, communication and getting the job done right.'],
    ['ev', 'EV charger', 'The Kim’s', 'Homeowner', 'Mar 2025', 'I reached out to Blackout last week for a Tesla charging station to be hooked up on my property. They came out super fast. Was super affordable and reliable. Clean install! Will use them again to hook up my sauna.'],
    ['hvac', 'Solar mini split', 'Marco Z.', 'Homeowner', 'May 2025', 'First time hearing about Solar Mini Splits!!!! Talk about an upgrade! Literally the best for my electric bill for the summer. Arizona’s no joke when it comes to that. The price was perfect for my budget.'],
    ['dr', 'Detach & reset', 'Gary B.', 'Surprise, AZ', 'Apr 2026', 'They removed and reset in The Grand in Surprise 28 solar panels in order for us to put new underlay on our roof. They are the true professionals. Luis is a tremendous asset to Blackout. He kept us informed, and the job was first rate. Always left the site clean and the new reset is even better than the original application.'],
    ['elec', 'Panel upgrade', 'Erik C.', 'Homeowner', 'Nov 2025', 'They came out to my home and installed a brand-new service panel, and the quality of their work was exceptional. … Their communication was top-tier. Every single day they were here, they made sure I was completely taken care of and understood everything that was happening.'],
    ['solar', 'Solar repair', 'Ryan W.', 'Original installer closed', 'Oct 2025', 'I couldn’t call them so I called the original installer, they said I should call someone else. Thanks all the gods that I met Jon and Blackout Electrical and Solar! They had 4 guys out within a day and addressed the problem. … They diagnosed and took care of the problem in no time and also advocated for me to Tesla AND are working on a new warranty for me.'],
    ['dr', 'Detach & reset', 'Nick H.', 'Roofer', 'Mar 2026', 'The owner Jon and his wife Karen are probably the nicest people you’ll ever meet. Their quality is unmatched and they genuinely care about their customers. I’m a roofer, and I personally use John for all of my detach and reset.'],
    ['hvac', 'AC repair', 'Tracy S.', 'Homeowner', 'Jun 2026', 'They were able to get me in on the schedule fast so that I could get my AC working again. They walked me through everything and explained and fixed the issue. Thank you Jonathan and Mike (technician), much appreciated.'],
    ['com', 'Commercial', 'Mather Bros Inc', 'Commercial client', 'Jul 2026', 'We used Blackout Electric to run some new outlets and wiring for one of our buildings. The crew did a great job. Jon was easy to work with and highly recommend them for any commercial electrical work you need done.'],
    ['ev', 'EV charger', 'Brenner W.', 'Homeowner', 'Sep 2025', 'I called Blackout Electric on Saturday when I bought a car to install a 240 EV charger in my garage. Karen called and set an install date within 3 days and the job is complete. Jon came out and did a walk through.'],
    ['elec', 'Electrical', 'Austin Z.', 'Homeowner', 'Apr 2026', 'Their pricing is clear and reasonable, they arrived right on schedule, and the job was completed quickly and professionally. They’re a dependable option for any electrical work, and the owner is very friendly.'],
    ['solar', 'Solar inspection', 'Ed C.', 'Home buyer', 'Jul 2025', 'Black Out Electric was able to perform a solar inspection on a home we were buying. They identified issues that needed repaired and worked with us to schedule repairs through closing. They did a great job and got us on the schedule extremely quickly.'],
    ['dr', 'Detach & reset', 'Michael K.', 'Homeowner', 'Jun 2025', 'Black Out Electric just completed an R and R of my 39 solar panels. They did an outstanding job. A big shout out to Karen who kept me informed of the progress while I was out of town.'],
    ['elec', 'Panel + mini split', 'Jesse M.', 'Homeowner', 'Mar 2025', 'Jon and his crew went above and beyond to change our main panel and did a very clean, professional install of their AC mini split (for our Arizona room). Highly recommend for any electrical or solar needs.'],
    ['solar', 'Quote', 'Alessandra R.', 'Homeowner', 'Mar 2026', 'While we didn’t use them for the job, Colton made the quoting process so easy. And was able to quote out the job on the spot. We were really impressed by being able to get a quote before he even left!']
  ];
  const star = '<svg class="ic"><use href="#i-star"/></svg>';
  const tickets = $('#tickets');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function renderReviews(f) {
    tickets.innerHTML = REVIEWS.filter(r => f === 'all' || r[0] === f).map(r =>
      `<article class="ticket"><div class="ticket-top"><span class="ticket-tag">${esc(r[1])}</span><span>${r[4]}</span></div>
       <div class="ticket-stars" aria-label="5 out of 5 stars">${star.repeat(5)}</div>
       <p>“${esc(r[5])}”</p><p class="who">${esc(r[2])}<span>${esc(r[3])} · Google review</span></p></article>`).join('');
  }
  renderReviews('all');
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('on', x === b)); renderReviews(b.dataset.f);
  }));

  /* ---------- service-area grid map: real lat/long, PCB-style traces from Mesa ---------- */
  const CITIES = [['Phoenix', 33.448, -112.074], ['Tempe', 33.425, -111.940], ['Chandler', 33.306, -111.841], ['Gilbert', 33.353, -111.789],
    ['Scottsdale', 33.494, -111.926], ['Queen Creek', 33.249, -111.634], ['San Tan Valley', 33.191, -111.528], ['Apache Jct', 33.415, -111.549],
    ['Gold Canyon', 33.371, -111.437], ['Fountain Hills', 33.612, -111.717], ['Ahwatukee', 33.341, -111.984], ['Glendale', 33.539, -112.186],
    ['Peoria', 33.581, -112.237], ['Surprise', 33.631, -112.368], ['Goodyear', 33.435, -112.358]];
  const HQ = [33.4162, -111.8005];
  const px = (lat, lon) => [Math.round((lon + 112.45) * 860 + 30), Math.round((33.70 - lat) * 1030 + 40)];
  const svg = $('#gridMap'), NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p = svg) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
  const [hx, hy] = px(...HQ);
  const gT = el('g', {}), gL = el('g', {}), gN = el('g', {});
  CITIES.forEach(([name, lat, lon], i) => {
    const [x, y] = px(lat, lon), dx = x - hx, dy = y - hy;
    // horizontal run, then a 45° leg into the node (or vertical, then 45°)
    const d = Math.abs(dx) > Math.abs(dy)
      ? `M${hx},${hy} H${x - Math.sign(dx) * Math.abs(dy)} L${x},${y}`
      : `M${hx},${hy} V${y - Math.sign(dy) * Math.abs(dx)} L${x},${y}`;
    el('path', { d, class: 'gm-trace' }, gT);
    el('path', { d, class: 'gm-live', style: `animation-delay:${(i * .37) % 3.2}s` }, gL);
    el('circle', { cx: x, cy: y, r: 7, class: 'gm-node' }, gN);
    const right = x < 880;
    el('text', { x: right ? x + 14 : x - 14, y: y + 7, class: 'gm-label', 'text-anchor': right ? 'start' : 'end' }, gN).textContent = name;
  });
  el('circle', { cx: hx, cy: hy, r: 9, class: 'gm-hq-ring' });
  el('circle', { cx: hx, cy: hy, r: 9, class: 'gm-hq' });
  el('text', { x: hx + 18, y: hy - 18, class: 'gm-hq-label' }).textContent = 'MESA HQ';

  /* ---------- quote form ---------- */
  const form = $('#qform'), steps = $$('.qstep', form), meter = $('#qMeter'), dots = $$('.meterbar span');
  let cur = 1;
  function goStep(n) {
    cur = n; steps.forEach(s => { s.hidden = +s.dataset.step !== n; });
    $('#qdone').hidden = true;
    meter.style.width = `calc(${(n - 1) * 50}% - ${(n - 1) * 15}px)`;
    dots.forEach((d, i) => d.classList.toggle('on', i < n));
  }
  function valid(n) {
    if (n === 1) { const ok = $$('#picks input:checked').length > 0; $('#err1').hidden = ok; return ok; }
    if (n === 3) {
      const F = form.elements, nm = F.name.value.trim(), ph = F.phone.value.replace(/\D/g, '');
      F.name.classList.toggle('bad', !nm); F.phone.classList.toggle('bad', ph.length < 10);
      const ok = nm && ph.length >= 10; $('#err3').hidden = ok; return ok;
    }
    return true;
  }
  form.addEventListener('click', e => {
    if (e.target.closest('[data-next]') && valid(cur)) goStep(cur + 1);
    if (e.target.closest('[data-back]')) goStep(cur - 1);
  });
  form.addEventListener('submit', e => {
    e.preventDefault(); if (!valid(3)) return;
    const f = form.elements, svcs = $$('#picks input:checked').map(i => i.value).join(', ');
    const body = [`Services: ${svcs}`, `I am a: ${f.role.value}`, `City/ZIP: ${f.city.value}`, `Timing: ${f.when.value}`,
      `Notes: ${f.notes.value}`, '', `Name: ${f.name.value}`, `Phone: ${f.phone.value}`, `Email: ${f.email.value}`, `Best way to reach me: ${f.contact.value}`].join('\n');
    void body;
    steps.forEach(s => { s.hidden = true; }); $('#qdone').hidden = false;
    dots.forEach(d => d.classList.add('on')); meter.style.width = 'calc(100% - 30px)';
  });
  goStep(1);

  /* ---------- hero quote card ---------- */
  const hform = $('#hform');
  hform.addEventListener('submit', e => {
    e.preventDefault();
    const F = hform.elements, ph = F.phone.value.replace(/\D/g, '');
    const bad = { name: !F.name.value.trim(), phone: ph.length < 10, service: !F.service.value };
    Object.entries(bad).forEach(([k, v]) => F[k].classList.toggle('bad', v));
    if (Object.values(bad).some(Boolean)) { $('#herr').hidden = false; return; }
    $('#herr').hidden = true;
    const body = [`Service: ${F.service.value}`, `Details: ${F.notes.value}`, '', `Name: ${F.name.value}`, `Phone: ${F.phone.value}`, `Email: ${F.email.value}`].join('\n');
    void body;
    hform.hidden = true; $('#hdone').hidden = false;
  });

  /* ---------- reveal on scroll ---------- */
  const rv = $$('.sec-head, .door, .dr-step, .dr-counts, .dr-quote, .dr-partner, .fix-copy, .term, .badge, .crew, .founder-fig, .founder-copy, .lender, .grid-map, .qform, .qa details, .final-fig');
  rv.forEach(n => n.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const t = en.target; t.classList.add('in'); io.unobserve(t);
    if (t.classList.contains('term')) playCase(0);
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  rv.forEach(n => io.observe(n));
  const once = (sel, cls = 'in') => { const n = $(sel); const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { n.classList.add(cls); o.disconnect(); } }, { threshold: .35 }); o.observe(n); };
  once('.circuit'); once('.finance');
})();

/* preview build: calls, email, forms and outbound links are off */
(function () {
  const t = document.createElement('div'); t.className = 'pv-toast'; document.body.appendChild(t); let k;
  const say = m => { t.textContent = m; t.classList.add('on'); clearTimeout(k); k = setTimeout(() => t.classList.remove('on'), 2600); };
  document.addEventListener('click', e => { if (e.target.closest('[data-preview-off]')) { e.preventDefault(); say('Preview only. Calls and links are off in this concept.'); } }, true);
  document.addEventListener('submit', () => say('Preview only. On the live site this request goes to the Blackout office.'), true);
})();
