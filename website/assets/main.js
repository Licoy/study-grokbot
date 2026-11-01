// 轻量交互：主题与语言下拉菜单、入场动效、标题逐词动画、移动端菜单、复制提示词、目录高亮、首页 Bot 小队演示、圆球 Bot
// Theme/language dropdowns, reveal animations, mobile menu, copy buttons, TOC highlight, home Bot-team demo, orb bots.
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
    document.querySelectorAll('[data-theme-set]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeSet === pref)));
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
    closeMenus(true);
  });

  // ---- 下拉菜单 / dropdowns (.dd): click to open, outside click / Esc to close, ↑↓ to move ----
  const menuItems = (dd) => [...dd.querySelectorAll('[role^="menuitem"]')];
  const setOpen = (dd, open, focus) => {
    const btn = dd.querySelector('.dd-btn'), menu = dd.querySelector('.dd-menu');
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    dd.classList.toggle('open', open);
    // preventScroll：菜单在吸顶页头里，聚焦时浏览器会按 scroll-padding 把页面往上带 / the menu sits in the sticky header; plain focus() scrolls the page
    if (open) (menuItems(dd).find((i) => i.getAttribute('aria-checked') === 'true') || menuItems(dd)[0])?.focus({ preventScroll: true });
    else if (focus) btn.focus({ preventScroll: true });
  };
  function closeMenus(focus) { document.querySelectorAll('.dd.open').forEach((dd) => setOpen(dd, false, focus)); }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.dd-btn');
    const dd = btn?.closest('.dd');
    if (dd) { const open = !dd.classList.contains('open'); closeMenus(); setOpen(dd, open); return; }
    if (!e.target.closest('.dd-menu')) closeMenus();
  });
  document.addEventListener('keydown', (e) => {
    const dd = e.target.closest?.('.dd.open');
    if (!dd) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(dd, false, true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = menuItems(dd), i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus({ preventScroll: true });
    } else if (e.key === 'Tab') setOpen(dd, false);
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
    const span = btn.querySelector('span'); // 图标保持不动，只换文字 / keep the icons, swap the label
    const label = btn.dataset.label || (btn.dataset.label = span.textContent);
    try { await navigator.clipboard.writeText(text); span.textContent = btn.dataset.copied; btn.classList.add('done'); }
    catch { span.textContent = btn.dataset.fail; }
    setTimeout(() => { span.textContent = label; btn.classList.remove('done'); }, 1600);
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

  // 首页 Bot 小队演示：每个 Bot 一段对话 + 一个群聊。进入视口后消息逐条载入（Bot 先“正在输入”，你的消息先在输入框里打出来再发送），
  // 播完停一会儿自动切到下一个会话；用户点过或用键盘操作过标签就不再自动切换，鼠标悬停、不在视口内或页面隐藏时暂停。←→ 在标签间移动。
  // Home Bot-team demo: one conversation per Bot + a group chat. Once on screen, messages load one by one (Bots "type" first; your
  // message is typed into the input and sent), then after a pause the next conversation opens. Auto-advance stops for good once the
  // user picks a tab (mouse or keyboard) and pauses on hover, off screen or in a hidden tab. ←/→ move between tabs.
  document.querySelectorAll('[data-showcase]').forEach((sc) => {
    const tabs = [...sc.querySelectorAll('[role="tab"]')];
    const side = sc.querySelector('.sc-side'), main = sc.querySelector('.sc-main');
    const panelOf = (t) => sc.querySelector(`#${t.getAttribute('aria-controls')}`);
    let current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    let auto = !reduce, visible = false, hover = false, started = false, timer = 0, run = 0;
    const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });

    // 播放时高度不跳：所有消息都显示时量一次高度并锁住 / measure with every message shown and lock it, so playback never shifts the page
    const lock = () => {
      const pend = [...main.querySelectorAll('.m.pending')];
      pend.forEach((m) => m.classList.remove('pending'));
      main.style.minHeight = '';
      main.style.minHeight = `${main.offsetHeight}px`;
      pend.forEach((m) => m.classList.add('pending'));
    };
    // 立刻显示整段对话（切走的会话、减少动态效果）/ show the whole conversation at once (panels we leave, reduced motion)
    const reset = (panel) => {
      panel.querySelectorAll('.m').forEach((m) => m.classList.remove('pending', 'pop', 'filled', 'is-typing'));
      panel.querySelectorAll('.m-typing-now').forEach((d) => d.remove());
      const ph = panel.querySelector('.sc-ph');
      if (ph.dataset.ph) { ph.textContent = ph.dataset.ph; ph.classList.remove('is-typing'); }
      panel.querySelector('.sc-send').classList.remove('press');
    };
    const appear = (m) => { m.classList.remove('pending'); m.classList.add('pop'); };
    const typeInto = async (panel, text, id) => {
      const ph = panel.querySelector('.sc-ph'), send = panel.querySelector('.sc-send');
      ph.dataset.ph ||= ph.textContent;
      ph.classList.add('is-typing');
      const step = Math.max(1, Math.ceil(text.length / 36));
      for (let i = step; i < text.length + step && id === run; i += step) {
        ph.textContent = text.slice(0, i);
        ph.scrollLeft = ph.scrollWidth;
        await wait(34);
      }
      send.classList.add('press');
      await wait(240);
      ph.textContent = ph.dataset.ph; ph.classList.remove('is-typing'); send.classList.remove('press');
    };
    const play = async (panel) => {
      const id = ++run;
      clearTimeout(timer);
      if (reduce) return;
      reset(panel);
      const msgs = [...panel.querySelectorAll('.m')];
      msgs.forEach((m) => m.classList.add('pending'));
      await wait(500);
      for (const m of msgs) {
        if (id !== run) return;
        const k = m.dataset.k;
        if (k === 'me') { await typeInto(panel, m.textContent.trim(), id); appear(m); }
        else if (k === 'tool' || k === 'typing') { await wait(380); appear(m); }
        else { // 先显示“正在输入”，再换成真正的内容 / show "typing…" first, then the real content
          appear(m); m.classList.add('is-typing');
          m.querySelector('.m-body').insertAdjacentHTML('beforeend', '<span class="m-typing m-typing-now"><span></span><span></span><span></span></span>');
          await wait(Math.min(1500, 600 + m.textContent.length * 8));
          m.querySelector('.m-typing-now')?.remove();
          m.classList.remove('is-typing'); m.classList.add('filled');
        }
        await wait(k === 'me' ? 520 : 420);
      }
      if (!auto) return;
      await wait(4200);
      while (id === run && (!visible || hover || document.hidden)) await wait(600);
      if (id === run && auto) select(tabs[(tabs.indexOf(current) + 1) % tabs.length]);
    };
    const select = (tab, focus) => {
      if (tab !== current) reset(panelOf(current));
      current = tab;
      tabs.forEach((t) => {
        const on = t === tab, panel = panelOf(t);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panel.classList.toggle('on', on);
        panel.toggleAttribute('inert', !on);
      });
      if (focus) tab.focus();
      // 只横向滚动标签栏（移动端），不带动整页 / scroll only the tab strip (mobile), never the page
      if (side.scrollWidth > side.clientWidth) side.scrollTo({ left: tab.offsetLeft - (side.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      play(panelOf(tab));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { auto = false; select(t); });
      t.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); auto = false; select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    if (reduce || !('IntersectionObserver' in window)) return;
    sc.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
    sc.addEventListener('pointerleave', () => { hover = false; });
    sc.addEventListener('focusin', () => { auto = false; });
    lock();
    panelOf(current).querySelectorAll('.m').forEach((m) => m.classList.add('pending'));
    let raf = 0;
    addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(lock); });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !started) { started = true; play(panelOf(current)); }
    }, { threshold: 0.3 }).observe(sc);
  });

  // 圆球 Bot（首页 Hero、页头/页脚 Logo）：眼睛跟随指针（鼠标/触摸），空闲时眨眼、游移；悬停时眯眼笑（CSS）；尊重“减少动态效果”
  // Orb bots (hero + header/footer logo): eyes follow the pointer (mouse/touch); idle blink + drift; squint-smile on hover (CSS);
  // honours prefers-reduced-motion.
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  // 静止时双眼对称、居中（看着你）；指针方向 (x,y) → 眼睛移动 EYE、头只轻移 HEAD（SVG 单位，头半径 114），
  // 视线一侧的眼睛按 SQUASH 变窄，像转过去了一点。
  // At rest the eyes are centred and symmetric (looking at you); pointer direction (x,y) moves the eyes by EYE and the head by HEAD
  // (SVG units, head radius 114); the eye on the gaze side narrows by SQUASH as if the head turned a little.
  const REST = [0, 0], EYE = 34, HEAD = 5, SQUASH = 0.22;
  let lastMove = -1e9;
  const orbs = [...document.querySelectorAll('[data-orb]')].map((orb) => {
    const eyes = orb.querySelector('.orb-eyes'), ball = orb.querySelector('.orb-ball');
    if (!eyes || !ball) return null;
    const eyeGs = [...orb.querySelectorAll('.orb-eye-g')];
    const eyeX = [...orb.querySelectorAll('.orb-eye')].map((e) => +e.getAttribute('x') + +e.getAttribute('width') / 2);
    const o = { tx: REST[0], ty: REST[1], x: REST[0], y: REST[1], raf: 0, visible: true, seed: Math.random() * 10 };
    o.draw = () => {
      const ox = o.x - REST[0], oy = o.y - REST[1];
      ball.setAttribute('transform', `translate(${(o.x * HEAD).toFixed(2)} ${(o.y * HEAD).toFixed(2)})`);
      eyes.setAttribute('transform', `translate(${(ox * EYE).toFixed(2)} ${(oy * EYE).toFixed(2)})`);
      eyeGs.forEach((g, i) => { // 左眼在向左看时变窄，右眼在向右看时变窄 / left eye narrows looking left, right eye looking right
        const k = 1 - SQUASH * Math.max(0, i ? ox : -ox), cx = eyeX[i];
        g.setAttribute('transform', `translate(${cx} 0) scale(${k.toFixed(3)} 1) translate(${-cx} 0)`);
      });
    };
    o.aim = (cx, cy) => {
      const r = orb.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / Math.max(r.width * 3, 120));
      o.tx = (dx / d) * k; o.ty = (dy / d) * k;
      if (rm.matches) { o.x = o.tx; o.y = o.ty; o.draw(); } else o.kick();
    };
    const tick = (now) => {
      o.raf = 0;
      if (now - lastMove > 2600) { // 空闲：缓慢游移 / idle drift
        const t = now / 1000 + o.seed;
        o.tx = REST[0] + Math.sin(t * 0.55) * 0.28; o.ty = REST[1] + Math.sin(t * 0.37 + 1) * 0.22;
      }
      o.x += (o.tx - o.x) * 0.14; o.y += (o.ty - o.y) * 0.14;
      o.draw();
      if (o.visible && !rm.matches) o.raf = requestAnimationFrame(tick);
    };
    o.kick = () => { if (!o.raf && o.visible && !rm.matches) o.raf = requestAnimationFrame(tick); };
    new IntersectionObserver(([e]) => { o.visible = e.isIntersecting; if (o.visible) o.kick(); else { cancelAnimationFrame(o.raf); o.raf = 0; } }).observe(orb);
    // 眨眼：随机间隔，偶尔连眨两下 / blink at random intervals, sometimes twice
    const blink = () => {
      if (!rm.matches && o.visible && !document.hidden) {
        orb.classList.add('blink');
        setTimeout(() => orb.classList.remove('blink'), 130);
        if (Math.random() < 0.25) setTimeout(() => { orb.classList.add('blink'); setTimeout(() => orb.classList.remove('blink'), 120); }, 300);
      }
      setTimeout(blink, 2600 + Math.random() * 3600);
    };
    setTimeout(blink, 1200 + Math.random() * 2000);
    o.draw(); o.kick();
    return o;
  }).filter(Boolean);
  if (orbs.length) {
    const aim = (x, y) => { lastMove = performance.now(); orbs.forEach((o) => o.aim(x, y)); };
    addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
    addEventListener('pointerdown', (e) => aim(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', (e) => { const p = e.touches[0]; p && aim(p.clientX, p.clientY); }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { lastMove = performance.now() - 2000; });
    rm.addEventListener?.('change', () => orbs.forEach((o) => o.kick()));
  }
})();
