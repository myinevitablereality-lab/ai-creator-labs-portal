(() => {
  "use strict";
  const S = window.ACL_STORE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const safeUrl = (u) => { u = String(u || "").trim(); if (!u) return ""; if (/^(https?:|mailto:)/i.test(u)) return u; if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith("//")) return ""; return u; };
  const isExternal = (u) => /^https?:/i.test(u) && !u.startsWith(location.origin);
  const linkAttrs = (u) => (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : "");
  const fmtPrice = (p) => { const n = Number(String(p).replace(/[^\d.]/g, "")); return isFinite(n) && n > 0 ? "Rp " + n.toLocaleString("id-ID") : esc(p); };
  const fmtDate = (iso) => { const d = new Date(iso + "T00:00:00"); return isNaN(d) ? "" : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); };
  const fmtMin = (m) => (m < 60 ? `±${m} menit` : `±${(Math.round((m / 60) * 2) / 2).toString().replace(".", ",")} jam`);
  const LEVELS = S.LEVELS;

  const I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/></svg>',
    mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    topic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
  };
  const KIND_ICON = { r: I.grid, v: I.video, a: I.book };
  const LOGO = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9cbff"/><stop offset="1" stop-color="#8fd6ff"/></linearGradient></defs><rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="url(#lg)" stroke-width="1.4"/><path d="M9.5 22 16 9l6.5 13M12 17h8" fill="none" stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="9" r="1.6" fill="#8fd6ff"/></svg>';
  const NAV = [["jalur", "jalur.html", "Jalur Belajar"], ["resources", "resources.html", "Materi"], ["knowledges", "knowledges.html", "Video"], ["articles", "articles.html", "Artikel"]];

  /* =========================================================
     Gerak & interaksi
     ========================================================= */
  const pointer = { x: -9999, y: -9999 };
  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

  function particles() {
    const c = $("#particles");
    if (!c) return;
    const ctx = c.getContext("2d");
    let w, h, dots = [], raf = null;
    const count = () => Math.round(Math.min(80, Math.max(28, (innerWidth * innerHeight) / 20000)));
    const make = (anywhere) => ({
      x: Math.random() * w, y: anywhere ? Math.random() * h : h + 10, r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.12, vy: -(Math.random() * 0.22 + 0.05), ox: 0, oy: 0,
      a: Math.random() * 0.5 + 0.2, t: Math.random() * 6.3, ts: Math.random() * 0.02 + 0.006, hue: Math.random() < 0.5 ? 230 : 265
    });
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = count(); while (dots.length < n) dots.push(make(true)); dots.length = n;
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const sy = scrollY * 0.15;
      for (const p of dots) {
        p.x += p.vx; p.y += p.vy; p.t += p.ts;
        // partikel menjauh lembut dari kursor
        const dx = p.x + p.ox - pointer.x, dy = p.y + p.oy - sy - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 126) * 1.6; p.ox += (dx / d) * f; p.oy += (dy / d) * f; }
        p.ox *= 0.94; p.oy *= 0.94;
        if (p.y < -10 || p.x < -10 || p.x > w + 10) Object.assign(p, make(false));
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.t));
        const y = ((p.y + p.oy - sy) % (h + 20) + h + 20) % (h + 20) - 10;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue},100%,88%,${alpha})`;
        ctx.shadowColor = `hsla(${p.hue},100%,75%,${alpha})`;
        ctx.shadowBlur = p.r * 6;
        ctx.arc(p.x + p.ox, y, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    resize();
    addEventListener("resize", resize, { passive: true });
    if (reduceMotion) { dots.forEach((p) => (p.vx = p.vy = p.ts = 0)); draw(); cancelAnimationFrame(raf); return; }
    draw();
    document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = null; } else if (!raf) draw(); });
  }

  function cursorGlow() {
    if (!finePointer || reduceMotion) return;
    const g = document.createElement("div");
    g.className = "cursor-glow"; g.setAttribute("aria-hidden", "true");
    $(".backdrop")?.appendChild(g);
    let x = innerWidth / 2, y = innerHeight / 3;
    (function loop() {
      if (pointer.x > -9000) { x += (pointer.x - x) * 0.08; y += (pointer.y - y) * 0.08; }
      g.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  // Elemen .rv muncul bertahap saat masuk layar
  const io = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" })
    : null;
  function reveal(root = document) {
    $$(".rv:not(.in)", root).forEach((el, i) => { el.style.setProperty("--i", i % 9); io ? io.observe(el) : el.classList.add("in"); });
  }

  // Kartu sedikit miring (halus) & bercahaya mengikuti kursor
  function tilt() {
    if (!finePointer || reduceMotion) return;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.(".tilt"); if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      el.style.setProperty("--rx", ((0.5 - y) * 2.5).toFixed(2) + "deg"); el.style.setProperty("--ry", ((x - 0.5) * 3).toFixed(2) + "deg");
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const el = e.target.closest?.(".tilt");
      if (el && !el.contains(e.relatedTarget)) { el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); }
    });
  }

  function countUp(el, to) {
    if (!el) return;
    if (reduceMotion) { el.textContent = to; return; }
    const t0 = performance.now(), d = 1200;
    const step = (t) => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function typePlaceholder(input, phrases) {
    if (reduceMotion || !phrases.length) return;
    const base = "Mau belajar ";
    let i = 0, j = 0, del = false;
    (function tick() {
      const w = phrases[i];
      j += del ? -1 : 1;
      input.placeholder = base + w.slice(0, j);
      let delay = del ? 28 : 65;
      if (!del && j >= w.length) { del = true; delay = 1800; }
      else if (del && j <= 0) { del = false; i = (i + 1) % phrases.length; delay = 260; }
      setTimeout(tick, delay);
    })();
  }

  /* =========================================================
     Bantuan umum
     ========================================================= */
  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  async function copyLink(url) {
    try { await navigator.clipboard.writeText(url); toast("Tautan disalin"); } catch { prompt("Salin tautan ini:", url); }
  }
  const artStyle = (hue) => `background:
      radial-gradient(circle at 28% 32%, hsl(${hue} 90% 72% / .85), transparent 38%),
      radial-gradient(circle at 78% 70%, hsl(${hue + 46} 80% 62% / .75), transparent 42%),
      radial-gradient(circle at 60% 10%, hsl(${hue - 30} 90% 80% / .35), transparent 30%),
      repeating-linear-gradient(115deg, rgba(255,255,255,.035) 0 2px, transparent 2px 14px),
      linear-gradient(135deg, hsl(${hue} 55% 22%), hsl(${hue + 30} 50% 10%));`;
  const ytEmbed = (id) => `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Pemutar video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  const pillsHTML = (list, active, attr) => list.map((x) => `<li><button class="pill" type="button" data-${attr}="${esc(x.value)}" aria-pressed="${x.value === active}">${x.icon || ""}${esc(x.label)}${x.count != null ? ` <span class="count">${x.count}</span>` : ""}</button></li>`).join("");
  const emptyState = (msg) => `<div class="empty-state rv" style="grid-column:1/-1">${msg}</div>`;

  /* ---------- Data & relasi (diisi setelah load) ---------- */
  let D = null;
  const byKey = new Map();
  const topicOf = (id) => D.topics.find((t) => t.id === id);
  const pathOf = (id) => D.paths.find((p) => p.id === id);
  const pageOf = (x) => S.KIND[x.kind].page;
  const hrefOf = (x) => `${pageOf(x)}?open=${encodeURIComponent(x.id)}`;
  const kindLabel = (k) => S.KIND[k].label;
  const stepsOf = (key) => D.paths.flatMap((p) => p.steps.map((k, i) => (k === key ? { path: p, i } : null)).filter(Boolean));
  const isDone = (key) => S.me.has("done", key);
  function pathStats(p) {
    const done = p.steps.filter(isDone).length, total = p.steps.length;
    const next = p.steps.findIndex((k) => !isDone(k));
    const min = p.steps.reduce((m, k) => m + (byKey.get(k)?.min || 0), 0);
    const left = p.steps.reduce((m, k) => m + (isDone(k) ? 0 : byKey.get(k)?.min || 0), 0);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0, next, min, left, complete: total > 0 && done === total };
  }
  const chainTo = (p) => { const out = []; const seen = new Set(); while (p && !seen.has(p.id)) { seen.add(p.id); out.unshift(p); p = p.after ? pathOf(p.after) : null; } return out; };
  const childrenOf = (p) => D.paths.filter((x) => x.after === p.id);

  /* Rekomendasi dari jawaban sambutan */
  function recommend(prof) {
    if (!prof || prof.skipped || !D.paths.length) return null;
    const score = (p) => (p.exp.includes(prof.exp) ? 2 : 0) + (p.goal.includes(prof.goal) ? 1 : 0);
    const start = [...D.paths].sort((a, b) => score(b) - score(a) || a.depth - b.depth)[0];
    const goalP = [...D.paths].filter((p) => p.goal.includes(prof.goal)).sort((a, b) => b.depth - a.depth || score(b) - score(a))[0] || start;
    let route = chainTo(goalP);
    route = route.includes(start) ? route.slice(route.indexOf(start)) : [start];
    const current = route.find((p) => !pathStats(p).complete) || route[route.length - 1];
    const left = route.reduce((m, p) => m + pathStats(p).left, 0);
    const weekly = S.WEEKLY_MIN[prof.time] || 120;
    return { start, goal: goalP, route, current, left, weeks: Math.max(1, Math.ceil(left / weekly)) };
  }

  /* ---------- Simpan & tanda selesai ---------- */
  const saveBtn = (key, label = "Simpan") => `<button class="save-btn" type="button" data-save="${esc(key)}" aria-pressed="${S.me.has("saved", key)}" aria-label="${label}" title="${label}">${I.mark}</button>`;
  const doneBadge = (key) => (isDone(key) ? `<span class="done-badge" title="Sudah dipelajari">${I.check}</span>` : "");
  const emit = () => document.dispatchEvent(new CustomEvent("acl:me"));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-save]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const on = S.me.toggle("saved", b.dataset.save);
    $$(`[data-save="${CSS.escape(b.dataset.save)}"]`).forEach((x) => { x.setAttribute("aria-pressed", on); x.classList.remove("pop"); void x.offsetWidth; x.classList.add("pop"); });
    toast(on ? "Disimpan ke koleksimu" : "Dihapus dari koleksi");
    emit();
  });

  /* ---------- Dialog ---------- */
  let sheet;
  function openSheet(html, onClose, cls = "") {
    if (!sheet) {
      sheet = document.createElement("dialog");
      document.body.appendChild(sheet);
      sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
      sheet.addEventListener("close", () => { document.body.style.overflow = ""; sheet.innerHTML = ""; const f = sheet._onClose; sheet._onClose = null; f && f(); });
    }
    sheet.className = "sheet " + cls;
    sheet.onclick = null;
    sheet.innerHTML = `<button class="sheet-close" type="button" aria-label="Tutup">${I.close}</button>${html}`;
    $(".sheet-close", sheet).addEventListener("click", () => sheet.close());
    sheet._onClose = onClose;
    document.body.style.overflow = "hidden";
    if (!sheet.open) sheet.showModal();
    $(".sheet-close", sheet).focus({ preventScroll: true });
    sheet.scrollTop = 0; requestAnimationFrame(() => (sheet.scrollTop = 0));
    return sheet;
  }
  const setOpenParam = (key) => { const u = new URL(location.href); key ? u.searchParams.set("open", key) : u.searchParams.delete("open"); history.replaceState(null, "", u); };

  function doneToggle(key) {
    const on = isDone(key);
    return `<button class="btn ${on ? "" : "secondary"}" type="button" data-done="${esc(key)}" aria-pressed="${on}">${I.check} ${on ? "Sudah dipelajari" : "Tandai sudah dipelajari"}</button>`;
  }

  /* Banner posisi konten di jalur belajar */
  function stepBanner(x, ctxPath) {
    const all = stepsOf(x.key);
    if (!all.length) return "";
    const st = all.find((s) => s.path.id === ctxPath) || all[0];
    const p = st.path, n = p.steps.length, prev = byKey.get(p.steps[st.i - 1]), next = byKey.get(p.steps[st.i + 1]);
    const ps = pathStats(p);
    return `
      <div class="step-banner">
        <div class="sb-top"><a href="jalur.html?p=${p.id}">${I.route}<span>Jalur ${p.n} · ${esc(p.title)}</span></a><b>Langkah ${st.i + 1} dari ${n}</b></div>
        <span class="bar"><span style="--w:${ps.pct}%"></span></span>
        <div class="sb-nav">
          ${prev ? `<a class="btn secondary small" href="${hrefOf(prev)}" data-key="${prev.key}" data-ctx="${p.id}">${I.left} Langkah ${st.i}</a>` : "<span></span>"}
          ${next ? `<a class="btn small" href="${hrefOf(next)}" data-key="${next.key}" data-ctx="${p.id}">Lanjut ke langkah ${st.i + 2} ${I.right}</a>` : `<a class="btn small" href="jalur.html?p=${p.id}">Akhir jalur · lihat ringkasan ${I.right}</a>`}
        </div>
      </div>`;
  }
  const topicChip = (x) => { const t = topicOf(x.topic); return t ? `<a class="tag" href="topik.html?t=${t.id}">${esc(t.name)}</a>` : ""; };
  const levelChip = (x) => (x.level ? `<span class="lvl" data-l="${esc(x.level)}">${esc(x.level)}</span>` : "");

  function wireSheetActions(x, ctxPath) {
    S.me.visit(x.key);
    emit();
    sheet.onclick = (e) => {
      if (e.target === sheet) return sheet.close();
      const d = e.target.closest("[data-done]"); if (!d) return;
      const on = S.me.toggle("done", x.key);
      d.outerHTML = doneToggle(x.key);
      const b = $(".step-banner", sheet); if (b) b.outerHTML = stepBanner(x, ctxPath);
      const nextBtn = $(".sb-nav .btn:not(.secondary)", sheet);
      toast(on ? (nextBtn && nextBtn.dataset.key ? "Ditandai selesai ✓ · lanjut ke langkah berikutnya" : "Ditandai sudah dipelajari ✓") : "Tanda dipelajari dihapus");
      emit();
    };
    const c = $("[data-copy]", sheet);
    c && c.addEventListener("click", () => copyLink(new URL(hrefOf(x), location.href).href));
    setOpenParam(x.key);
  }

  function openItem(key, ctxPath) {
    const x = byKey.get(key);
    if (!x) return;
    const actions = (extra = "") => `<div class="s-actions">${extra}${doneToggle(x.key)}${saveBtn(x.key)}<button class="btn secondary" type="button" data-copy>${I.link} Salin tautan</button></div>`;
    const head = (meta) => `${stepBanner(x, ctxPath)}<div class="s-chips">${topicChip(x)}${levelChip(x)}<span class="kind">${kindLabel(x.kind)}</span></div><h2>${esc(x.title)}</h2><div class="s-meta">${meta.filter(Boolean).map((m) => `<span>${m}</span>`).join("")}</div>`;
    let html = "";
    if (x.kind === "r") {
      html = `${x.image ? `<img class="sheet-cover" src="${esc(safeUrl(x.image))}" alt="">` : ""}
        <div class="sheet-body">${head([esc(x.format), x.time && `${I.clock}${esc(x.time)}`])}
          <p>${esc(x.desc)}</p>
          ${x.items.length ? `<h4>Yang ada di dalamnya</h4><ul class="check">${x.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
          ${actions(safeUrl(x.url) ? `<a class="btn" href="${esc(safeUrl(x.url))}"${linkAttrs(x.url)}>${I.ext} Buka materi</a>` : "")}
          ${related(x)}
        </div>`;
    } else if (x.kind === "v") {
      html = `${x.yt ? ytEmbed(x.yt) : `<button class="vplay" type="button" aria-label="Putar video">${thumbHTML(x)}</button>`}
        <div class="sheet-body">${head([x.dur && `${I.clock}${esc(x.dur)} menit`, x.chapters.length && `${x.chapters.length} bab`])}
          <p>${esc(x.desc)}</p>
          ${x.chapters.length ? `<h4>Daftar bab</h4><ol class="chapters">${x.chapters.map(([n, t]) => `<li><span>${esc(n)}</span><span>${esc(t)}</span></li>`).join("")}</ol>` : ""}
          ${x.yt ? "" : `<p class="notice">Video lengkap diputar di ruang belajar member AI Creator Labs.</p>`}
          ${actions()}
          ${related(x)}
        </div>`;
    } else {
      html = `${x.image ? `<img class="sheet-cover" src="${esc(safeUrl(x.image))}" alt="">` : ""}
        <div class="sheet-body">${head([x.date && fmtDate(x.date), x.read && `${I.clock}${esc(x.read)} menit baca`, "Tim AI Creator Labs"])}
          <p class="lead">${esc(x.excerpt)}</p>
          ${x.points.length ? `<h4>Poin utama</h4><ul class="check">${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
          ${x.body.length ? x.body.map((p, i) => `<p${i === 0 ? ' style="margin-top:18px"' : ""}>${esc(p)}</p>`).join("") : `<p style="margin-top:18px">Coba terapkan satu poin di atas minggu ini, lalu catat apa yang berubah. Belajar AI paling cepat terjadi lewat praktik kecil yang konsisten.</p>`}
          ${actions(safeUrl(x.url) ? `<a class="btn" href="${esc(safeUrl(x.url))}"${linkAttrs(x.url)}>${I.ext} Baca selengkapnya</a>` : "")}
          ${related(x)}
        </div>`;
    }
    openSheet(html, () => setOpenParam(null));
    $(".vplay", sheet)?.addEventListener("click", () => toast("Video lengkap tersedia untuk member"));
    wireSheetActions(x, ctxPath);
  }
  // 3 konten lain dengan topik yang sama
  function related(x) {
    const list = [...D.resources, ...D.videos, ...D.articles].filter((y) => y.topic && y.topic === x.topic && y.key !== x.key).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)).slice(0, 3);
    if (!list.length) return "";
    const t = topicOf(x.topic);
    return `<h4>Masih di topik ${esc(t.name)}</h4><div class="mini-list">${list.map(miniRow).join("")}</div><a class="more-link" href="topik.html?t=${t.id}">Semua tentang ${esc(t.name)} ${I.right}</a>`;
  }
  const miniRow = (x, extra = "") => `<a class="mini" href="${hrefOf(x)}" data-key="${x.key}"><span class="r-ico">${KIND_ICON[x.kind]}</span><span class="r-text"><strong>${esc(x.title)}</strong><span>${kindLabel(x.kind)}${x.level ? " · " + x.level : ""}${isDone(x.key) ? " · ✓ dipelajari" : ""}${extra}</span></span></a>`;

  // Klik tautan konten di mana pun → buka detailnya di halaman ini
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-key]");
    if (!a || !D || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    if (palette && palette.open) palette.close();
    openItem(a.dataset.key, a.dataset.ctx);
  });

  /* ---------- Kartu ---------- */
  const thumbHTML = (v, opts = {}) => `
    <div class="thumb">
      ${v.image ? `<img class="art" src="${esc(safeUrl(v.image))}" alt="" loading="lazy" decoding="async">` : `<div class="art" style="${artStyle(v.hue)}"></div><span class="glyph">${esc(topicOf(v.topic)?.name || "Video")}</span>`}
      <span class="play" aria-hidden="true">${I.play}</span>
      ${!opts.noDur && v.dur ? `<span class="dur">${esc(v.dur)}</span>` : ""}
    </div>`;
  const stepTag = (x) => { const s = stepsOf(x.key)[0]; return s ? `<span class="step-tag" title="${esc(s.path.title)}">${I.route}Jalur ${s.path.n} · Langkah ${s.i + 1}</span>` : ""; };
  const resourceCard = (r) => `
    <article class="card tilt rv">
      ${r.image ? `<img class="card-img" src="${esc(safeUrl(r.image))}" alt="" loading="lazy">` : ""}
      <span class="card-top"><span class="card-chips">${topicOf(r.topic) ? `<span class="tag">${esc(topicOf(r.topic).name)}</span>` : ""}${levelChip(r)}</span><span class="card-top-r">${doneBadge(r.key)}${saveBtn(r.key)}</span></span>
      <h3><a class="stretched" href="${hrefOf(r)}" data-key="${r.key}">${esc(r.title)}</a></h3>
      <p>${esc(r.desc)}</p>
      <span class="card-foot"><span>${[r.format, r.time].filter(Boolean).map(esc).join(" · ")}${stepTag(r)}</span><span class="arrow">${I.arrow}</span></span>
    </article>`;
  const videoCard = (v) => `
    <article class="vcard rv">
      <div class="vthumb">${thumbHTML(v)}<span class="vcard-actions">${doneBadge(v.key)}${saveBtn(v.key)}</span></div>
      <div>
        <h3><a class="stretched" href="${hrefOf(v)}" data-key="${v.key}">${esc(v.title)}</a></h3>
        <span class="v-meta">${[topicOf(v.topic)?.name, v.level].filter(Boolean).map(esc).join('<span class="dot"></span>')}</span>
        ${stepTag(v)}
      </div>
    </article>`;
  const articleRows = (list) => `<ul class="alist">${list.map((a) => `
      <li class="arow rv">
        <time datetime="${esc(a.date)}">${a.date ? fmtDate(a.date) : ""}</time>
        <div><h3><a class="stretched" href="${hrefOf(a)}" data-key="${a.key}">${esc(a.title)}</a></h3><p>${esc(a.excerpt)}</p>
          <span class="a-tags">${topicOf(a.topic) ? `<span>${esc(topicOf(a.topic).name)}</span>` : ""}${a.level ? `<span>${esc(a.level)}</span>` : ""}${stepTag(a)}${isDone(a.key) ? `<span class="a-done">${I.check} dipelajari</span>` : ""}</span></div>
        <span class="a-side">${a.read ? `<span class="a-read">${esc(a.read)} menit baca</span>` : ""}${saveBtn(a.key)}</span>
      </li>`).join("")}</ul>`;

  /* =========================================================
     Pencarian (dipakai palet Ctrl+K dan kotak chat beranda)
     ========================================================= */
  let index = null;
  function buildIndex() {
    const tn = (id) => topicOf(id)?.name || "";
    return [
      ...D.paths.map((p) => ({ type: "Jalur Belajar", icon: I.route, title: p.title, sub: `Jalur ${p.n} · ${p.level || ""} · ${p.steps.length} langkah`, hay: norm(`${p.title} ${p.desc} jalur`), href: `jalur.html?p=${p.id}` })),
      ...D.topics.map((t) => ({ type: "Topik", icon: I.topic, title: t.name, sub: t.desc, hay: norm(`${t.name} ${t.desc} topik`), href: `topik.html?t=${t.id}` })),
      ...[...D.resources, ...D.videos, ...D.articles].map((x) => ({ type: kindLabel(x.kind), icon: KIND_ICON[x.kind], title: x.title, sub: [tn(x.topic), x.level, x.kind === "v" ? x.dur : x.kind === "a" ? (x.read ? x.read + " menit baca" : "") : x.format].filter(Boolean).join(" · "), hay: norm(`${x.title} ${x.desc || x.excerpt || ""} ${tn(x.topic)} ${x.level} ${x.format || ""}`), href: hrefOf(x), key: x.key }))
    ];
  }
  const STOP = new Set(["cara", "apa", "itu", "yang", "dan", "di", "ke", "untuk", "saya", "bagaimana", "dengan", "mau", "belajar", "ingin", "tentang", "aku", "gimana", "hari", "ini"]);
  function search(q) {
    index ||= buildIndex();
    const terms = norm(q).split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));
    if (!terms.length) return null;
    return index.map((it) => ({ it, s: terms.reduce((s, t) => s + (it.hay.includes(t) ? (norm(it.title).includes(t) ? 3 : 1) : 0), 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.it);
  }
  const GROUPS = ["Jalur Belajar", "Topik", "Materi", "Video", "Artikel"];
  const resultRow = (r, i) => `<a class="result" style="--i:${i}" href="${r.href}"${r.key ? ` data-key="${r.key}"` : ""} data-q-go><span class="r-ico">${r.icon}</span><span class="r-text"><strong>${esc(r.title)}</strong><span>${esc(r.sub || "")}</span></span></a>`;
  function resultsHTML(res, per = 4) {
    let n = 0;
    return GROUPS.map((g) => [g, res.filter((r) => r.type === g).slice(0, per)]).filter(([, l]) => l.length).map(([g, l]) => `<h3>${g}</h3>` + l.map((r) => resultRow(r, n++)).join("")).join("");
  }

  /* ---------- Palet pencarian (Ctrl+K) ---------- */
  let palette = null;
  function openPalette(initial = "") {
    if (!D) return;
    if (!palette) {
      palette = document.createElement("dialog");
      palette.className = "palette";
      palette.setAttribute("aria-label", "Cari di portal");
      palette.innerHTML = `
        <div class="pal-box">${I.search}<label class="sr-only" for="pal-q">Cari</label><input id="pal-q" type="search" placeholder="Cari jalur, topik, materi, video, artikel…" autocomplete="off" enterkeyhint="go"><kbd>Esc</kbd></div>
        <div class="pal-body" id="pal-body"></div>`;
      document.body.appendChild(palette);
      palette.addEventListener("click", (e) => { if (e.target === palette) palette.close(); });
      palette.addEventListener("close", () => (document.body.style.overflow = ""));
      const q = $("#pal-q", palette), body = $("#pal-body", palette);
      let sel = 0, t;
      const items = () => $$(".result", body);
      const mark = () => items().forEach((el, i) => el.classList.toggle("active", i === sel));
      const draw = () => {
        const v = q.value, res = search(v);
        sel = 0;
        if (res === null) {
          const qs = S.me.get().queries;
          body.innerHTML = `${qs.length ? `<h3>Pencarian terakhir</h3><div class="pal-chips">${qs.map((x) => `<button class="pill" type="button" data-fill="${esc(x)}">${I.clock}${esc(x)}</button>`).join("")}</div>` : ""}
            <h3>Jalur belajar</h3>${D.paths.map((p, i) => resultRow({ icon: I.route, title: p.title, sub: `Jalur ${p.n} · ${p.steps.length} langkah · ${pathStats(p).pct}% selesai`, href: `jalur.html?p=${p.id}` }, i)).join("")}
            <h3>Topik populer</h3><div class="pal-chips">${D.topics.map((x) => `<a class="pill" href="topik.html?t=${x.id}">${esc(x.name)}</a>`).join("")}</div>`;
        } else body.innerHTML = res.length ? resultsHTML(res, 5) : `<p class="empty">Belum ada yang cocok untuk “${esc(v)}”. Coba kata lain, misalnya “prompt” atau “automasi”.</p>`;
        mark();
      };
      q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(draw, 90); });
      q.addEventListener("keydown", (e) => {
        const list = items();
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!list.length) return; sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length; mark(); list[sel].scrollIntoView({ block: "nearest" }); }
        else if (e.key === "Enter") { e.preventDefault(); const el = list[sel]; if (el) { S.me.query(q.value); el.click(); } }
      });
      body.addEventListener("click", (e) => {
        const f = e.target.closest("[data-fill]"); if (f) { q.value = f.dataset.fill; draw(); q.focus(); return; }
        if (e.target.closest("[data-q-go]")) S.me.query(q.value);
      });
      palette._draw = draw;
    }
    const q = $("#pal-q", palette);
    q.value = initial;
    palette._draw();
    if (!palette.open) palette.showModal();
    document.body.style.overflow = "hidden";
    q.focus();
  }
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); palette && palette.open ? palette.close() : openPalette(); }
    else if (e.key === "/" && !typing && !(sheet && sheet.open)) { e.preventDefault(); openPalette(); }
  });

  /* ---------- Tersimpan & Menu (dipakai header dan navigasi bawah) ---------- */
  function lookupKey(key) { return byKey.get(key); }
  function openSaved() {
    const saved = S.me.list("saved").map(lookupKey).filter(Boolean);
    const prog = D.paths.map((p) => { const s = pathStats(p); return `<a class="prog" href="jalur.html?p=${p.id}"><span class="prog-top"><span>Jalur ${p.n} · ${esc(p.title)}</span><b>${s.done}/${s.total}</b></span><span class="bar"><span style="--w:${s.pct}%"></span></span></a>`; }).join("");
    openSheet(`<div class="sheet-body">
      <p class="eyebrow">Koleksimu</p><h2>Tersimpan</h2>
      <p class="muted-sm">Tersimpan di perangkat ini saja, tanpa perlu akun.</p>
      ${saved.length ? GROUPS.slice(2).map((g) => { const l = saved.filter((x) => kindLabel(x.kind) === g); return l.length ? `<h4>${g}</h4><div class="mini-list">${l.map((x) => miniRow(x)).join("")}</div>` : ""; }).join("") : `<div class="empty-state" style="margin-top:12px">${I.mark}<p>Belum ada yang disimpan.<br>Tekan ikon penanda di kartu mana pun untuk menyimpannya di sini.</p></div>`}
      ${D.paths.length ? `<h4>Progres jalur belajar</h4>${prog}` : ""}
    </div>`, null, "side");
  }
  function openMenu() {
    openSheet(`<div class="sheet-body">
      <p class="eyebrow">Menu</p><h2>Jelajahi</h2>
      <nav class="menu-list" aria-label="Menu">
        ${[["index.html", I.home, "Beranda", "Rekomendasi & ruang belajarmu"], ["jalur.html", I.route, "Jalur Belajar", "Urutan belajar bertahap"], ["resources.html", I.grid, "Materi", "Panduan, template, cheatsheet"], ["knowledges.html", I.video, "Video", "Pustaka video pembelajaran"], ["articles.html", I.book, "Artikel", "Tulisan pendek & praktis"], ["topik.html", I.topic, "Topik", "Semua konten per topik"]]
          .map(([h, ic, l, s]) => `<a class="menu-item" href="${h}"><span class="r-ico">${ic}</span><span><b>${l}</b><small>${s}</small></span>${I.right}</a>`).join("")}
      </nav>
      <h4>Topik</h4><div class="pal-chips">${D.topics.map((t) => `<a class="pill" href="topik.html?t=${t.id}">${esc(t.name)}</a>`).join("")}</div>
      <div class="menu-foot"><button class="btn secondary small" type="button" data-reonboard>Ubah jawaban rekomendasi</button><a class="btn secondary small" href="admin.html">Admin</a></div>
    </div>`, null, "side");
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-palette]")) { e.preventDefault(); openPalette(); }
    else if (e.target.closest("[data-saved]")) { e.preventDefault(); D && openSaved(); }
    else if (e.target.closest("[data-menu]")) { e.preventDefault(); D && openMenu(); }
    else if (e.target.closest("[data-reonboard]")) { e.preventDefault(); S.me.profile(null); location.href = "index.html#mulai"; }
  });

  /* ---------- Header, footer, navigasi bawah ---------- */
  function chrome() {
    const cur = (k) => (k === page ? ' aria-current="page"' : "");
    const h = $("#site-header");
    if (h) {
      h.innerHTML = `<nav class="inner" aria-label="Navigasi utama">
        <a class="brand" href="index.html" aria-label="AI Creator Labs — beranda">${LOGO}<span>AI Creator Labs<small>Portal belajar</small></span></a>
        <ul class="tabs">${NAV.map(([k, href, l]) => `<li><a class="tab" href="${href}"${cur(k)}>${l}</a></li>`).join("")}</ul>
        <div class="h-acts">
          <button class="search-btn" type="button" data-palette aria-label="Cari (${isMac ? "⌘" : "Ctrl"} K)">${I.search}<span>Cari</span><kbd>${isMac ? "⌘" : "Ctrl"} K</kbd></button>
          <button class="icon-btn" type="button" data-saved aria-label="Tersimpan" title="Tersimpan">${I.mark}<span class="dot-count" id="saved-count" hidden></span></button>
        </div>
      </nav>`;
      // Header ikut menempel; mengecil & lebih pekat setelah digulir
      const onScroll = () => h.classList.toggle("scrolled", scrollY > 8);
      onScroll(); addEventListener("scroll", onScroll, { passive: true });
      // Di beranda, tab header baru muncul setelah tab besar di hero lewat
      const hero = $("#hero-nav");
      if (hero && "IntersectionObserver" in window) { h.classList.add("hero-mode"); new IntersectionObserver(([en]) => h.classList.toggle("hero-mode", en.isIntersecting || en.boundingClientRect.top > 0)).observe(hero); }
    }
    const f = $("#site-footer");
    if (f) f.innerHTML = `<span>© ${new Date().getFullYear()} AI Creator Labs · Ruang belajar AI untuk kreator</span><span><a href="index.html">Beranda</a> · ${NAV.map(([, href, l]) => `<a href="${href}">${l}</a>`).join(" · ")} · <a href="topik.html">Topik</a></span>`;
    const b = $("#bottom-nav");
    if (b) b.innerHTML = [
      `<a href="index.html"${cur("home")}>${I.home}<span>Beranda</span></a>`,
      `<a href="jalur.html"${cur("jalur")}>${I.route}<span>Jalur</span></a>`,
      `<button type="button" data-palette>${I.search}<span>Cari</span></button>`,
      `<button type="button" data-saved>${I.mark}<span>Tersimpan</span><span class="dot-count" id="saved-count-b" hidden></span></button>`,
      `<button type="button" data-menu${["resources", "knowledges", "articles", "topik"].includes(page) ? ' aria-current="page"' : ""}>${I.menu}<span>Menu</span></button>`
    ].join("");
    const counts = () => { const n = S.me.list("saved").length; ["saved-count", "saved-count-b"].forEach((id) => { const el = document.getElementById(id); if (el) { el.hidden = !n; el.textContent = n > 9 ? "9+" : n; } }); };
    counts(); document.addEventListener("acl:me", counts);
  }

  /* =========================================================
     BERANDA
     ========================================================= */
  function pathCard(p, rec, opts = {}) {
    const s = pathStats(p), inRoute = rec && rec.route.includes(p), isCur = rec && rec.current === p;
    return `
      <a class="path-card tilt rv ${isCur ? "current" : ""} ${s.complete ? "complete" : ""}" href="jalur.html?p=${p.id}">
        <span class="pc-top"><span class="pc-n">Jalur ${p.n}</span>${isCur ? `<span class="badge">Disarankan untukmu</span>` : inRoute ? `<span class="badge soft">Di rutemu</span>` : ""}${s.complete ? `<span class="badge ok">${I.check} Selesai</span>` : ""}</span>
        <span class="pc-title">${esc(p.title)}</span>
        ${opts.desc ? `<span class="pc-desc">${esc(p.desc)}</span>` : ""}
        <span class="pc-meta">${[p.level, `${s.total} langkah`, fmtMin(s.min)].filter(Boolean).join(" · ")}</span>
        <span class="bar"><span style="--w:${s.pct}%"></span></span>
        <span class="pc-foot"><span>${s.done ? `${s.pct}% selesai` : "Belum dimulai"}</span>${I.right}</span>
      </a>`;
  }
  function pathMap(rec, opts = {}) {
    const cols = [];
    D.paths.forEach((p) => (cols[p.depth] ||= []).push(p));
    return `<div class="path-map" style="--cols:${cols.length}">${cols.map((c, i) => `<div class="pm-col">${i ? `<span class="pm-arrow" aria-hidden="true">${I.right}</span>` : ""}<div class="pm-stack">${c.map((p) => pathCard(p, rec, opts)).join("")}</div></div>`).join("")}</div>`;
  }

  function home() {
    const icoFor = (u) => (/jalur/.test(u) ? I.route : /topik/.test(u) ? I.topic : /knowledges/.test(u) ? I.video : /articles/.test(u) ? I.book : /resources/.test(u) ? I.grid : I.spark);
    $("#shortcuts").innerHTML = D.shortcuts.map((s, i) => { const u = safeUrl(s.url) || "#"; return `<li class="pop-in" style="--i:${i}"><a class="pill" href="${esc(u)}"${linkAttrs(u)}>${icoFor(u)}${esc(s.label)}</a></li>`; }).join("");

    // Kotak chat: memakai mesin pencarian yang sama dengan palet
    const form = $("#ask"), input = $("#ask-input"), out = $("#results");
    function render(q) {
      const res = search(q);
      if (res === null) { out.hidden = true; out.innerHTML = ""; return; }
      out.hidden = false;
      out.innerHTML = res.length ? resultsHTML(res) : `<p class="empty">Belum ada materi untuk “${esc(q)}”. Coba kata lain, atau mulai dari <a href="jalur.html" style="text-decoration:underline">Jalur Belajar</a>.</p>`;
    }
    let t;
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => render(input.value), 140); });
    form.addEventListener("submit", (e) => { e.preventDefault(); S.me.query(input.value); render(input.value); const first = $(".result", out); if (first && search(input.value).length === 1) first.click(); if (!input.value.trim()) input.focus(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Escape") { input.value = ""; render(""); } });
    out.addEventListener("click", (e) => { if (e.target.closest("[data-q-go]")) S.me.query(input.value); });
    typePlaceholder(input, ["apa hari ini?", ...D.topics.slice(0, 6).map((x) => x.name.toLowerCase() + "?")]);

    countUp($("#stat-p"), D.paths.length);
    countUp($("#stat-r"), D.resources.length);
    countUp($("#stat-v"), D.videos.length);
    countUp($("#stat-a"), D.articles.length);
    $("#scroll-cue").hidden = !D.paths.length;

    renderStart();
    renderPathsSec();
    renderMe();
    document.addEventListener("acl:me", () => { renderStartRec(); renderPathsSec(true); renderMe(); });
    addEventListener("pageshow", (e) => { if (e.persisted) { S.me._s = null; renderStart(); renderPathsSec(true); renderMe(); } });

    renderCustom();
    if (location.hash === "#mulai") setTimeout(() => $("#mulai").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), 300);
  }

  /* ---------- Sambutan & rekomendasi ---------- */
  const Q_KEYS = ["exp", "goal", "time"];
  let quiz = { i: 0, a: {} };
  function renderStart() {
    const box = $("#mulai");
    if (!box) return;
    if (!D.paths.length) { box.hidden = true; return; }
    const prof = S.me.profile();
    if (prof && prof.skipped) {
      box.innerHTML = `<div class="start-strip rv">${I.spark}<span>Belum tahu mulai dari mana? Jawab 3 pertanyaan singkat, kami sarankan titik mulai yang pas.</span><button class="btn small" type="button" data-quiz-open>Bantu saya memilih</button></div>`;
    } else if (prof && prof.exp) {
      renderStartRec();
      return;
    } else {
      const k = Q_KEYS[quiz.i], q = S.ONBOARD[k];
      box.innerHTML = `
        <div class="start-card quiz rv">
          <div class="sc-head">
            <p class="eyebrow">Baru di sini?</p>
            <h2 class="h2">Mulai dari <em>mana</em>?</h2>
            <p>Jawab 3 pertanyaan singkat, kami sarankan titik mulai yang pas. Semua materi tetap bisa kamu buka kapan saja.</p>
          </div>
          <div class="sc-quiz" aria-live="polite">
            <div class="q-progress"><span>Pertanyaan ${quiz.i + 1} dari 3</span><span class="q-dots">${Q_KEYS.map((_, i) => `<i class="${i < quiz.i ? "done" : i === quiz.i ? "on" : ""}"></i>`).join("")}</span></div>
            <h3 class="q-title">${q.q}</h3>
            <div class="q-opts" role="group" aria-label="${esc(q.q)}">${q.options.map(([v, l]) => `<button class="q-opt" type="button" data-ans="${v}" aria-pressed="${quiz.a[k] === v}">${esc(l)}${I.right}</button>`).join("")}</div>
            <div class="q-foot">${quiz.i ? `<button class="link-btn" type="button" data-quiz-back>${I.left} Kembali</button>` : "<span></span>"}<button class="link-btn" type="button" data-quiz-skip>Lewati, saya mau jelajah sendiri</button></div>
          </div>
        </div>`;
    }
    reveal(box);
  }
  function renderStartRec() {
    const box = $("#mulai"), prof = S.me.profile();
    if (!box || !prof || !prof.exp) return;
    const rec = recommend(prof);
    if (!rec) { box.hidden = true; return; }
    const p = rec.current, s = pathStats(p), stepKey = p.steps[s.next >= 0 ? s.next : 0], x = byKey.get(stepKey);
    const started = rec.route.some((r) => pathStats(r).done);
    const label = (k, v) => (S.ONBOARD[k].options.find((o) => o[0] === v) || [, ""])[1];
    box.innerHTML = `
      <div class="start-card rec rv">
        <div class="sc-head">
          <p class="eyebrow">Rekomendasi untukmu</p>
          <h2 class="h2">${started ? "Lanjutkan" : "Mulai dari"} <em>${esc(p.title)}</em></h2>
          <p>${esc(p.desc)}</p>
          <div class="route" aria-label="Rute belajarmu">${rec.route.map((r, i) => { const rs = pathStats(r); return `${i ? `<span class="route-sep">${I.right}</span>` : ""}<a class="route-step ${r === p ? "on" : ""} ${rs.complete ? "ok" : ""}" href="jalur.html?p=${r.id}">${rs.complete ? I.check : `<b>${r.n}</b>`}${esc(r.title)}</a>`; }).join("")}</div>
          <p class="rec-meta">${I.clock}Sisa ${fmtMin(rec.left)} materi · sekitar <b>${rec.weeks} minggu</b> dengan waktumu (${esc(label("time", prof.time))} per minggu)</p>
        </div>
        <div class="sc-next">
          ${x ? `<p class="sn-label">${s.complete ? "Jalur ini sudah selesai" : `Langkah ${s.next + 1} dari ${s.total}`}</p>
          <a class="next-card" href="${hrefOf(x)}" data-key="${x.key}" data-ctx="${p.id}"><span class="r-ico">${KIND_ICON[x.kind]}</span><span class="r-text"><small>${kindLabel(x.kind)} · ${fmtMin(x.min)}</small><strong>${esc(x.title)}</strong></span>${I.right}</a>
          <a class="btn" href="${hrefOf(x)}" data-key="${x.key}" data-ctx="${p.id}">${s.done ? "Lanjutkan langkah " + (s.next + 1) : "Mulai langkah 1"} ${I.right}</a>` : ""}
          <div class="sn-links"><a href="jalur.html?p=${p.id}">Lihat jalur lengkap</a><button class="link-btn" type="button" data-quiz-redo>Ubah jawaban</button></div>
          <p class="sn-note">Berdasarkan: ${esc(label("exp", prof.exp))} · ${esc(label("goal", prof.goal))}</p>
        </div>
      </div>`;
    reveal(box);
    $$(".rv", box).forEach((x) => x.classList.add("in"));
  }
  document.addEventListener("click", (e) => {
    const box = $("#mulai"); if (!box || !box.contains(e.target)) return;
    const a = e.target.closest("[data-ans]");
    if (a) {
      quiz.a[Q_KEYS[quiz.i]] = a.dataset.ans;
      $$("[data-ans]", box).forEach((b) => b.setAttribute("aria-pressed", b === a));
      setTimeout(() => {
        if (quiz.i < 2) { quiz.i++; renderStart(); $$(".rv", box).forEach((x) => x.classList.add("in")); $(".q-opt", box)?.focus({ preventScroll: true }); }
        else { S.me.profile({ ...quiz.a, at: Date.now() }); quiz = { i: 0, a: {} }; renderStart(); renderPathsSec(true); toast("Rekomendasimu sudah siap"); }
      }, reduceMotion ? 0 : 180);
      return;
    }
    if (e.target.closest("[data-quiz-back]")) { quiz.i = Math.max(0, quiz.i - 1); renderStart(); $$(".rv", box).forEach((x) => x.classList.add("in")); return; }
    if (e.target.closest("[data-quiz-skip]")) { S.me.profile({ skipped: true }); renderStart(); $$(".rv", box).forEach((x) => x.classList.add("in")); return; }
    if (e.target.closest("[data-quiz-open], [data-quiz-redo]")) { S.me.profile(null); quiz = { i: 0, a: {} }; renderStart(); renderPathsSec(true); $$(".rv", box).forEach((x) => x.classList.add("in")); box.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
  });

  function renderPathsSec(instant) {
    const box = $("#paths-sec");
    if (!box) return;
    if (!D.paths.length) { box.hidden = true; return; }
    const rec = recommend(S.me.profile());
    box.innerHTML = `
      <div class="hl-head rv"><p class="eyebrow">Jalur belajar</p><h2 class="h2">Peta belajar <em>bertahap</em></h2><p>Mulai dari kiri, lalu pilih cabang sesuai tujuanmu. Setiap jalur berisi langkah berurutan dari materi, video, dan artikel.</p></div>
      ${pathMap(rec)}
      <a class="more-link rv" href="jalur.html">Lihat semua jalur & langkahnya ${I.right}</a>`;
    reveal(box);
    if (instant) $$(".rv", box).forEach((x) => x.classList.add("in"));
  }

  function renderMe() {
    const box = $("#me");
    if (!box) return;
    const recent = S.me.get().recent.map(lookupKey).filter(Boolean).slice(0, 4);
    const saved = S.me.list("saved").map(lookupKey).filter(Boolean);
    const started = D.paths.filter((p) => pathStats(p).done);
    if (!recent.length && !saved.length && !started.length) { box.hidden = true; return; }
    const prog = (started.length ? started : D.paths.slice(0, 3)).map((p) => { const s = pathStats(p); return `<a class="prog" href="jalur.html?p=${p.id}"><span class="prog-top"><span>${esc(p.title)}</span><b>${s.done}/${s.total}</b></span><span class="bar"><span style="--w:${s.pct}%"></span></span></a>`; }).join("");
    box.hidden = false;
    box.innerHTML = `
      <div class="hl-head"><p class="eyebrow">Ruang belajarmu</p><h2 class="h2">Lanjutkan dari <em>terakhir</em> kali</h2><p>Tersimpan di perangkat ini saja, tanpa perlu akun.</p></div>
      <div class="me-grid">
        <div class="me-col rv"><h3>Progres jalur</h3>${prog}</div>
        <div class="me-col rv"><h3>Terakhir dilihat</h3>${recent.length ? recent.map((x) => miniRow(x)).join("") : `<p class="muted">Belum ada. Buka satu materi untuk mulai.</p>`}</div>
        <div class="me-col rv"><h3>Disimpan <span class="count">${saved.length}</span></h3>${saved.length ? saved.slice(0, 4).map((x) => miniRow(x)).join("") : `<p class="muted">Tekan ikon penanda pada kartu untuk menyimpan.</p>`}</div>
      </div>`;
    reveal(box);
  }

  function renderCustom() {
    const custom = $("#custom");
    custom.innerHTML = D.custom.map((g, gi) => `
      <section class="hl" aria-labelledby="hl-${gi}">
        <div class="hl-head rv"><p class="eyebrow">Sorotan</p><h2 class="h2" id="hl-${gi}">${esc(g.feature.name)}</h2>${g.feature.description ? `<p>${esc(g.feature.description)}</p>` : ""}</div>
        <div class="hl-grid">${g.items.map((it, ii) => hlCard(it, `${gi}:${ii}`)).join("")}</div>
      </section>`).join("");
    custom.addEventListener("click", (e) => {
      const b = e.target.closest("[data-hl]"); if (!b) return;
      const [gi, ii] = b.dataset.hl.split(":").map(Number);
      openCustom(D.custom[gi].feature, D.custom[gi].items[ii]);
    });
  }
  function hlCard(it, ref) {
    const y = S.ytId(it.youtube), img = safeUrl(it.image) || (y ? S.ytThumb(y) : ""), url = safeUrl(it.url);
    const title = esc(it.title || it.label || it.name || "Tanpa judul");
    const price = it.price ? `<span class="price">${fmtPrice(it.price)}</span>` : "";
    if (img) {
      const inner = `<span class="hl-media"><img src="${esc(img)}" alt="" loading="lazy" decoding="async">${y ? `<span class="play" aria-hidden="true">${I.play}</span>` : ""}</span><span class="hl-body"><span class="hl-title">${title}</span>${price}</span>`;
      return `<button class="hl-card media tilt rv" type="button" data-hl="${ref}">${inner}</button>`;
    }
    const body = `<span class="hl-body"><span class="hl-title">${title}</span>${it.desc ? `<span class="hl-desc">${esc(it.desc)}</span>` : ""}${price}${url ? `<span class="hl-more">Buka ${I.arrow}</span>` : ""}</span>`;
    return url ? `<a class="hl-card text tilt rv" href="${esc(url)}"${linkAttrs(url)}>${body}</a>` : `<div class="hl-card text tilt rv">${body}</div>`;
  }
  function openCustom(f, it) {
    const y = S.ytId(it.youtube), img = safeUrl(it.image), url = safeUrl(it.url);
    const extra = f.fields.filter((x) => !["title", "desc", "youtube", "image", "url", "price"].includes(x.key) && it[x.key]);
    openSheet(`
      ${y ? ytEmbed(y) : img ? `<img class="sheet-cover big" src="${esc(img)}" alt="">` : ""}
      <div class="sheet-body">
        <div class="s-chips"><span class="tag">${esc(f.name)}</span></div>
        <h2>${esc(it.title || "Tanpa judul")}</h2>
        ${it.price ? `<p class="price big">${fmtPrice(it.price)}</p>` : ""}
        ${it.desc ? `<p>${esc(it.desc)}</p>` : ""}
        ${extra.map((x) => `<h4>${esc(x.label)}</h4><p>${x.type === "date" ? fmtDate(it[x.key]) : esc(it[x.key])}</p>`).join("")}
        ${url ? `<div class="s-actions"><a class="btn" href="${esc(url)}"${linkAttrs(url)}>${I.ext} ${it.price ? "Lihat produk" : "Buka tautan"}</a></div>` : ""}
      </div>`);
  }

  /* =========================================================
     MATERI · VIDEO · ARTIKEL (halaman daftar)
     ========================================================= */
  function listPage(kind) {
    const all = { r: D.resources, v: D.videos, a: D.articles }[kind];
    const word = kindLabel(kind).toLowerCase();
    const topicIds = D.topics.filter((t) => all.some((x) => x.topic === t.id)).map((t) => t.id);
    let topic = params.get("view") === "saved" ? "__saved" : topicIds.includes(params.get("t")) ? params.get("t") : "";
    let level = LEVELS.includes(params.get("level")) ? params.get("level") : "";
    let q = params.get("q") || "";
    const pills = $("#topic-pills"), seg = $("#level-seg"), grid = $("#list"), meta = $("#meta"), searchEl = $("#search");
    searchEl.value = q;

    if (kind === "v") {
      const feat = D.videos[0], fe = $("#featured");
      if (feat) fe.innerHTML = `${thumbHTML(feat)}<div class="f-body"><div class="s-chips">${topicChip(feat)}${levelChip(feat)}</div><h2><a class="stretched" href="${hrefOf(feat)}" data-key="${feat.key}">${esc(feat.title)}</a></h2><p>${esc(feat.desc)}</p><span class="btn">${I.play} Tonton${feat.dur ? " · " + esc(feat.dur) : ""}</span></div>`;
      else fe.hidden = true;
    }
    const savedCount = () => all.filter((x) => S.me.has("saved", x.key)).length;
    function renderPills() {
      pills.innerHTML = pillsHTML([{ value: "", label: "Semua", count: all.length }, ...topicIds.map((id) => ({ value: id, label: topicOf(id).name, count: all.filter((x) => x.topic === id).length })), { value: "__saved", label: "Disimpan", icon: I.mark, count: savedCount() }], topic, "topic");
      seg.innerHTML = [["", "Semua level"], ...LEVELS.map((l) => [l, l])].map(([v, l]) => `<button type="button" data-level="${v}" aria-pressed="${v === level}">${l}</button>`).join("");
    }
    function render() {
      const nq = norm(q.trim());
      const list = all.filter((x) => (!topic || (topic === "__saved" ? S.me.has("saved", x.key) : x.topic === topic)) && (!level || x.level === level) && (!nq || norm(`${x.title} ${x.desc || x.excerpt || ""} ${topicOf(x.topic)?.name || ""} ${x.format || ""}`).includes(nq)));
      const sorted = kind === "a" ? [...list].sort((a, b) => String(b.date).localeCompare(String(a.date))) : list;
      const total = sorted.reduce((m, x) => m + x.min, 0);
      meta.textContent = `${sorted.length} ${word}${topic === "__saved" ? " tersimpan" : topic ? ` · ${topicOf(topic).name}` : ""}${level ? ` · ${level}` : ""}${nq ? ` · “${q.trim()}”` : ""}${total ? ` · ${fmtMin(total)}` : ""}`;
      const empty = topic === "__saved" ? `Belum ada ${word} yang disimpan. Tekan ikon penanda di kartu untuk menyimpannya.` : D.source === "error" ? "Konten belum bisa dimuat. Coba muat ulang halaman." : `Tidak ada ${word} yang cocok. Coba kata kunci lain atau pilih “Semua”.`;
      grid.innerHTML = sorted.length ? (kind === "r" ? sorted.map(resourceCard).join("") : kind === "v" ? sorted.map(videoCard).join("") : articleRows(sorted)) : emptyState(empty);
      reveal(grid);
    }
    function syncURL() {
      const u = new URL(location.href);
      ["t", "view", "q", "level"].forEach((k) => u.searchParams.delete(k));
      if (topic === "__saved") u.searchParams.set("view", "saved"); else if (topic) u.searchParams.set("t", topic);
      if (level) u.searchParams.set("level", level);
      if (q.trim()) u.searchParams.set("q", q.trim());
      history.replaceState(null, "", u);
    }
    pills.addEventListener("click", (e) => { const b = e.target.closest("[data-topic]"); if (!b) return; topic = b.dataset.topic; renderPills(); render(); syncURL(); });
    seg.addEventListener("click", (e) => { const b = e.target.closest("[data-level]"); if (!b) return; level = b.dataset.level; renderPills(); render(); syncURL(); });
    searchEl.addEventListener("input", () => { q = searchEl.value; render(); syncURL(); });
    document.addEventListener("acl:me", () => { const y = scrollY; renderPills(); render(); $$(".rv", grid).forEach((x) => x.classList.add("in")); scrollTo(0, y); });
    renderPills(); render();
  }

  /* =========================================================
     JALUR BELAJAR
     ========================================================= */
  function jalurPage() {
    const root = $("#jalur");
    function view() {
      const id = new URLSearchParams(location.search).get("p"), p = id && pathOf(id);
      const rec = recommend(S.me.profile());
      if (!p) {
        document.title = "Jalur Belajar — AI Creator Labs";
        root.innerHTML = `
          <div class="page-head">
            <p class="eyebrow reveal">Jalur belajar</p>
            <h1 class="page-title reveal d1">Belajar AI <em>bertahap</em></h1>
            <p class="lede reveal d2">Setiap jalur berisi langkah berurutan dari materi, video, dan artikel. Mulai dari Jalur 1 bila baru mengenal AI, lalu pilih cabang sesuai tujuanmu.</p>
          </div>
          ${rec ? `<div class="start-strip rv">${I.spark}<span>Disarankan untukmu: <b>${esc(rec.current.title)}</b> · ${rec.route.map((r) => esc(r.title)).join(" → ")}</span><a class="btn small" href="jalur.html?p=${rec.current.id}">Buka jalur</a></div>` : `<div class="start-strip rv">${I.spark}<span>Bingung mulai dari mana? Jawab 3 pertanyaan singkat di beranda.</span><a class="btn small" href="index.html#mulai" data-reonboard>Bantu saya memilih</a></div>`}
          ${D.paths.length ? pathMap(rec, { desc: true }) : emptyState("Belum ada jalur belajar.")}
          <div class="how rv"><div><b>1</b><span>Ikuti langkah sesuai urutan. Setiap langkah bisa dibuka langsung dari halaman jalur.</span></div><div><b>2</b><span>Tandai “sudah dipelajari” agar progresmu tercatat di perangkat ini.</span></div><div><b>3</b><span>Semua konten tetap bisa diakses bebas lewat Materi, Video, Artikel, atau Topik.</span></div></div>`;
      } else {
        document.title = `${p.title} — Jalur Belajar · AI Creator Labs`;
        const s = pathStats(p), before = p.after && pathOf(p.after), next = childrenOf(p);
        const bs = before && pathStats(before);
        root.innerHTML = `
          <a class="back-link reveal" href="jalur.html">${I.left} Semua jalur</a>
          <div class="page-head path-head">
            <p class="eyebrow reveal">Jalur ${p.n}${p.level ? " · " + esc(p.level) : ""}</p>
            <h1 class="page-title reveal d1">${esc(p.title)}</h1>
            <p class="lede reveal d2">${esc(p.desc)}</p>
            <div class="path-stats reveal d3"><span><b>${s.total}</b> langkah</span><span><b>${fmtMin(s.min).replace("±", "")}</b> total</span><span><b>${s.pct}%</b> selesai</span></div>
            <span class="bar big reveal d3"><span style="--w:${s.pct}%"></span></span>
          </div>
          ${before && !bs.complete ? `<div class="start-strip warn rv">${I.route}<span>Sebaiknya selesaikan dulu <b>Jalur ${before.n} · ${esc(before.title)}</b> (${bs.done}/${bs.total} langkah). Kalau sudah paham dasarnya, boleh langsung mulai.</span><a class="btn secondary small" href="jalur.html?p=${before.id}">Buka Jalur ${before.n}</a></div>` : ""}
          <ol class="timeline">${p.steps.map((k, i) => {
            const x = byKey.get(k), done = isDone(k), cur = i === s.next;
            return `<li class="tl-step rv ${done ? "done" : ""} ${cur ? "current" : ""}">
              <span class="tl-dot">${done ? I.check : i + 1}</span>
              <a class="tl-card" href="${hrefOf(x)}" data-key="${x.key}" data-ctx="${p.id}">
                <span class="tl-meta"><span class="kind">${KIND_ICON[x.kind]}${kindLabel(x.kind)}</span>${topicOf(x.topic) ? `<span>${esc(topicOf(x.topic).name)}</span>` : ""}<span>${fmtMin(x.min)}</span>${cur ? `<span class="badge">${s.done ? "Lanjutkan di sini" : "Mulai di sini"}</span>` : ""}</span>
                <span class="tl-title">${esc(x.title)}</span>
                <span class="tl-desc">${esc(x.desc || x.excerpt || "")}</span>
              </a>
            </li>`; }).join("")}</ol>
          ${s.complete ? `<div class="done-card rv">${I.check}<div><b>Jalur selesai. Keren!</b><span>${next.length ? "Lanjutkan ke jalur berikutnya:" : "Kamu sudah menyelesaikan jalur ini."}</span></div></div>` : ""}
          ${next.length ? `<div class="section-label rv"><h2>Setelah jalur ini</h2></div><div class="next-paths">${next.map((x) => pathCard(x, rec, { desc: true })).join("")}</div>` : ""}`;
        const first = byKey.get(p.steps[s.next >= 0 ? s.next : 0]);
        if (first && !s.complete) root.querySelector(".bar.big").insertAdjacentHTML("afterend", `<a class="btn path-cta reveal d3" href="${hrefOf(first)}" data-key="${first.key}" data-ctx="${p.id}">${s.done ? `Lanjutkan langkah ${s.next + 1}` : "Mulai langkah 1"} ${I.right}</a>`);
      }
      reveal(root);
    }
    view();
    document.addEventListener("acl:me", () => { const y = scrollY; view(); $$(".rv", root).forEach((x) => x.classList.add("in")); scrollTo(0, y); });
    addEventListener("popstate", view);
  }

  /* =========================================================
     TOPIK
     ========================================================= */
  function topikPage() {
    const root = $("#topik");
    const t = topicOf(params.get("t"));
    const content = (id) => [...D.resources, ...D.videos, ...D.articles].filter((x) => x.topic === id);
    if (!t) {
      root.innerHTML = `
        <div class="page-head"><p class="eyebrow reveal">Topik</p><h1 class="page-title reveal d1">Semua <em>topik</em></h1><p class="lede reveal d2">Satu topik berisi materi, video, dan artikel yang saling melengkapi, diurutkan dari level pemula.</p></div>
        <div class="tag-index topic-index">${D.topics.map((x) => { const c = content(x.id); return `
          <a class="tag-card tilt rv" href="topik.html?t=${x.id}">
            <span class="t-name">${esc(x.name)}</span>
            ${x.desc ? `<p>${esc(x.desc)}</p>` : ""}
            <span class="t-count">${["r", "v", "a"].map((k) => { const n = c.filter((y) => y.kind === k).length; return n ? `${n} ${kindLabel(k).toLowerCase()}` : ""; }).filter(Boolean).join(" · ") || "Belum ada konten"} →</span>
          </a>`; }).join("")}</div>`;
      reveal(root);
      return;
    }
    document.title = `${t.name} — Topik · AI Creator Labs`;
    let level = "";
    function view() {
      const c = content(t.id).filter((x) => !level || x.level === level).sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));
      const inPaths = D.paths.filter((p) => p.steps.some((k) => byKey.get(k)?.topic === t.id));
      const sec = (k, label, html) => { const l = c.filter((x) => x.kind === k); return l.length ? `<div class="section-label rv"><h2>${label}</h2><span class="result-meta" style="margin:0">${l.length} ${label.toLowerCase()}</span></div><div class="${k === "r" ? "grid" : k === "v" ? "vgrid" : ""}" style="margin-top:16px">${html(l)}</div>` : ""; };
      root.innerHTML = `
        <a class="back-link reveal" href="topik.html">${I.left} Semua topik</a>
        <div class="page-head"><p class="eyebrow reveal">Topik</p><h1 class="page-title reveal d1">${esc(t.name)}</h1>${t.desc ? `<p class="lede reveal d2">${esc(t.desc)}</p>` : ""}</div>
        ${inPaths.length ? `<div class="in-paths reveal d3"><span>Ada di jalur:</span>${inPaths.map((p) => `<a class="pill" href="jalur.html?p=${p.id}">${I.route}Jalur ${p.n} · ${esc(p.title)}</a>`).join("")}</div>` : ""}
        <div class="toolbar reveal d3"><div class="seg" role="group" aria-label="Saring berdasarkan level">${[["", "Semua level"], ...LEVELS.map((l) => [l, l])].map(([v, l]) => `<button type="button" data-level="${v}" aria-pressed="${v === level}">${l}</button>`).join("")}</div></div>
        ${c.length ? sec("v", "Video", (l) => l.map(videoCard).join("")) + sec("r", "Materi", (l) => l.map(resourceCard).join("")) + sec("a", "Artikel", articleRows) : emptyState("Belum ada konten di topik ini untuk level tersebut.")}`;
      reveal(root);
    }
    root.addEventListener("click", (e) => { const b = e.target.closest("[data-level]"); if (!b) return; level = b.dataset.level; view(); $$(".rv", root).forEach((x) => x.classList.add("in")); });
    view();
    document.addEventListener("acl:me", () => { const y = scrollY; view(); $$(".rv", root).forEach((x) => x.classList.add("in")); scrollTo(0, y); });
  }

  /* =========================================================
     Boot
     ========================================================= */
  chrome();
  particles();
  cursorGlow();
  tilt();
  S.load().then((data) => {
    D = data;
    [...D.resources, ...D.videos, ...D.articles].forEach((x) => byKey.set(x.key, x));
    document.body.classList.add("ready");
    ({ home, jalur: jalurPage, topik: topikPage, resources: () => listPage("r"), knowledges: () => listPage("v"), articles: () => listPage("a") }[page] || (() => {}))();
    reveal();
    // ?open= berisi kunci (v:slug) atau id saja (di halaman jenisnya)
    const o = params.get("open");
    if (o) { const kindByPage = { resources: "r", knowledges: "v", articles: "a" }[page]; const key = o.includes(":") ? o : kindByPage ? `${kindByPage}:${o}` : ""; if (byKey.has(key)) openItem(key, params.get("p")); }
    if (D.source === "demo") console.info("Portal memakai data demo dari admin (localStorage).");
  });
})();
