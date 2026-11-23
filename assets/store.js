/* =========================================================
   Lapisan data portal: memuat fitur & item dari Supabase,
   dari data demo (localhost), atau dari konten contoh.
   Juga menyimpan aktivitas pengunjung (simpan, selesai, riwayat,
   jawaban sambutan).
   ========================================================= */
(() => {
  "use strict";
  const CFG = window.ACL_CONFIG || {};
  const configured = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const isLocal = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /\.(localhost|test)$/.test(location.hostname);
  const DEMO_KEY = "acl_demo_v2";
  const ME_KEY = "acl_me_v1";

  /* Jenis isian. Yang bertanda custom bisa dipakai di fitur buatan sendiri. */
  const FIELD_TYPES = {
    text: "Teks", textarea: "Deskripsi singkat", url: "Link", youtube: "Link YouTube",
    image: "Gambar", price: "Harga", date: "Tanggal",
    select: "Pilihan", multi: "Pilihan ganda", topic: "Topik", path: "Jalur sebelumnya", steps: "Langkah jalur"
  };
  const CUSTOM_FIELD_TYPES = ["text", "textarea", "url", "youtube", "image", "price", "date"];
  const LEVELS = ["Pemula", "Menengah", "Lanjut"];

  /* Pertanyaan sambutan di beranda. Kunci exp & goal dipakai jalur
     (diatur di admin) untuk menentukan rekomendasi. */
  const ONBOARD = {
    exp: { q: "Seberapa jauh pengalamanmu dengan AI?", options: [["baru", "Belum pernah memakai"], ["pernah", "Sudah coba ChatGPT dan sejenisnya"], ["rutin", "Sudah rutin dipakai"]] },
    goal: { q: "Mau dipakai untuk apa?", options: [["konten", "Bikin konten"], ["kerja", "Kerja lebih cepat"], ["automasi", "Bikin automasi"], ["penasaran", "Sekadar penasaran"]] },
    time: { q: "Berapa waktu belajarmu per minggu?", options: [["1", "Kurang dari 1 jam"], ["2", "1–3 jam"], ["3", "Lebih dari 3 jam"]] }
  };
  const WEEKLY_MIN = { 1: 45, 2: 120, 3: 240 };

  const F = (key, label, type, extra = {}) => ({ key, label, type, ...extra });
  const LEVEL_F = F("level", "Level", "select", { options: LEVELS, required: true });

  /* Template saat membuat fitur baru */
  const TEMPLATES = {
    video: { label: "Video", hint: "Kartu video YouTube, diputar saat diklik", fields: [F("title", "Judul", "text", { required: true }), F("youtube", "Link YouTube", "youtube", { required: true }), F("desc", "Deskripsi singkat", "textarea")] },
    galeri: { label: "Galeri", hint: "Kumpulan gambar dengan judul", fields: [F("title", "Judul", "text", { required: true }), F("image", "Gambar", "image", { required: true }), F("desc", "Keterangan", "textarea")] },
    teks: { label: "Teks singkat", hint: "Judul dan deskripsi pendek", fields: [F("title", "Judul", "text", { required: true }), F("desc", "Deskripsi singkat", "textarea", { required: true })] },
    link: { label: "Link", hint: "Daftar tautan ke halaman lain", fields: [F("title", "Judul", "text", { required: true }), F("url", "Link", "url", { required: true }), F("desc", "Deskripsi singkat", "textarea")] },
    produk: { label: "Produk", hint: "Gambar, harga, dan link beli", fields: [F("title", "Nama produk", "text", { required: true }), F("image", "Gambar", "image"), F("price", "Harga", "price"), F("url", "Link beli", "url"), F("desc", "Deskripsi singkat", "textarea")] },
    kosong: { label: "Kosong", hint: "Mulai dari nol, atur field sendiri", fields: [F("title", "Judul", "text", { required: true })] }
  };

  /* Fitur sistem: dipakai langsung oleh halaman portal. Field-nya dikunci
     agar halaman tetap berfungsi; isinya bebas ditambah, diubah, dihapus. */
  const SYSTEM = {
    shortcuts: { name: "Pintasan Beranda", description: "Tombol kapsul di bawah navigasi beranda.", sort: 0, fields: [
      F("label", "Teks tombol", "text", { required: true }), F("url", "Link tujuan", "url", { required: true, help: "Boleh link internal, misal topik.html?t=prompting atau jalur.html?p=kenal-ai" })] },
    topics: { name: "Topik", description: "Satu daftar topik untuk semua materi, video, dan artikel.", sort: 1, fields: [
      F("name", "Nama topik", "text", { required: true }), F("desc", "Deskripsi", "textarea")] },
    paths: { name: "Jalur Belajar", description: "Urutan belajar bertahap. Tampil di halaman Jalur Belajar dan rekomendasi beranda.", sort: 2, fields: [
      F("title", "Nama jalur", "text", { required: true }), F("desc", "Deskripsi", "textarea", { required: true }), LEVEL_F,
      F("after", "Jalur sebelumnya", "path", { help: "Jalur yang sebaiknya diselesaikan dulu. Kosongkan untuk jalur pertama." }),
      F("exp", "Cocok untuk pengalaman", "multi", { options: ONBOARD.exp.options, help: "Dipakai untuk rekomendasi dari pertanyaan sambutan." }),
      F("goal", "Cocok untuk tujuan", "multi", { options: ONBOARD.goal.options }),
      F("steps", "Langkah (urut)", "steps", { required: true, help: "Pilih materi, video, atau artikel lalu atur urutannya." })] },
    resources: { name: "Materi", description: "Panduan, template, dan cheatsheet di halaman Materi.", sort: 3, fields: [
      F("title", "Judul", "text", { required: true }), F("desc", "Deskripsi singkat", "textarea", { required: true }),
      F("topic", "Topik", "topic", { required: true }), LEVEL_F,
      F("format", "Format", "text", { help: "Panduan, Template, Cheatsheet…" }), F("time", "Durasi baca", "text", { help: "Misal: 15 menit" }),
      F("points", "Isi materi (satu per baris)", "textarea"), F("url", "Link materi", "url"), F("image", "Gambar sampul", "image")] },
    knowledges: { name: "Video", description: "Pustaka video di halaman Video. Video pertama jadi sorotan.", sort: 4, fields: [
      F("title", "Judul", "text", { required: true }), F("youtube", "Link YouTube", "youtube"),
      F("duration", "Durasi", "text", { help: "Format menit:detik, misal 12:40" }),
      F("topic", "Topik", "topic", { required: true }), LEVEL_F, F("desc", "Deskripsi singkat", "textarea"),
      F("chapters", "Daftar bab (satu per baris: 0:00 Judul bab)", "textarea"), F("image", "Thumbnail khusus", "image")] },
    articles: { name: "Artikel", description: "Artikel di halaman Artikel.", sort: 5, fields: [
      F("title", "Judul", "text", { required: true }), F("excerpt", "Ringkasan", "textarea", { required: true }),
      F("topic", "Topik", "topic", { required: true }), LEVEL_F,
      F("points", "Poin utama (satu per baris)", "textarea"), F("body", "Isi artikel", "textarea"),
      F("date", "Tanggal terbit", "date"), F("read", "Menit baca", "text"), F("url", "Link artikel lengkap", "url"), F("image", "Gambar sampul", "image")] }
  };
  /* Urutan impor: yang dirujuk harus ada lebih dulu */
  const SYSTEM_ORDER = ["shortcuts", "topics", "resources", "knowledges", "articles", "paths"];
  const KIND = { r: { slug: "resources", page: "resources.html", label: "Materi" }, v: { slug: "knowledges", page: "knowledges.html", label: "Video" }, a: { slug: "articles", page: "articles.html", label: "Artikel" } };

  const slugify = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " dan ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";
  const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const ytId = (u) => { const m = String(u || "").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/); return m ? m[1] : ""; };
  const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2));
  const arr = (v) => (Array.isArray(v) ? v : String(v || "").split(/[\n,]/)).map((x) => String(x).trim()).filter(Boolean);

  /* ---------- Konten contoh (dari data.js) ---------- */
  function seedModel() {
    const D = window.ACL_DATA || { resources: [], videos: [], topics: [], articles: [], paths: [] };
    const now = new Date().toISOString();
    const features = [], items = [];
    const addFeature = (slug, def, extra = {}) => {
      const f = { id: "f-" + slug, slug, name: def.name, description: def.description, template: extra.template || "sistem", system: extra.system !== false, fields: def.fields, sort: def.sort, visible: true, deleted_at: null, created_at: now };
      features.push(f); return f;
    };
    const add = (f, data, i) => { const id = `${f.slug}-${i}`; items.push({ id, feature_id: f.id, data, sort: i, status: "published", deleted_at: null, created_by: "contoh", created_at: now }); return id; };
    const ref = {}; // "r:peta-belajar-ai" / "t:dasar" / "p:kenal-ai" → id item

    const fs = addFeature("shortcuts", SYSTEM.shortcuts);
    [["Mulai dari nol", "jalur.html?p=kenal-ai"], ["Prompt engineering", "topik.html?t=prompting"],
     ["Membangun AI agent", "topik.html?t=ai-agent"], ["Automasi tanpa kode", "topik.html?t=automasi"],
     ["Visual & video AI", "topik.html?t=visual-dan-video"], ["Etika AI", "topik.html?t=etika-ai"]]
      .forEach(([label, url], i) => add(fs, { label, url }, i));

    const ft = addFeature("topics", SYSTEM.topics);
    (D.topics || []).forEach((t, i) => (ref["t:" + t.id] = add(ft, { name: t.name, desc: t.desc }, i)));

    const fr = addFeature("resources", SYSTEM.resources);
    D.resources.forEach((r, i) => (ref["r:" + r.id] = add(fr, { title: r.title, desc: r.desc, topic: ref["t:" + r.topic], level: r.level, format: r.format, time: r.time, points: (r.items || []).join("\n") }, i)));

    const fk = addFeature("knowledges", SYSTEM.knowledges);
    const vids = [...D.videos].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    vids.forEach((v, i) => (ref["v:" + v.id] = add(fk, { title: v.title, duration: v.dur, topic: ref["t:" + v.topic], level: v.level, desc: v.desc, chapters: (v.chapters || []).map(([n, t]) => `${t} ${n}`).join("\n") }, i)));

    const fa = addFeature("articles", SYSTEM.articles);
    D.articles.forEach((a, i) => (ref["a:" + a.id] = add(fa, { title: a.title, excerpt: a.excerpt, topic: ref["t:" + a.topic], level: a.level, points: (a.points || []).join("\n"), date: a.date, read: String(a.read) }, i)));

    const fp = addFeature("paths", SYSTEM.paths);
    (D.paths || []).forEach((p, i) => (ref["p:" + p.id] = add(fp, { title: p.title, desc: p.desc, level: p.level, after: p.after ? ref["p:" + p.after] : "", exp: p.exp, goal: p.goal, steps: p.steps.map((k) => ref[k]).filter(Boolean) }, i)));

    const fc = addFeature("kabar-komunitas", { name: "Kabar Komunitas", description: "Info singkat seputar ruang belajar AI Creator Labs.", sort: 10, fields: TEMPLATES.teks.fields }, { template: "teks", system: false });
    [["Materi baru setiap minggu", "Materi, video, dan artikel baru ditambahkan rutin. Simpan yang kamu suka agar mudah ditemukan lagi."],
     ["Sesi tanya-jawab bulanan", "Setiap akhir bulan ada sesi santai untuk membahas materi terbaru. Jadwal dibagikan di grup member."],
     ["Usulkan topik belajar", "Ada topik AI yang ingin dipelajari? Sampaikan ke tim agar masuk antrean materi berikutnya."]]
      .forEach(([title, desc], i) => add(fc, { title, desc }, i));

    return { features, items };
  }

  /* ---------- Sumber data ---------- */
  async function fetchRemote() {
    const base = CFG.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/";
    const headers = { apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` };
    const get = async (path) => { const r = await fetch(base + path, { headers }); if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); };
    const [features, items] = await Promise.all([
      get("features?select=*&order=sort.asc,created_at.asc"),
      get("items?select=id,feature_id,data,sort,status,deleted_at,created_at&order=sort.asc,created_at.asc")
    ]);
    return { features, items };
  }
  function readDemo() { try { const d = JSON.parse(localStorage.getItem(DEMO_KEY)); return d && d.features ? d : null; } catch { return null; } }

  /* ---------- Perkiraan durasi (menit) ---------- */
  function minutesOf(kind, x) {
    const num = (s) => { const m = String(s || "").match(/\d+/); return m ? +m[0] : 0; };
    if (kind === "v") { const p = String(x.dur || "").split(":").map(Number); if (p.length === 3) return p[0] * 60 + p[1] + Math.round(p[2] / 60); if (p.length === 2 && p.every(isFinite)) return p[0] + Math.round(p[1] / 60); return 10; }
    if (kind === "a") return num(x.read) || 5;
    return num(x.time) || 10;
  }

  /* ---------- Normalisasi untuk halaman ---------- */
  const lines = (s) => String(s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const normLevel = (l) => { const n = String(l || "").toLowerCase(); return n.startsWith("pem") ? "Pemula" : n.startsWith("men") ? "Menengah" : n.startsWith("lan") ? "Lanjut" : ""; };
  function normalize(raw) {
    const feats = raw.features.filter((f) => f.visible && !f.deleted_at).sort((a, b) => a.sort - b.sort);
    const itemsOf = (f) => raw.items.filter((i) => i.feature_id === f.id && i.status === "published" && !i.deleted_at).sort((a, b) => a.sort - b.sort);
    const bySlug = (s) => feats.find((f) => f.system && f.slug === s);
    const uniqFn = () => { const used = new Set(); return (base) => { let s = base, n = 2; while (used.has(s)) s = `${base}-${n++}`; used.add(s); return s; }; };
    const uniq = uniqFn(), uniqT = uniqFn(), uniqP = uniqFn();
    const list = (slug, fn) => { const f = bySlug(slug); return f ? itemsOf(f).map((it) => fn(it.data || {}, it)) : []; };

    const shortcuts = list("shortcuts", (d) => ({ label: d.label || "", url: d.url || "" })).filter((s) => s.label);
    const topics = list("topics", (d, it) => ({ dbId: it.id, name: (d.name || "").trim(), desc: d.desc || "" })).filter((t) => t.name).map((t) => ({ ...t, id: uniqT(slugify(t.name)) }));
    // Topik: dari id item, atau dari nama lama (kategori/seri/tag) bila belum diisi
    const topicOf = (v, ...legacy) => {
      const t = topics.find((x) => x.dbId === v) || [v, ...legacy].map((n) => String(n || "").split(",")[0].trim()).filter(Boolean).map((n) => topics.find((x) => slugify(x.name) === slugify(n))).find(Boolean);
      return t ? t.id : "";
    };
    const byDb = new Map();
    const resources = list("resources", (d, it) => ({ dbId: it.id, id: uniq(slugify(d.title)), title: d.title || "Tanpa judul", desc: d.desc || "", topic: topicOf(d.topic, d.category), level: normLevel(d.level), format: d.format || "", time: d.time || "", items: lines(d.points), url: d.url || "", image: d.image || "" }));
    const videos = list("knowledges", (d, it) => {
      const y = ytId(d.youtube);
      return { dbId: it.id, id: uniq(slugify(d.title)), title: d.title || "Tanpa judul", yt: y, dur: d.duration || "", topic: topicOf(d.topic, d.series), level: normLevel(d.level), desc: d.desc || "",
        chapters: lines(d.chapters).map((l) => { const m = l.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/); return m ? [m[2], m[1]] : [l, ""]; }),
        image: d.image || (y ? ytThumb(y) : ""), hue: 190 + (hash(it.id) % 130) };
    });
    const articles = list("articles", (d, it) => ({ dbId: it.id, id: uniq(slugify(d.title)), title: d.title || "Tanpa judul", excerpt: d.excerpt || "", topic: topicOf(d.topic, d.tags), level: normLevel(d.level), points: lines(d.points), body: lines(d.body), date: d.date || "", read: d.read || "", url: d.url || "", image: d.image || "" }));
    [["r", resources], ["v", videos], ["a", articles]].forEach(([k, l]) => l.forEach((x) => { x.kind = k; x.key = `${k}:${x.id}`; x.min = minutesOf(k, x); byDb.set(x.dbId, x); }));

    const rawPaths = list("paths", (d, it) => ({ dbId: it.id, title: d.title || "Tanpa judul", desc: d.desc || "", level: normLevel(d.level), afterDb: d.after || "", exp: arr(d.exp), goal: arr(d.goal), steps: arr(d.steps).map((s) => byDb.get(s)).filter(Boolean).map((x) => x.key) }));
    const paths = rawPaths.map((p) => ({ ...p, id: uniqP(slugify(p.title)) }));
    paths.forEach((p, i) => { const a = paths.find((x) => x.dbId === p.afterDb && x !== p); p.after = a ? a.id : ""; p.n = i + 1; });
    // Kedalaman di peta (jalur tanpa "sebelumnya" = kolom 0)
    const depth = (p, seen = new Set()) => { if (!p.after || seen.has(p.id)) return 0; seen.add(p.id); return 1 + depth(paths.find((x) => x.id === p.after), seen); };
    paths.forEach((p) => (p.depth = depth(p)));

    const custom = feats.filter((f) => !f.system).map((f) => ({ feature: f, items: itemsOf(f).map((it) => ({ id: it.id, ...it.data })) })).filter((g) => g.items.length);
    return { shortcuts, topics, resources, videos, articles, paths, custom };
  }

  async function load() {
    let raw, source;
    if (configured) {
      try { raw = await fetchRemote(); source = "supabase"; }
      catch (e) { console.error("Gagal memuat konten dari Supabase:", e); raw = { features: [], items: [] }; source = "error"; }
    } else if (isLocal && readDemo()) { raw = readDemo(); source = "demo"; }
    else { raw = seedModel(); source = "contoh"; }
    return { ...normalize(raw), source };
  }

  /* ---------- Aktivitas pengunjung (tersimpan di browser) ---------- */
  const me = {
    _s: null,
    get() {
      if (!this._s) { try { this._s = JSON.parse(localStorage.getItem(ME_KEY)) || {}; } catch { this._s = {}; } }
      this._s.saved ||= {}; this._s.done ||= {}; this._s.recent ||= []; this._s.queries ||= [];
      return this._s;
    },
    save() { try { localStorage.setItem(ME_KEY, JSON.stringify(this._s)); } catch {} },
    has(kind, key) { return !!this.get()[kind][key]; },
    toggle(kind, key) { const s = this.get(); s[kind][key] ? delete s[kind][key] : (s[kind][key] = Date.now()); this.save(); return !!s[kind][key]; },
    visit(key) { const s = this.get(); s.recent = [key, ...s.recent.filter((k) => k !== key)].slice(0, 12); this.save(); },
    list(kind) { const s = this.get(); return Object.entries(s[kind]).sort((a, b) => b[1] - a[1]).map(([k]) => k); },
    query(q) { q = String(q || "").trim(); if (q.length < 2) return; const s = this.get(); s.queries = [q, ...s.queries.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5); this.save(); },
    profile(p) { const s = this.get(); if (p === undefined) return s.profile || null; s.profile = p; this.save(); return p; }
  };

  window.ACL_STORE = { configured, isLocal, DEMO_KEY, FIELD_TYPES, CUSTOM_FIELD_TYPES, LEVELS, ONBOARD, WEEKLY_MIN, TEMPLATES, SYSTEM, SYSTEM_ORDER, KIND, seedModel, normalize, load, readDemo, slugify, ytId, ytThumb, uid, arr, me };
})();
