(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(pointer:fine)').matches;
  const desk = matchMedia('(min-width:821px)').matches;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- scroll suave ---------- */
  let lenis = null;
  if (fine && !calm) {
    lenis = new Lenis({ lerp: .11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const alvo = $(a.getAttribute('href')); if (!alvo) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(alvo, { offset: 0, duration: 1.4 }) : alvo.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- viúvas ---------- */
  $$('h1,h2,h3,p,summary,.btn__t').forEach(el => {
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let last = null, n;
    while ((n = tw.nextNode())) if (n.nodeValue.trim()) last = n;
    if (last && last.nodeValue.trim().split(' ').length > 2) last.nodeValue = last.nodeValue.replace(/\s+(\S+)\s*$/, ' $1');
  });

  /* ---------- preloader + entrada ---------- */
  const pre = $('.pre');
  const abrir = () => { pre.classList.add('out'); document.body.classList.add('pronto'); $$('.hero .rv').forEach((el, i) => setTimeout(() => el.classList.add('in'), 350 + i * 130)); contar($('.chip--money [data-count]'), 1400); };
  addEventListener('load', () => setTimeout(abrir, calm ? 0 : 900));
  setTimeout(abrir, 3200);

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, irm = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    setTimeout(() => { el.classList.add('in'); setTimeout(() => el.classList.remove('rv', 'in'), 2200); }, irm.indexOf(el) * 90);
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv').filter(el => !el.closest('.hero')).forEach(el => io.observe(el));

  /* ---------- contador ---------- */
  const contados = new WeakSet();
  function contar(el, delay = 0) {
    if (!el || contados.has(el)) return; contados.add(el);
    const fim = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    gsap.to(o, { v: fim, duration: 2, delay: delay / 1000, ease: 'power3.out', onUpdate: () => el.textContent = o.v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) });
  }

  /* ---------- menu ---------- */
  const nav = $('.nav'), wrap = $('.nav__links'), hl = $('.nav__hl'), itens = $$('a', wrap); let ativo = null, ly = 0;
  const mover = a => { if (!a) return hl.classList.remove('is-visible'); const r = a.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    hl.style.width = r.width + 'px'; hl.style.height = r.height + 'px'; hl.style.transform = `translate(${r.left - w.left}px,${r.top - w.top}px)`; hl.classList.add('is-visible'); };
  itens.forEach(a => a.addEventListener('mouseenter', () => mover(a)));
  wrap.addEventListener('mouseleave', () => mover(ativo));
  const secs = itens.map(a => ({ a, s: $(a.getAttribute('href')) }));
  const prog = $('.prog i');
  const aoRolar = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max ? y / max : 0})`;
    nav.classList.toggle('hide', y > innerHeight * .9 && y > ly); ly = y;
    const linha = innerHeight * .4; let hit = null;
    secs.forEach(o => { const r = o.s.getBoundingClientRect(); if (r.top <= linha && r.bottom > linha) hit = o.a; });
    if (hit !== ativo) { ativo = hit; mover(ativo); }
  };
  addEventListener('scroll', aoRolar, { passive: true }); aoRolar();

  /* ---------- faixas ---------- */
  const frases = [['Seu conteúdo', 'Suas regras', 'Sua renda', 'Assinaturas', 'Lives', 'Chat', 'Links de pagamento'], ['Crie', 'Apareça', 'Fique em alta', 'Compartilhe', 'Venda', 'Conexões que valem']];
  $$('.faixa__t').forEach((t, i) => {
    t.innerHTML = Array(6).fill(frases[i].map(f => `<span>${f}</span>`).join('')).join('');
    const dir = i ? 1 : -1; let x = 0, vel = 0;
    const meio = () => t.scrollWidth / 6;
    gsap.ticker.add(() => { const w = meio(); x += dir * (.7 + vel); if (x <= -w) x += w; if (x > 0) x -= w; t.style.transform = `translateX(${x}px)`; vel *= .93; });
    ScrollTrigger.create({ onUpdate: s => { vel = Math.min(Math.abs(s.getVelocity()) / 260, 14); } });
  });

  if (calm) { $$('.mani__t').forEach(p => p.style.opacity = 1); return; }

  /* ---------- HERO: profundidade no scroll + mouse ---------- */
  const hero = $('.hero');
  gsap.to('.hero__bg', { scale: 1.22, yPercent: 6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__card', { scale: .93, borderRadius: 54, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__txt', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '25% top', end: '85% top', scrub: true } });
  $$('.hero [data-depth]').forEach(el => {
    const d = +el.dataset.depth;
    gsap.to(el, { y: -260 * d, rotate: (d > 1 ? 14 : -8) * d, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });
  });
  if (fine) {
    const camadas = $$('.hero [data-depth]').map(el => ({ x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }), d: +el.dataset.depth }));
    const bgx = gsap.quickTo('.hero__bg img', 'x', { duration: 1.6, ease: 'power3' });
    hero.addEventListener('pointermove', e => { const nx = e.clientX / innerWidth - .5; camadas.forEach(c => c.x(nx * -46 * c.d)); bgx(nx * 22); });
  }

  /* ---------- ZOOM DA CHAMA ---------- */
  const foto = $('.zoom__photo'), fimg = $('img', foto);
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.zoom', start: 'top top', end: 'bottom bottom', scrub: .5 } });
  const z = { p: 0 };
  tl.to(z, { p: 1, duration: 1, ease: 'power2.in', onUpdate: () => {
        const base = Math.min(innerWidth, innerHeight) * .26, alvo = Math.max(innerWidth, innerHeight) * 9;
        foto.style.setProperty('--s', (base * Math.pow(alvo / base, z.p)).toFixed(1) + 'px');
      } }, 0)
    .fromTo(fimg, { scale: 1.5 }, { scale: 1, duration: 1.3, ease: 'none' }, 0)
    .to('.zoom__w--l', { xPercent: -70, opacity: 0, duration: .5, ease: 'power1.in' }, .12)
    .to('.zoom__w--r', { xPercent: 70, opacity: 0, duration: .5, ease: 'power1.in' }, .12)
    .to('.zoom__glow', { scale: 4, opacity: 0, duration: .7 }, .1)
    .to('.zoom__hint', { opacity: 0, duration: .15 }, .05)
    .to(foto, { '--o': 1, duration: .3 }, .85)
    .fromTo('.zoom__in', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, .92)
    .to({}, { duration: .25 });

  /* ---------- manifesto: texto preenchendo ---------- */
  $$('[data-fill]').forEach(p => {
    const rosa = ['assinantes,', 'conversas', 'renda', 'verdade.'];
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w${rosa.includes(w) ? ' pk' : ''}">${w}</span>`).join(' ');
    const ws = $$('.w', p);
    ScrollTrigger.create({ trigger: p, start: 'top 82%', end: 'bottom 42%', scrub: true, onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
  });

  /* ---------- RECURSOS: scroll horizontal ---------- */
  if (desk) {
    const track = $('.hz__track'), cnt = $('.hz__count b'), barra = $('.hz__bar i'), cards = $$('.fc', track);
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.hz', pin: '.hz__pin', start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => { barra.style.transform = `scaleX(${s.progress})`; cnt.textContent = String(Math.min(6, 1 + Math.floor(s.progress * 6.4))).padStart(2, '0');
          const v = gsap.utils.clamp(-8, 8, s.getVelocity() / -260); cards.forEach(c => gsap.to(c, { skewX: v, rotate: v * .25, duration: .5, overwrite: 'auto' })); } } });
    cards.forEach((c, i) => gsap.from(c, { y: 120 + i * 30, opacity: 0, duration: 1.1, ease: 'power3.out', delay: i * .06, scrollTrigger: { trigger: '.hz', start: 'top 55%' } }));
  }

  /* luz de borda no ponteiro */
  if (matchMedia('(hover:hover)').matches) $$('[data-luz]').forEach(grupo => {
    const cards = $$('.luz', grupo); let tx = 0, ty = 0, cx = 0, cy = 0, dentro = false, raf = 0;
    const pinta = () => { cx += (tx - cx) * .14; cy += (ty - cy) * .14;
      cards.forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (cx - r.left).toFixed(1) + 'px'); c.style.setProperty('--my', (cy - r.top).toFixed(1) + 'px'); });
      raf = (dentro || Math.abs(tx - cx) > .4 || Math.abs(ty - cy) > .4) ? requestAnimationFrame(pinta) : 0; };
    grupo.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tx = e.clientX; ty = e.clientY;
      if (!dentro) { dentro = true; cx = tx; cy = ty; grupo.classList.add('luz-on'); } if (!raf) raf = requestAnimationFrame(pinta); });
    grupo.addEventListener('pointerleave', () => { dentro = false; grupo.classList.remove('luz-on'); });
  });

  /* ---------- COMO FUNCIONA: celular preso ---------- */
  const telas = $$('.scr'), passos = $$('.step'), phone = $('.phone');
  const ativar = i => { telas.forEach((t, k) => t.classList.toggle('is-on', k === i)); passos.forEach((p, k) => p.classList.toggle('on', k === i)); if (i === 2) contar($('.gr__v [data-count]'), 300); };
  passos.forEach((p, i) => ScrollTrigger.create({ trigger: p, start: 'top 58%', end: 'bottom 58%', onToggle: s => s.isActive && ativar(i) }));
  ativar(0);
  gsap.fromTo(phone, { rotateY: -26, rotateX: 10, rotate: -5 }, { rotateY: 22, rotateX: -6, rotate: 4, ease: 'none', transformPerspective: 1200, scrollTrigger: { trigger: '.como', start: 'top bottom', end: 'bottom top', scrub: .8 } });
  gsap.to('.obj--p1', { y: -220, ease: 'none', scrollTrigger: { trigger: '.como', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.obj--p2', { y: 180, ease: 'none', scrollTrigger: { trigger: '.como', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  /* ---------- GANHOS ---------- */
  const rS = $('#rSubs'), rP = $('#rPrice'), barras = $$('.calc__bars i'), tot = { v: 0 };
  const calc = () => {
    const s = +rS.value, p = +rP.value, total = s * p;
    [rS, rP].forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'));
    $('#vSubs').textContent = s.toLocaleString('pt-BR'); $('#vPrice').textContent = brl(p);
    gsap.to(tot, { v: total, duration: .8, ease: 'power3.out', overwrite: true, onUpdate: () => { $('#vTotal').textContent = brl(tot.v); $('#vYear').textContent = brl(tot.v * 12) + ' em 12 meses'; } });
    const f = Math.min(1, Math.log10(total) / 6);
    barras.forEach((b, i) => b.style.height = (14 + (i + 1) / barras.length * 86 * f * (.82 + .18 * Math.sin(i * 1.7))) + '%');
  };
  rS.addEventListener('input', calc); rP.addEventListener('input', calc); calc();
  gsap.fromTo('.painel__flame', { yPercent: 25, rotate: -14 }, { yPercent: -25, rotate: 10, ease: 'none', scrollTrigger: { trigger: '.painel', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.painel', { scale: .9, borderRadius: 80 }, { scale: 1, borderRadius: 44, ease: 'none', scrollTrigger: { trigger: '.painel', start: 'top bottom', end: 'top 30%', scrub: true } });

  /* ---------- HERO: vídeo em laço com volta suave para a foto ---------- */
  const hv = document.querySelector('.hero__vid');
  if (hv) {
    const toca = () => { hv.currentTime = 0; hv.play().then(() => hv.classList.add('on')).catch(() => {}); };
    hv.addEventListener('timeupdate', () => { if (hv.duration && hv.currentTime > hv.duration - 1.3) hv.classList.remove('on'); });
    hv.addEventListener('ended', () => setTimeout(toca, 250));
    hv.addEventListener('canplaythrough', toca, { once: true });
    if (hv.readyState > 3) toca();
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? (hv.paused && toca()) : hv.pause())).observe(hv);
  }

  /* ---------- GIRO: vídeo decodificado em quadros e preso ao scroll ---------- */
  (() => {
    const cv = document.querySelector('.giro__cv'); if (!cv) return;
    const ctx = cv.getContext('2d'), N = desk ? 80 : 44, quadros = [];
    let pronto = false, atual = -1, prog = 0;
    const poster = new Image(); poster.src = cv.dataset.poster;
    poster.onload = () => { if (!pronto) ctx.drawImage(poster, 0, 0, cv.width, cv.height); };
    const pinta = () => {
      if (!pronto) return;
      const i = Math.min(quadros.length - 1, Math.round(prog * (quadros.length - 1)));
      if (i === atual || !quadros[i]) return; atual = i;
      ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(quadros[i], 0, 0, cv.width, cv.height);
    };
    let carregando = false;
    const carrega = async () => {
      if (carregando) return; carregando = true;
      try {
        const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = cv.dataset.src;
        await new Promise((ok, no) => { v.addEventListener('loadeddata', ok, { once: true }); v.addEventListener('error', no, { once: true }); });
        const lado = desk ? 640 : 420, dur = v.duration - .08;
        for (let i = 0; i < N; i++) {
          v.currentTime = dur * i / (N - 1);
          await new Promise(ok => v.addEventListener('seeked', ok, { once: true }));
          quadros.push(await createImageBitmap(v, { resizeWidth: lado, resizeHeight: lado, resizeQuality: 'medium' }));
        }
        pronto = true; atual = -1; pinta();
      } catch (e) { /* sem vídeo: fica a imagem parada */ }
    };
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { carrega(); o.disconnect(); } }), { rootMargin: '250% 0px' }).observe(cv);
    const ws = [...document.querySelectorAll('.giro__w')], dots = [...document.querySelectorAll('.giro__dots i')]; let passo = 0;
    ScrollTrigger.create({ trigger: '.giro', start: 'top top', end: 'bottom bottom', scrub: .4,
      onUpdate: s => { prog = s.progress; pinta();
        const k = Math.min(2, Math.floor(s.progress * 3));
        if (k !== passo) { passo = k; ws.forEach((w, i) => { w.classList.toggle('is-on', i === k); w.classList.toggle('is-out', i < k); }); dots.forEach((d, i) => d.classList.toggle('is-on', i === k)); } } });
    gsap.fromTo(cv, { scale: .55, rotate: -10 }, { scale: 1.12, rotate: 6, ease: 'none', scrollTrigger: { trigger: '.giro', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
    gsap.fromTo('.giro__halo', { scale: .6 }, { scale: 1.5, ease: 'none', scrollTrigger: { trigger: '.giro', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  /* ---------- GALERIA ---------- */
  if (!desk) document.querySelectorAll('.gal__col').forEach(c => [...c.children].forEach(i => c.appendChild(i.cloneNode())));
  $$('.gal__col').forEach(c => { const d = +c.dataset.dir;
    gsap.fromTo(c, { yPercent: d < 0 ? 4 : -34 }, { yPercent: d < 0 ? -34 : 4, ease: 'none', scrollTrigger: { trigger: '.gal', start: 'top bottom', end: 'bottom top', scrub: .6 } }); });
  gsap.fromTo('.gal__cols', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.gal', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.fromTo('.gal__txt', { opacity: 0, scale: .86, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power2.out', scrollTrigger: { trigger: '.gal', start: 'top 20%', end: '35% top', scrub: true } });

  /* ---------- FIM ---------- */
  gsap.fromTo('.fim__flame', { scale: .5, rotate: -24, y: 80 }, { scale: 1, rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.fim', start: 'top 90%', end: 'top 15%', scrub: .8 } });

  /* ---------- botões magnéticos ---------- */
  if (fine) $$('[data-magnet]').forEach(el => {
    const x = gsap.quickTo(el, 'x', { duration: .8, ease: 'elastic.out(1,.6)' }), y = gsap.quickTo(el, 'y', { duration: .8, ease: 'elastic.out(1,.6)' });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .22); y((e.clientY - r.top - r.height / 2) * .3); });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });

  /* pausa laços fora da tela */
  const po = new IntersectionObserver(es => es.forEach(e => e.target.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'));
  $$('.obj,.hearts i,.mimo,.phone__ring').forEach(el => po.observe(el));

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => { ScrollTrigger.refresh(); mover(ativo); });
})();
