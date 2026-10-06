/* Blackout Electric demo: panel, terminal, reviews, grid map, quote form. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const mobile = () => matchMedia('(max-width: 900px)').matches;

  /* ---------- design options panel (?options) ---------- */
  if (/[?&]options/.test(location.search)) {
    const d = document.documentElement, rows = [['theme', 'Color', ['', 'A', 'B', 'C']], ['border', 'Border', ['', '2', '3', '4']], ['btn', 'Button', ['', '2', '3', '4']], ['callout', 'Callout', ['', '1', '2', '3', '4']]];
    const box = document.createElement('div'); box.className = 'opts';
    box.innerHTML = '<p>Design options</p>' + rows.map(([k, l, vs]) => `<div><span>${l}</span>${vs.map(v => `<button data-k="${k}" data-v="${v}">${v || (k === 'callout' ? 'off' : 'now')}</button>`).join('')}</div>`).join('') + '<button class="x" aria-label="Hide">×</button>';
    document.body.appendChild(box);
    const sync = () => $$('.opts [data-k]', box).forEach(b => b.classList.toggle('on', (d.getAttribute('data-' + b.dataset.k) || '') === b.dataset.v));
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('x')) { box.remove(); return; }
      b.dataset.v ? d.setAttribute('data-' + b.dataset.k, b.dataset.v) : d.removeAttribute('data-' + b.dataset.k); sync();
    });
    sync();
  }

  /* ---------- intro skip ---------- */
  const endIntro = () => { html.classList.remove('intro'); html.classList.add('no-intro'); };
  $('#skipIntro')?.addEventListener('click', endIntro);
  if (html.classList.contains('intro')) {
    addEventListener('keydown', e => { if (e.key === 'Escape') endIntro(); }, { once: true });
  }

  /* ---------- hero power lines: each conduit gets a glow, a lingering trail and the bright run ---------- */
  $$('.st-power .pw path').forEach(p => {
    const mk = cls => { const n = p.cloneNode(); n.setAttribute('class', cls); return n; };
    p.before(mk('resid'), mk('tail'), mk('body')); p.setAttribute('class', 'head');
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
    lighting: 'Electrical repair', commercial: 'Electrical repair', newcon: 'Something else', circuits: 'Dedicated circuit / wiring',
    wiring: 'Dedicated circuit / wiring', dr: 'Solar detach & reset', solar: 'New solar', solarfix: 'Solar repair / maintenance',
    battery: 'Battery / Powerwall', clean: 'Panel cleaning / pest guard', inspect: 'Solar repair / maintenance',
    orphan: 'Orphaned solar system', warranty: 'Orphaned solar system', monitoring: 'Solar repair / maintenance' };
  const readout = $('#readout'), brks = $$('.brk'), cta = $('#svcCta'), pnl = $('.pnl');
  brks.forEach((b, i) => b.style.setProperty('--i', i));
  let curSvc = 0;
  function selectSvc(id, { scroll = false, init = false } = {}) {
    const i = brks.findIndex(b => b.dataset.svc === id), btn = brks[i]; curSvc = i;
    brks.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    $$('.svc', readout).forEach(a => { a.hidden = a.dataset.svc !== id; });
    cta.dataset.pick = PICK[id] || '';
    cta.querySelector('.b-l').textContent = 'Get a quote for ' + btn.querySelector('.vh').textContent.toLowerCase()
      .replace('ev ', 'EV ').replace(/^ac /, 'AC ').replace('powerwall', 'Powerwall').replace('240v', '240V');
    $('#svcIdx').textContent = String(i + 1).padStart(2, '0') + ' / ' + brks.length;
    if (scroll) $('#services').scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (!init && mobile()) { const r = readout.getBoundingClientRect(); if (r.top > innerHeight - 120) readout.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }
  brks.forEach(b => b.addEventListener('click', () => selectSvc(b.dataset.svc)));
  $$('.svc-step [data-step]').forEach(b => b.addEventListener('click', () => {
    const n = brks[(curSvc + +b.dataset.step + brks.length) % brks.length]; selectSvc(n.dataset.svc);
  }));
  // arrow keys move between breakers
  $('.pnl-hit').addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const i = brks.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); const n = brks[(i + (e.key === 'ArrowDown' ? 1 : -1) + brks.length) % brks.length];
    n.focus(); selectSvc(n.dataset.svc);
  });
  selectSvc('panel', { init: true });
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
    ['elec', 'Lighting', 'Pearce B.', 'Homeowner', 'Nov 2025', 'Blackout Electric came out quickly and took care of my broken lights, plus added a dimmer. The install is super clean and looks really nice.'],
    ['solar', 'Solar service', 'Jonathan C.', 'Homeowner', 'Apr 2025', 'He very quickly identified the problem with my solar equipment and ensured the parts were ordered before he even left my home. He was very communicative and made sure I knew what the process was going forward.'],
    ['solar', 'Solar', 'Heather P.', 'Homeowner', 'Aug 2025', 'From beginning to end, Caleb was always in constant communication, keeping us in the loop. Jon kept us up to date on what was going on. And the crew... Wow, above and beyond, very professional, punctual, and clean up was amazing.'],
    ['solar', 'Install', 'Omar C.', 'Homeowner', 'Jan 2026', 'Great communication from scheduling all the way through installation. Jon Gracia, the owner, was personally involved and took me seriously as a customer. The quality of work was excellent and everything was handled professionally.'],
    ['solar', 'Solar repair', 'Jose P.', 'Realtor, homeowner', 'Aug 2025', 'My inverter had gone out which caused my solar system to stop producing. As soon as I hit up Jon about the issue he immediately sent out Irvin, his installer, to take a look at my system & right within the hour of contacting him! Really fast, friendly and efficient! Irvin verified that my SolarEdge inverter had a fault, contacted SolarEdge and by the end of the week had the new inverter shipped to my home and installed almost immediately!'],
    ['com', 'Commercial', 'Farhad E.', 'Commercial property', 'Sep 2025', 'This was an OLD commercial panel that 2 other companies didn’t want to touch. Jon and his team were on site first thing in the morning and resolved the issues they were having. Everything was fixed and property managers are happy with price, communication and getting the job done right.'],
    ['ev', 'EV charger', 'The Kim’s', 'Homeowner', 'Mar 2025', 'I reached out to Blackout last week for a Tesla charging station to be hooked up on my property. They came out super fast. Was super affordable and reliable. Clean install! Will use them again to hook up my sauna.'],
    ['elec', 'Panel upgrade', 'Erik C.', 'Homeowner', 'Nov 2025', 'They came out to my home and installed a brand-new service panel, and the quality of their work was exceptional. … Their communication was top-tier. Every single day they were here, they made sure I was completely taken care of and understood everything that was happening.'],
    ['solar', 'Solar repair', 'Ryan W.', 'Original installer closed', 'Oct 2025', 'I couldn’t call them so I called the original installer, they said I should call someone else. Thanks all the gods that I met Jon and Blackout Electrical and Solar! They had 4 guys out within a day and addressed the problem. … They diagnosed and took care of the problem in no time and also advocated for me to Tesla AND are working on a new warranty for me.'],
    ['com', 'Commercial', 'Mather Bros Inc', 'Commercial client', 'Jul 2026', 'We used Blackout Electric to run some new outlets and wiring for one of our buildings. The crew did a great job. Jon was easy to work with and highly recommend them for any commercial electrical work you need done.'],
    ['ev', 'EV charger', 'Brenner W.', 'Homeowner', 'Sep 2025', 'I called Blackout Electric on Saturday when I bought a car to install a 240 EV charger in my garage. Karen called and set an install date within 3 days and the job is complete. Jon came out and did a walk through.'],
    ['elec', 'Electrical', 'Austin Z.', 'Homeowner', 'Apr 2026', 'Their pricing is clear and reasonable, they arrived right on schedule, and the job was completed quickly and professionally. They’re a dependable option for any electrical work, and the owner is very friendly.'],
    ['solar', 'Solar inspection', 'Ed C.', 'Home buyer', 'Jul 2025', 'Black Out Electric was able to perform a solar inspection on a home we were buying. They identified issues that needed repaired and worked with us to schedule repairs through closing. They did a great job and got us on the schedule extremely quickly.'],
    ['dr', 'Detach & reset', 'Michael K.', 'Homeowner', 'Jun 2025', 'Black Out Electric just completed an R and R of my 39 solar panels. They did an outstanding job. A big shout out to Karen who kept me informed of the progress while I was out of town.'],
    ['solar', 'Quote', 'Alessandra R.', 'Homeowner', 'Mar 2026', 'While we didn’t use them for the job, Colton made the quoting process so easy. And was able to quote out the job on the spot. We were really impressed by being able to get a quote before he even left!']
  ];
  const star = '<svg class="ic"><use href="#i-star"/></svg>';
  const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const initials = n => n.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  // reviews conveyor: two rows running in opposite directions; each row is two identical sets so -50% loops seamlessly
  const tone = i => ['', 'ft', '', 'dk'][i % 4];
  const card = (r, i) => `<article class="rc ${tone(i)}"><div class="rc-top"><span class="rc-tag">${esc(r[1])}</span><span>${r[4]}</span></div>
     <div class="rc-stars" aria-label="5 out of 5 stars">${star.repeat(5)}</div>
     <p>“${esc(r[5])}”</p>
     <div class="rc-who"><span class="rc-av" aria-hidden="true">${initials(r[2])}</span><span><b>${esc(r[2])}</b>${esc(r[3])} · Google review</span></div></article>`;
  $$('.belt-track').forEach(tr => {
    const row = +tr.dataset.row, mine = REVIEWS.filter((_, i) => i % 2 === row);
    const set = `<div class="belt-set">${mine.map((r, i) => card(r, i + row * 2)).join('')}</div>`;
    tr.innerHTML = set + set.replace('class="belt-set"', 'class="belt-set" aria-hidden="true"');
    tr.style.setProperty('--dur', (mine.length * 9) + 's');
  });
  // slim ticker of short verbatim snippets under the hero
  const SNIPS = [['Always on time, excellent work and flexible to meet our needs.', 'Angelo P.'], ['Their pricing is clear and reasonable.', 'Austin Z.'],
    ['They are the true professionals.', 'Gary B.'], ['Hard workers in this Arizona heat!', 'Annie J.'], ['Clean install!', 'The Kim’s'],
    ['The organization and attention to detail really show in the quality of the work.', 'Alexis I.'],
    ['First Class Company. I Will Continue To Use Them.', 'Vic B.'], ['Fast and reliable.', 'Chaz S.'], ['Highly recommend them for solar needs!', 'Peter N.']];
  const tset = `<div class="tk-set">${SNIPS.map(([q, n]) => `<span class="tk-i"><span class="tk-st" aria-hidden="true">${star.repeat(5)}</span>“${esc(q)}”<b>${esc(n)}</b></span>`).join('')}</div>`;
  $('#ticker').innerHTML = tset + tset.replace('class="tk-set"', 'class="tk-set" aria-hidden="true"');

  /* ---------- service area: wires sag from the Mesa shop to each city on the real map (same projection as tools-map.py) ---------- */
  const CITIES = [['Tempe', 33.425, -111.940], ['Gilbert', 33.353, -111.789], ['Chandler', 33.306, -111.841], ['Apache Jct', 33.415, -111.549],
    ['Scottsdale', 33.494, -111.926], ['Ahwatukee', 33.341, -111.984], ['Queen Creek', 33.249, -111.634], ['Phoenix', 33.448, -112.074],
    ['Fountain Hills', 33.612, -111.717], ['Gold Canyon', 33.371, -111.437], ['San Tan Valley', 33.191, -111.528], ['Glendale', 33.539, -112.186],
    ['Peoria', 33.581, -112.237], ['Goodyear', 33.435, -112.358], ['Surprise', 33.631, -112.368]];
  const px = (lat, lon) => [(lon + 112.66) / 1.32 * 1000, (33.76 - lat) / .66 * 600];
  const svg = $('#gridMap'), NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p = svg) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p.appendChild(n); return n; };
  const [hx, hy] = px(33.4162, -111.8005);
  const gW = el('g', { class: 'gm-wires' }), gN = el('g', { class: 'gm-nodes' });
  const wires = CITIES.map(([name, lat, lon], i) => {
    const [x, y] = px(lat, lon), d = Math.hypot(x - hx, y - hy);
    const cx = (hx + x) / 2, cy = (hy + y) / 2 + d * .14;           // the sag of a line strung between two poles
    const path = `M${hx.toFixed(1)},${hy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    const g = el('g', { class: 'gm-w', style: `--i:${i}` }, gW);
    el('path', { d: path, class: 'gm-line', pathLength: 1 }, g);
    el('path', { d: path, class: 'gm-pulse', pathLength: 1 }, g);
    const n = el('g', { class: 'gm-c', style: `--i:${i}` }, gN);
    el('circle', { cx: x, cy: y, r: 9, class: 'gm-halo' }, n);
    el('circle', { cx: x, cy: y, r: 3.6, class: 'gm-dot' }, n);
    const right = x < 860 || name === 'Gold Canyon';
    el('text', { x: right ? x + 10 : x - 10, y: y + 4, class: 'gm-label', 'text-anchor': right ? 'start' : 'end' }, n).textContent = name;
    return g;
  });
  el('circle', { cx: hx, cy: hy, r: 10, class: 'gm-hq-ring' }); el('circle', { cx: hx, cy: hy, r: 6.5, class: 'gm-hq' });
  el('text', { x: hx + 14, y: hy - 12, class: 'gm-hq-label' }).textContent = 'MESA SHOP';
  // after the first sweep, keep sending a pulse down a random line every couple of seconds
  let loop;
  new IntersectionObserver(es => es.forEach(en => {
    const area = $('.area');
    if (en.isIntersecting) {
      area.classList.add('in');
      clearInterval(loop);
      loop = setInterval(() => { const w = wires[Math.floor(Math.random() * wires.length)]; w.classList.remove('ping'); void w.getBBox(); w.classList.add('ping'); }, 1700);
    } else clearInterval(loop);
  }), { threshold: .3 }).observe($('.area'));

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

  const tb = $('#tbDate'); if (tb) tb.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
  const rv = $$('.pnl, .evp-fig, .sec-head, .door, .dr-step, .dr-counts, .dr-quote, .dr-partner, .fix-copy, .term, .badge, .crew, .founder-fig, .founder-copy, .lender, .area-card, .qform, .qa details, .final-fig');
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
