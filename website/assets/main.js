// 轻量交互：主题切换、语言偏好、入场动效、标题逐词动画、移动端菜单、复制提示词、目录高亮
// Theme toggle, language preference, reveal animations, mobile menu, copy buttons, TOC highlight.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

  // ---- 主题 / theme: auto | light | dark ----
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
  const applyTheme = (pref) => {
    const dark = pref === 'dark' || (pref === 'auto' && mq.matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-theme-pref', pref);
    metas.forEach((m) => {
      if (pref === 'auto') m.setAttribute('content', m.media.includes('dark') ? '#0a0a0a' : '#ffffff');
      else m.setAttribute('content', dark ? '#0a0a0a' : '#ffffff');
    });
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === pref)));
  };
  let pref = store.get('sg-theme') || 'auto';
  applyTheme(pref);
  mq.addEventListener?.('change', () => pref === 'auto' && applyTheme('auto'));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-set]');
    if (!b) return;
    pref = b.dataset.themeSet;
    store.set('sg-theme', pref);
    applyTheme(pref);
  });

  // ---- 语言 / language: a manual switch is remembered and overrides auto-detection ----
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-set-lang]');
    if (a) store.set('sg-lang', a.dataset.setLang);
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 标题逐词翻入（中文按空格/英文词切分）
  document.querySelectorAll('[data-split]').forEach((el) => {
    const parts = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((t) => t && parts.push(t.trim() ? `<span class="w">${t}</span>` : ' '));
      else parts.push(`<span class="w">${n.outerHTML}</span>`);
    });
    el.innerHTML = parts.join('');
    el.querySelectorAll('.w').forEach((w, i) => (w.style.transitionDelay = `${i * 70}ms`));
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  });

  const els = [...document.querySelectorAll('.reveal')];
  if (reduce || !('IntersectionObserver' in window)) els.forEach((e) => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e, i) => { e.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`; io.observe(e); });
  }

  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = menu.hasAttribute('hidden');
    menu.toggleAttribute('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.closest('.prompt').querySelector('pre').innerText;
    const label = btn.dataset.label || (btn.dataset.label = btn.textContent);
    try { await navigator.clipboard.writeText(text); btn.textContent = btn.dataset.copied; btn.classList.add('done'); }
    catch { btn.textContent = btn.dataset.fail; }
    setTimeout(() => { btn.textContent = label; btn.classList.remove('done'); }, 1600);
  });

  // 目录高亮
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (links.length) {
    const map = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const io2 = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.remove('active')); map.get(e.target.id)?.classList.add('active'); }
    }), { rootMargin: '-80px 0px -70% 0px' });
    map.forEach((_, id) => { const h = document.getElementById(id); h && io2.observe(h); });
  }

  // 首页圆球 Bot：眼睛跟随指针（鼠标/触摸），空闲时眨眼、游移；尊重“减少动态效果”
  // Hero orb bot: eyes follow the pointer (mouse/touch); idle blink + drift; honours prefers-reduced-motion.
  const orb = document.querySelector('[data-orb]');
  const eyes = orb?.querySelector('.orb-eyes'), ball = orb?.querySelector('.orb-ball');
  if (orb && eyes && ball) {
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    // 指针方向 → 球体偏移 BALL、眼睛在球上再偏移 EYE（SVG 单位；外环半径 60，球半径 41）
    // pointer direction → ball shifts up to BALL, eyes shift a further EYE on the ball (SVG units)
    const BALL = 9, EYE = 10;
    let tx = -0.35, ty = -0.35, x = tx, y = ty, lastMove = -1e9, raf = 0, visible = true;
    const aim = (cx, cy) => {
      const r = orb.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (r.width * 3));
      tx = (dx / d) * k; ty = (dy / d) * k;
      lastMove = performance.now();
      if (rm.matches) { x = tx; y = ty; draw(); } else kick();
    };
    const draw = () => {
      ball.setAttribute('transform', `translate(${(x * BALL).toFixed(2)} ${(y * BALL).toFixed(2)})`);
      eyes.setAttribute('transform', `translate(${(x * EYE).toFixed(2)} ${(y * EYE).toFixed(2)})`);
    };
    const tick = (now) => {
      raf = 0;
      if (now - lastMove > 2600) { // 空闲：缓慢游移 / idle drift
        const t = now / 1000;
        tx = Math.sin(t * 0.55) * 0.5; ty = Math.sin(t * 0.37 + 1) * 0.35 - 0.1;
      }
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      draw();
      if (visible && !rm.matches) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && visible && !rm.matches) raf = requestAnimationFrame(tick); };
    addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
    addEventListener('pointerdown', (e) => aim(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', (e) => { const p = e.touches[0]; p && aim(p.clientX, p.clientY); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { lastMove = performance.now() - 2000; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(orb);
    // 眨眼：随机间隔，偶尔连眨两下 / blink at random intervals, sometimes twice
    const blink = () => {
      if (!rm.matches && visible && !document.hidden) {
        orb.classList.add('blink');
        setTimeout(() => orb.classList.remove('blink'), 130);
        if (Math.random() < 0.25) setTimeout(() => { orb.classList.add('blink'); setTimeout(() => orb.classList.remove('blink'), 120); }, 300);
      }
      setTimeout(blink, 2600 + Math.random() * 3600);
    };
    setTimeout(blink, 1800);
    rm.addEventListener?.('change', kick);
    draw(); kick();
  }
})();
