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
})();
