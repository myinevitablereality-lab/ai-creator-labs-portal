/* =========================================================
   Admin AI Creator Labs
   - Mode Supabase: login lewat link email, data dilindungi RLS.
   - Mode demo: hanya di localhost saat Supabase belum diisi,
     data disimpan di browser ini (localStorage).
   ========================================================= */
(() => {
  "use strict";
  const S = window.ACL_STORE, CFG = window.ACL_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const app = $("#app");
  const ROLE = { owner: "Pemilik", editor: "Editor", contributor: "Kontributor" };
  const ROLE_DESC = { owner: "Semua akses, termasuk kelola admin & Sampah", editor: "Kelola fitur dan item, termasuk menghapus", contributor: "Hanya menambah item (masuk draft dulu)" };
  const canManage = (r) => r === "owner" || r === "editor";
  const PAGE_OF = { shortcuts: "Beranda · pintasan", topics: "Semua halaman · filter & halaman Topik", paths: "Halaman Jalur Belajar & rekomendasi beranda", resources: "Halaman Materi", knowledges: "Halaman Video", articles: "Halaman Artikel" };
  const REF_TYPES = ["topic", "path", "steps"];

  const I = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    restore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2L4 8"/><path d="M4 4v4h4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>'
  };
  const LOGO = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="alg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9cbff"/><stop offset="1" stop-color="#8fd6ff"/></linearGradient></defs><rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="url(#alg)" stroke-width="1.4"/><path d="M9.5 22 16 9l6.5 13M12 17h8" fill="none" stroke="url(#alg)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="9" r="1.6" fill="#8fd6ff"/></svg>';

  /* ---------- Bantuan ---------- */
  function toast(msg, bad) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.style.background = bad ? "#ffb3bf" : ""; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }
  const friendly = (e) => {
    const m = String(e && e.message || e);
    if (/Database error saving new user|tidak terdaftar/i.test(m)) return "Email ini tidak terdaftar sebagai admin.";
    if (/row-level security|permission|izin/i.test(m)) return "Akses ditolak: peran Anda tidak punya izin untuk tindakan ini.";
    if (/rate limit|security purposes/i.test(m)) return "Terlalu sering mencoba. Tunggu sebentar lalu coba lagi.";
    return m.replace(/^Error:\s*/, "");
  };
  async function run(fn, okMsg) {
    try { const r = await fn(); if (okMsg) toast(okMsg); return r ?? true; }
    catch (e) { console.error(e); toast(friendly(e), true); return false; }
  }
  const safeUrl = (u) => { u = String(u || "").trim(); if (!u) return ""; if (/^(https?:|mailto:)/i.test(u)) return u; if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith("//")) return ""; return u; };
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Gagal memuat " + src)); document.head.appendChild(s); }); }

  // Perkecil gambar sebelum diunggah (maks 1600px, JPEG/WebP)
  function resizeImage(file, max = 1600, quality = 0.84) {
    return new Promise((res, rej) => {
      if (!/^image\//.test(file.type)) return rej(new Error("File harus berupa gambar"));
      if (file.type === "image/gif" || file.type === "image/svg+xml") return res(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob((b) => (b ? res(b) : rej(new Error("Gagal memproses gambar"))), "image/webp", quality);
      };
      img.onerror = () => rej(new Error("Gambar tidak bisa dibaca"));
      img.src = url;
    });
  }

  /* =========================================================
     Adapter data
     ========================================================= */
  function demoAdapter() {
    const fresh = () => { const m = S.seedModel(); return { features: m.features, items: m.items, admins: [{ email: "pemilik@demo.lokal", role: "owner", created_at: new Date().toISOString() }] }; };
    let db = S.readDemo() || fresh();
    const persist = () => { try { localStorage.setItem(S.DEMO_KEY, JSON.stringify(db)); } catch (e) { throw new Error("Penyimpanan browser penuh. Pakai gambar yang lebih kecil."); } };
    persist();
    let role = null, email = null;
    const need = (ok, msg = "Akses ditolak: peran Anda tidak punya izin untuk tindakan ini.") => { if (!ok) throw new Error(msg); };
    const now = () => new Date().toISOString();
    return {
      mode: "demo",
      async session() { const r = sessionStorage.getItem("acl_demo_role"); if (!r) return null; role = r; email = `${r}@demo.lokal`; return { email, role }; },
      async signIn(r) { sessionStorage.setItem("acl_demo_role", r); return this.session(); },
      async signOut() { sessionStorage.removeItem("acl_demo_role"); role = null; },
      async load() { db = S.readDemo() || fresh(); return JSON.parse(JSON.stringify(db)); },
      async insertFeature(f) {
        need(canManage(role));
        need(!db.features.some((x) => x.slug === f.slug), "Nama fitur ini sudah dipakai, coba nama lain.");
        const row = { id: S.uid(), description: "", template: "kosong", system: false, fields: [], sort: 0, visible: true, deleted_at: null, created_at: now(), ...f };
        db.features.push(row); persist(); return row;
      },
      async updateFeature(id, p) {
        need(canManage(role));
        const f = db.features.find((x) => x.id === id); need(f, "Fitur tidak ditemukan");
        need(!(f.deleted_at && p.deleted_at === null && role !== "owner"), "Hanya Pemilik yang bisa memulihkan dari Sampah");
        need(!(f.system && (p.deleted_at || p.fields || p.slug)), "Fitur sistem tidak bisa dihapus atau diubah field-nya");
        Object.assign(f, p); persist();
      },
      async insertItem(i) {
        need(role);
        need(canManage(role) || i.status === "draft", "Kontributor hanya bisa menyimpan sebagai draft");
        const row = { id: S.uid(), sort: 0, status: "draft", deleted_at: null, created_by: email, created_at: now(), ...i };
        db.items.push(row); persist(); return row;
      },
      async updateItem(id, p) {
        need(canManage(role));
        const it = db.items.find((x) => x.id === id); need(it, "Item tidak ditemukan");
        need(!(it.deleted_at && p.deleted_at === null && role !== "owner"), "Hanya Pemilik yang bisa memulihkan dari Sampah");
        Object.assign(it, p, { updated_at: now() }); persist();
      },
      async purge(table, id) {
        need(role === "owner");
        if (table === "features") { db.features = db.features.filter((x) => x.id !== id); db.items = db.items.filter((x) => x.feature_id !== id); }
        else db.items = db.items.filter((x) => x.id !== id);
        persist();
      },
      async upsertAdmin(em, r) {
        need(role === "owner");
        const a = db.admins.find((x) => x.email === em);
        if (a) { need(!(a.role === "owner" && r !== "owner" && db.admins.filter((x) => x.role === "owner").length <= 1), "Harus selalu ada minimal satu Pemilik"); a.role = r; }
        else { need(db.admins.length < 5, "Maksimal 5 admin"); db.admins.push({ email: em, role: r, created_at: now() }); }
        persist();
      },
      async deleteAdmin(em) {
        need(role === "owner");
        const a = db.admins.find((x) => x.email === em);
        need(!(a && a.role === "owner" && db.admins.filter((x) => x.role === "owner").length <= 1), "Harus selalu ada minimal satu Pemilik");
        db.admins = db.admins.filter((x) => x.email !== em); persist();
      },
      async upload(file) {
        const blob = await resizeImage(file, 1000, 0.75);
        return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      },
      reset() { localStorage.removeItem(S.DEMO_KEY); db = fresh(); persist(); }
    };
  }

  async function supabaseAdapter() {
    await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js");
    const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    const chk = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
    const atLeastOne = (rows) => { if (!rows || !rows.length) throw new Error("Akses ditolak: peran Anda tidak punya izin untuk tindakan ini."); return rows; };
    return {
      mode: "supabase",
      async session() {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;
        const role = chk(await sb.rpc("my_role"));
        return { email: session.user.email, role };
      },
      async signIn(email) {
        chk(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } }));
      },
      async signOut() { await sb.auth.signOut(); },
      async load() {
        const [f, i, a] = await Promise.all([
          sb.from("features").select("*").order("sort").order("created_at"),
          sb.from("items").select("*").order("sort").order("created_at"),
          sb.from("admins").select("*").order("created_at")
        ]);
        return { features: chk(f), items: chk(i), admins: chk(a) };
      },
      async insertFeature(f) { return chk(await sb.from("features").insert(f).select().single()); },
      async updateFeature(id, p) { atLeastOne(chk(await sb.from("features").update(p).eq("id", id).select("id"))); },
      async insertItem(i) { return chk(await sb.from("items").insert(i).select().single()); },
      async insertItems(list) { if (list.length) chk(await sb.from("items").insert(list)); },
      async updateItem(id, p) { atLeastOne(chk(await sb.from("items").update(p).eq("id", id).select("id"))); },
      async purge(table, id) { atLeastOne(chk(await sb.from(table).delete().eq("id", id).select("id"))); },
      async upsertAdmin(email, role) { chk(await sb.from("admins").upsert({ email, role })); },
      async deleteAdmin(email) { atLeastOne(chk(await sb.from("admins").delete().eq("email", email).select("email"))); },
      async upload(file) {
        const blob = await resizeImage(file);
        const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "img").toLowerCase();
        const path = `${new Date().getFullYear()}/${S.uid()}.${ext}`;
        chk(await sb.storage.from("media").upload(path, blob, { contentType: blob.type, upsert: false }));
        return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
      }
    };
  }

  /* =========================================================
     State & render
     ========================================================= */
  let api, me, db = { features: [], items: [], admins: [] };
  const view = { name: "features", featureId: null, filter: "all" };
  const live = (list) => list.filter((x) => !x.deleted_at);
  const byId = (id) => db.features.find((f) => f.id === id);
  const sysFeature = (slug) => live(db.features).find((f) => f.system && f.slug === slug);
  const itemsOfSlug = (slug) => { const f = sysFeature(slug); return f ? live(db.items).filter((x) => x.feature_id === f.id).sort((a, b) => a.sort - b.sort) : []; };
  const KIND_OF = { resources: "Materi", knowledges: "Video", articles: "Artikel" };
  const contentIndex = () => { const m = new Map(); Object.entries(KIND_OF).forEach(([slug, label]) => itemsOfSlug(slug).forEach((it) => m.set(it.id, { label, title: (it.data && it.data.title) || "Tanpa judul", draft: it.status === "draft" }))); return m; };
  const topicName = (id) => { const t = db.items.find((x) => x.id === id && !x.deleted_at); return t && t.data ? t.data.name : ""; };
  // Berapa item lain yang merujuk item ini (topik dipakai konten, konten dipakai jalur, jalur dipakai jalur lain)
  const usedBy = (id) => live(db.items).filter((x) => x.id !== id && Object.values(x.data || {}).some((v) => v === id || (Array.isArray(v) && v.includes(id)))).length;
  const itemTitle = (it, f) => { const k = (f.fields.find((x) => x.type === "text") || f.fields[0] || {}).key; return (it.data && (it.data[k] || it.data.title || it.data.label || it.data.name)) || "Tanpa judul"; };
  const itemThumb = (it, f) => {
    const d = it.data || {};
    const img = f.fields.find((x) => x.type === "image" && d[x.key]);
    if (img) return `<img src="${esc(safeUrl(d[img.key]))}" alt="">`;
    const yt = f.fields.find((x) => x.type === "youtube" && S.ytId(d[x.key]));
    if (yt) return `<img src="${S.ytThumb(S.ytId(d[yt.key]))}" alt="">`;
    return I.text;
  };

  async function refresh() { db = await api.load(); render(); }

  function shell(inner) {
    const nav = [["features", "Fitur"], ...(me.role === "owner" ? [["admins", "Admin"], ["trash", "Sampah"]] : [])];
    const current = view.name === "items" ? "features" : view.name;
    return `
      <header class="adm-head">
        <span class="brand">${LOGO}<span>AI Creator Labs<small>Admin portal</small></span></span>
        <span class="adm-user">
          ${api.mode === "demo" ? '<span class="chip demo">Demo</span>' : ""}
          <span class="chip ${me.role}">${ROLE[me.role]}</span>
          <span class="em">${esc(me.email)}</span>
          <a class="ibtn" href="index.html" target="_blank" rel="noopener" title="Lihat portal" aria-label="Lihat portal">${I.eye}</a>
          <button class="btn secondary small" type="button" data-act="logout">Keluar</button>
        </span>
      </header>
      <nav class="adm-nav" aria-label="Menu admin">${nav.map(([k, l]) => `<button type="button" data-nav="${k}" ${k === current ? 'aria-current="page"' : ""}>${l}</button>`).join("")}</nav>
      ${inner}`;
  }

  function render() {
    if (view.name === "items" && !byId(view.featureId)) view.name = "features";
    const inner = view.name === "items" ? itemsView() : view.name === "admins" && me.role === "owner" ? adminsView() : view.name === "trash" && me.role === "owner" ? trashView() : featuresView();
    app.innerHTML = shell(inner);
  }

  /* ---------- Fitur ---------- */
  function featuresView() {
    const feats = live(db.features).sort((a, b) => a.sort - b.sort);
    const missing = Object.keys(S.SYSTEM).filter((s) => !db.features.some((f) => f.slug === s && f.system));
    const m = canManage(me.role);
    return `
      <div class="adm-title">
        <div><p class="eyebrow">Kelola konten</p><h1>Fitur</h1><p>Setiap fitur adalah satu bagian di portal. Fitur buatan sendiri tampil di beranda sebagai “Sorotan”, sesuai urutan di bawah.</p></div>
        ${m ? `<button class="btn" type="button" data-act="new-feature">${I.plus} Tambah fitur</button>` : ""}
      </div>
      ${api.mode === "demo" ? `<div class="banner warn"><span><b>Mode demo.</b> Perubahan tersimpan di browser ini saja dan langsung terlihat di portal (localhost). Hubungkan Supabase agar tersimpan online.</span>${me.role === "owner" ? `<button class="btn secondary small" type="button" data-act="reset-demo">Reset data demo</button>` : ""}</div>` : ""}
      ${missing.length && m ? `<div class="banner"><span>Database masih kosong untuk ${missing.length} fitur bawaan portal (Topik, Jalur Belajar, Materi, Video, Artikel, dll).</span><button class="btn small" type="button" data-act="import">Impor konten contoh</button></div>` : ""}
      <div class="rows">${feats.length ? feats.map((f, i) => {
        const its = live(db.items).filter((x) => x.feature_id === f.id);
        const drafts = its.filter((x) => x.status === "draft").length;
        return `
        <div class="row ${f.visible ? "" : "hidden-f"}">
          <span class="ico">${f.system ? I.text : I.plus}</span>
          <div class="main">
            <strong>${esc(f.name)}</strong>
            <span class="meta">
              <span class="chip ${f.system ? "sys" : ""}">${f.system ? "Sistem" : esc((S.TEMPLATES[f.template] || {}).label || "Kustom")}</span>
              <span>${its.length - drafts} tayang${drafts ? ` · <b style="color:#ffd9a0">${drafts} draft</b>` : ""}</span>
              <span>${f.system ? PAGE_OF[f.slug] || "Portal" : "Beranda · Sorotan"}</span>
              ${f.visible ? "" : "<span>· disembunyikan</span>"}
            </span>
          </div>
          <div class="acts">
            ${m ? `<button class="ibtn" type="button" data-act="f-up" data-id="${f.id}" aria-label="Naikkan" ${i === 0 ? "disabled" : ""}>${I.up}</button>
            <button class="ibtn" type="button" data-act="f-down" data-id="${f.id}" aria-label="Turunkan" ${i === feats.length - 1 ? "disabled" : ""}>${I.down}</button>
            <button class="switch" type="button" role="switch" aria-checked="${f.visible}" aria-label="Tampilkan di portal" title="Tampil / sembunyi" data-act="f-vis" data-id="${f.id}"></button>
            <button class="ibtn" type="button" data-act="edit-feature" data-id="${f.id}" aria-label="Edit fitur">${I.edit}</button>
            ${f.system ? "" : `<button class="ibtn danger" type="button" data-act="f-del" data-id="${f.id}" aria-label="Hapus fitur">${I.trash}</button>`}` : ""}
            <button class="btn secondary small" type="button" data-act="open-feature" data-id="${f.id}">Kelola isi</button>
          </div>
        </div>`; }).join("") : `<div class="empty-row">Belum ada fitur.</div>`}</div>`;
  }

  function featureForm(f) {
    const isNew = !f;
    const st = { template: f ? f.template : "teks", fields: JSON.parse(JSON.stringify(f ? f.fields : S.TEMPLATES.teks.fields)) };
    const sheet = openSheet(`
      <div class="sheet-body">
        <p class="eyebrow">${isNew ? "Fitur baru" : "Edit fitur"}</p>
        <h2>${isNew ? "Tambah fitur" : esc(f.name)}</h2>
        <div class="form-msg bad" hidden></div>
        ${isNew ? `<p style="margin:0 0 10px;font-size:13px;color:var(--muted)">Pilih template</p><div class="tpl-grid">${Object.entries(S.TEMPLATES).map(([k, t]) => `<button type="button" class="tpl" data-tpl="${k}" aria-pressed="${k === st.template}"><b>${t.label}</b><span>${t.hint}</span></button>`).join("")}</div>` : ""}
        <label class="field"><span>Nama fitur <i>*</i></span><input name="name" value="${esc(f ? f.name : "")}" placeholder="Misal: Video Pilihan" maxlength="80" required></label>
        <label class="field"><span>Deskripsi</span><textarea name="description" rows="2" maxlength="300" placeholder="Kalimat pendek di bawah judul section">${esc(f ? f.description : "")}</textarea></label>
        <p style="margin:6px 0 10px;font-size:13px;color:var(--muted)">Field (isian setiap item)</p>
        ${f && f.system ? `<div class="locked">Fitur sistem dipakai langsung oleh halaman portal, jadi field-nya dikunci:<ul>${f.fields.map((x) => `<li>${esc(x.label)} — ${S.FIELD_TYPES[x.type]}</li>`).join("")}</ul></div>` : `<div class="fields-ed"></div><button class="btn secondary small" type="button" data-add-field>${I.plus} Tambah field</button>`}
        <div class="form-foot"><button class="btn secondary" type="button" data-close>Batal</button><button class="btn" type="button" data-save>${isNew ? "Buat fitur" : "Simpan"}</button></div>
      </div>`);
    const ed = $(".fields-ed", sheet), msg = $(".form-msg", sheet);
    function drawFields() {
      if (!ed) return;
      ed.innerHTML = st.fields.map((x, i) => `
        <div class="f-row" data-i="${i}">
          <input type="text" data-k="label" value="${esc(x.label)}" placeholder="Nama field" aria-label="Nama field">
          <select data-k="type" aria-label="Jenis field">${S.CUSTOM_FIELD_TYPES.map((k) => `<option value="${k}" ${k === x.type ? "selected" : ""}>${S.FIELD_TYPES[k]}</option>`).join("")}</select>
          <label><input type="checkbox" data-k="required" ${x.required ? "checked" : ""}> Wajib</label>
          <span class="f-acts">
            <button class="ibtn" type="button" data-f="up" aria-label="Naikkan" ${i === 0 ? "disabled" : ""}>${I.up}</button>
            <button class="ibtn danger" type="button" data-f="del" aria-label="Hapus field" ${st.fields.length <= 1 ? "disabled" : ""}>${I.close}</button>
          </span>
        </div>`).join("");
    }
    drawFields();
    sheet.addEventListener("input", (e) => {
      const row = e.target.closest(".f-row"); if (!row) return;
      const x = st.fields[+row.dataset.i], k = e.target.dataset.k;
      if (k === "required") x.required = e.target.checked; else x[k] = e.target.value;
    });
    sheet.addEventListener("click", async (e) => {
      const tpl = e.target.closest("[data-tpl]");
      if (tpl) { st.template = tpl.dataset.tpl; st.fields = JSON.parse(JSON.stringify(S.TEMPLATES[st.template].fields)); $$("[data-tpl]", sheet).forEach((b) => b.setAttribute("aria-pressed", b === tpl)); drawFields(); return; }
      if (e.target.closest("[data-add-field]")) { st.fields.push({ key: "", label: "", type: "text" }); drawFields(); $$(".f-row input[type=text]", sheet).pop().focus(); return; }
      const fb = e.target.closest("[data-f]");
      if (fb) { const i = +fb.closest(".f-row").dataset.i; if (fb.dataset.f === "del") st.fields.splice(i, 1); else if (i > 0) [st.fields[i - 1], st.fields[i]] = [st.fields[i], st.fields[i - 1]]; drawFields(); return; }
      if (e.target.closest("[data-close]")) return sheet.close();
      if (e.target.closest("[data-save]")) {
        const name = $("[name=name]", sheet).value.trim(), description = $("[name=description]", sheet).value.trim();
        msg.hidden = true;
        const fail = (t) => { msg.textContent = t; msg.hidden = false; };
        if (!name) return fail("Nama fitur wajib diisi.");
        let fields = f && f.system ? null : st.fields.map((x) => ({ ...x, label: x.label.trim() })).filter((x) => x.label);
        if (fields) {
          if (!fields.length) return fail("Minimal satu field.");
          const used = new Set();
          // Kunci standar (title, desc, image, …) dipakai beranda untuk menyusun kartu
          const STD = { text: "title", textarea: "desc", image: "image", youtube: "youtube", url: "url", price: "price", date: "date" };
          fields.forEach((x) => { if (x.key) used.add(x.key); });
          fields = fields.map((x) => {
            let k = x.key;
            if (!k) { k = !used.has(STD[x.type]) ? STD[x.type] : S.slugify(x.label).replace(/-/g, "_"); let base = k, n = 2; while (used.has(k)) k = `${base}_${n++}`; used.add(k); }
            return { key: k, label: x.label, type: x.type, ...(x.required ? { required: true } : {}) };
          });
        }
        const ok = await run(async () => {
          if (isNew) {
            const maxSort = Math.max(0, ...live(db.features).map((x) => x.sort));
            let slug = S.slugify(name), n = 2; while (db.features.some((x) => x.slug === slug) || S.SYSTEM[slug]) slug = `${S.slugify(name)}-${n++}`;
            await api.insertFeature({ slug, name, description, template: st.template, system: false, fields, sort: maxSort + 1, visible: true });
          } else {
            await api.updateFeature(f.id, fields ? { name, description, fields } : { name, description });
          }
        }, isNew ? "Fitur dibuat" : "Fitur disimpan");
        if (ok) { sheet.close(); await refresh(); }
      }
    });
  }

  /* ---------- Item ---------- */
  function itemsView() {
    const f = byId(view.featureId), m = canManage(me.role);
    const all = live(db.items).filter((x) => x.feature_id === f.id).sort((a, b) => a.sort - b.sort);
    const list = all.filter((x) => view.filter === "all" || x.status === view.filter);
    return `
      <div class="adm-title">
        <div>
          <button class="back" type="button" data-nav="features">${I.left} Semua fitur</button>
          <h1>${esc(f.name)}</h1>
          <p>${esc(f.description || "")} <span style="color:var(--dim)">· ${f.system ? PAGE_OF[f.slug] || "Portal" : "Tampil di Beranda · Sorotan"}</span></p>
        </div>
        <button class="btn" type="button" data-act="new-item">${I.plus} Tambah item</button>
      </div>
      ${me.role === "contributor" ? `<div class="banner"><span>Sebagai Kontributor, item yang Anda tambahkan masuk <b>draft</b> dan tampil di portal setelah disetujui Editor atau Pemilik.</span></div>` : ""}
      <div class="seg" role="group" aria-label="Saring status">${[["all", `Semua (${all.length})`], ["published", `Tayang (${all.filter((x) => x.status === "published").length})`], ["draft", `Draft (${all.filter((x) => x.status === "draft").length})`]].map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${view.filter === k}">${l}</button>`).join("")}</div>
      <div class="rows">${list.length ? list.map((it) => {
        const i = all.indexOf(it);
        return `
        <div class="row">
          <span class="ico">${itemThumb(it, f)}</span>
          <div class="main">
            <strong>${esc(itemTitle(it, f))}</strong>
            <span class="meta"><span class="chip ${it.status === "published" ? "live" : "draft"}">${it.status === "published" ? "Tayang" : "Draft"}</span>${[topicName((it.data || {}).topic), (it.data || {}).level, Array.isArray((it.data || {}).steps) ? `${it.data.steps.length} langkah` : ""].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join("")}${it.created_by && it.status === "draft" ? `<span>oleh ${esc(it.created_by)}</span>` : ""}</span>
          </div>
          <div class="acts">${m ? `
            <button class="ibtn" type="button" data-act="i-up" data-id="${it.id}" aria-label="Naikkan" ${i === 0 ? "disabled" : ""}>${I.up}</button>
            <button class="ibtn" type="button" data-act="i-down" data-id="${it.id}" aria-label="Turunkan" ${i === all.length - 1 ? "disabled" : ""}>${I.down}</button>
            <button class="btn secondary small" type="button" data-act="i-status" data-id="${it.id}">${it.status === "published" ? "Jadikan draft" : "Tayangkan"}</button>
            <button class="ibtn" type="button" data-act="edit-item" data-id="${it.id}" aria-label="Edit item">${I.edit}</button>
            <button class="ibtn danger" type="button" data-act="i-del" data-id="${it.id}" aria-label="Hapus item">${I.trash}</button>` : ""}
          </div>
        </div>`; }).join("") : `<div class="empty-row">${all.length ? "Tidak ada item dengan status ini." : "Belum ada item. Tambahkan yang pertama."}</div>`}</div>`;
  }

  function inputFor(x, val, ctx = {}) {
    const v = val ?? "", req = x.required ? " <i>*</i>" : "", help = x.help ? `<small>${esc(x.help)}</small>` : "";
    const name = `f_${x.key}`;
    const sel = (opts, empty) => `<label class="field"><span>${esc(x.label)}${req}</span><select class="input" name="${name}"><option value="">${empty}</option>${opts.map(([k, l]) => `<option value="${esc(k)}" ${k === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>${help}</label>`;
    switch (x.type) {
      case "select": return sel((x.options || []).map((o) => [o, o]), "— Pilih —");
      case "topic": { const opts = itemsOfSlug("topics").map((t) => [t.id, (t.data && t.data.name) || "Tanpa nama"]); return opts.length ? sel(opts, "— Pilih topik —") : `<div class="field"><span>${esc(x.label)}${req}</span><p class="notice" style="margin:0">Belum ada topik. Tambahkan dulu di fitur <b>Topik</b>.</p><input type="hidden" name="${name}" value=""></div>`; }
      case "path": return sel(itemsOfSlug("paths").filter((p) => p.id !== ctx.itemId).map((p) => [p.id, (p.data && p.data.title) || "Tanpa judul"]), "— Tidak ada (jalur pertama) —");
      case "multi": { const vals = S.arr(v); return `<fieldset class="field multi"><legend>${esc(x.label)}${req}</legend><div class="checks">${(x.options || []).map(([k, l]) => `<label class="check"><input type="checkbox" name="${name}" value="${esc(k)}" ${vals.includes(k) ? "checked" : ""}><span>${esc(l)}</span></label>`).join("")}</div>${help}</fieldset>`; }
      case "steps": return `<div class="field" data-steps><span>${esc(x.label)}${req}</span><input type="hidden" name="${name}" value="${esc(JSON.stringify(S.arr(v)))}"><ol class="steps-ed"></ol><div class="steps-add"><select class="input" data-step-pick aria-label="Pilih konten untuk langkah baru"></select><button class="btn secondary small" type="button" data-step-add>${I.plus} Tambah langkah</button></div>${help}</div>`;
      case "textarea": return `<label class="field"><span>${esc(x.label)}${req}</span><textarea name="${name}" rows="${x.key === "body" ? 7 : 3}">${esc(v)}</textarea>${help}</label>`;
      case "url": return `<label class="field"><span>${esc(x.label)}${req}</span><input name="${name}" type="text" inputmode="url" value="${esc(v)}" placeholder="https://… atau halaman.html">${help}</label>`;
      case "youtube": { const id = S.ytId(v); return `<label class="field"><span>${esc(x.label)}${req}</span><input name="${name}" type="text" inputmode="url" value="${esc(v)}" placeholder="https://www.youtube.com/watch?v=…" data-yt><img class="yt-prev" alt="" ${id ? `src="${S.ytThumb(id)}"` : "hidden"}><small>Thumbnail diambil otomatis dari YouTube.</small>${help}</label>`; }
      case "price": return `<label class="field"><span>${esc(x.label)}${req}</span><input name="${name}" type="text" inputmode="numeric" value="${esc(v)}" placeholder="150000"><small>Angka saja, tampil sebagai Rupiah.</small></label>`;
      case "date": return `<label class="field"><span>${esc(x.label)}${req}</span><input name="${name}" type="date" value="${esc(v)}"></label>`;
      case "image": return `<div class="field"><span>${esc(x.label)}${req}</span><div class="img-field" data-img="${name}"><input type="hidden" name="${name}" value="${esc(v)}"><img class="img-prev" alt="" ${v ? `src="${esc(safeUrl(v))}"` : "hidden"}><div class="file-row"><input type="file" accept="image/*" aria-label="Pilih gambar"><button class="btn secondary small" type="button" data-img-clear ${v ? "" : "hidden"}>Hapus gambar</button></div><input class="input" type="text" data-img-url placeholder="atau tempel URL gambar" value="${v && !String(v).startsWith("data:") ? esc(v) : ""}"></div>${help}</div>`;
      default: return `<label class="field"><span>${esc(x.label)}${req}</span><input name="${name}" type="text" value="${esc(v)}" maxlength="200">${help}</label>`;
    }
  }

  function itemForm(f, it) {
    const isNew = !it, m = canManage(me.role), d = it ? it.data || {} : {};
    const sheet = openSheet(`
      <div class="sheet-body">
        <p class="eyebrow">${esc(f.name)}</p>
        <h2>${isNew ? "Tambah item" : "Edit item"}</h2>
        <div class="form-msg bad" hidden></div>
        <form novalidate>
          ${f.fields.map((x) => inputFor(x, d[x.key], { itemId: it && it.id })).join("")}
          ${m ? `<label class="field"><span>Status</span><select name="__status"><option value="published" ${!it || it.status === "published" ? "selected" : ""}>Tayang — langsung tampil di portal</option><option value="draft" ${it && it.status === "draft" ? "selected" : ""}>Draft — disimpan, belum tampil</option></select></label>` : `<p class="notice" style="margin:4px 0 0">Item akan disimpan sebagai <b>draft</b> sampai disetujui Editor/Pemilik.</p>`}
        </form>
        <div class="form-foot"><button class="btn secondary" type="button" data-close>Batal</button><button class="btn" type="button" data-save>${isNew ? (m ? "Simpan" : "Kirim sebagai draft") : "Simpan perubahan"}</button></div>
      </div>`);
    const msg = $(".form-msg", sheet);
    // Editor langkah jalur: daftar urut + pemilih konten
    const stepsBox = $("[data-steps]", sheet);
    function drawSteps() {
      if (!stepsBox) return;
      const idx = contentIndex(), hid = $("input[type=hidden]", stepsBox), ids = JSON.parse(hid.value || "[]");
      $(".steps-ed", stepsBox).innerHTML = ids.length ? ids.map((id, i) => { const c = idx.get(id); return `
        <li data-i="${i}"><span class="n">${i + 1}</span><span class="t">${c ? `<b>${esc(c.title)}</b><small>${c.label}${c.draft ? " · draft (belum tampil)" : ""}</small>` : `<b class="gone">Konten sudah dihapus</b><small>Hapus langkah ini</small>`}</span>
          <span class="f-acts"><button class="ibtn" type="button" data-step="up" aria-label="Naikkan" ${i === 0 ? "disabled" : ""}>${I.up}</button><button class="ibtn" type="button" data-step="down" aria-label="Turunkan" ${i === ids.length - 1 ? "disabled" : ""}>${I.down}</button><button class="ibtn danger" type="button" data-step="del" aria-label="Hapus langkah">${I.close}</button></span></li>`; }).join("") : `<li class="empty">Belum ada langkah.</li>`;
      const groups = {}; idx.forEach((c, id) => { if (!ids.includes(id)) (groups[c.label] ||= []).push([id, c.title + (c.draft ? " (draft)" : "")]); });
      $("[data-step-pick]", stepsBox).innerHTML = `<option value="">— Pilih materi, video, atau artikel —</option>` + Object.entries(groups).map(([g, l]) => `<optgroup label="${g}">${l.map(([id, t]) => `<option value="${esc(id)}">${esc(t)}</option>`).join("")}</optgroup>`).join("");
    }
    drawSteps();
    stepsBox && stepsBox.addEventListener("click", (e) => {
      const hid = $("input[type=hidden]", stepsBox), ids = JSON.parse(hid.value || "[]");
      if (e.target.closest("[data-step-add]")) { const v = $("[data-step-pick]", stepsBox).value; if (!v) return toast("Pilih konten dulu", true); ids.push(v); }
      else { const b = e.target.closest("[data-step]"); if (!b) return; const i = +b.closest("li").dataset.i, j = b.dataset.step === "up" ? i - 1 : i + 1; if (b.dataset.step === "del") ids.splice(i, 1); else [ids[i], ids[j]] = [ids[j], ids[i]]; }
      hid.value = JSON.stringify(ids); drawSteps();
    });
    sheet.addEventListener("input", (e) => {
      if (e.target.matches("[data-yt]")) { const id = S.ytId(e.target.value), p = e.target.parentElement.querySelector(".yt-prev"); p.hidden = !id; if (id) p.src = S.ytThumb(id); }
      if (e.target.matches("[data-img-url]")) { const box = e.target.closest("[data-img]"), u = safeUrl(e.target.value); $("input[type=hidden]", box).value = u; const p = $(".img-prev", box); p.hidden = !u; if (u) p.src = u; $("[data-img-clear]", box).hidden = !u; }
    });
    sheet.addEventListener("change", async (e) => {
      if (!e.target.matches("[data-img] input[type=file]") || !e.target.files[0]) return;
      const box = e.target.closest("[data-img]"), save = $("[data-save]", sheet);
      save.disabled = true; save.textContent = "Mengunggah…";
      const url = await run(() => api.upload(e.target.files[0]), "Gambar diunggah");
      save.disabled = false; save.textContent = isNew ? (m ? "Simpan" : "Kirim sebagai draft") : "Simpan perubahan";
      if (url && url !== true) { $("input[type=hidden]", box).value = url; const p = $(".img-prev", box); p.src = url; p.hidden = false; $("[data-img-clear]", box).hidden = false; }
      e.target.value = "";
    });
    sheet.addEventListener("click", async (e) => {
      const clr = e.target.closest("[data-img-clear]");
      if (clr) { const box = clr.closest("[data-img]"); $("input[type=hidden]", box).value = ""; $("[data-img-url]", box).value = ""; $(".img-prev", box).hidden = true; clr.hidden = true; return; }
      if (e.target.closest("[data-close]")) return sheet.close();
      if (!e.target.closest("[data-save]")) return;
      msg.hidden = true; $$(".err", sheet).forEach((x) => x.remove());
      const data = {}; let bad = null;
      for (const x of f.fields) {
        const el = sheet.querySelector(`[name="f_${x.key}"]`);
        let v = x.type === "multi" ? $$(`[name="f_${x.key}"]:checked`, sheet).map((c) => c.value) : x.type === "steps" ? JSON.parse((el && el.value) || "[]") : (el ? el.value : "").trim();
        let err = "";
        if (Array.isArray(v)) { if (x.required && !v.length) err = x.type === "steps" ? "Tambahkan minimal satu langkah." : "Pilih minimal satu."; if (!v.length) v = ""; }
        else if (x.required && !v) err = "Wajib diisi.";
        else if (v && x.type === "youtube" && !S.ytId(v)) err = "Link YouTube tidak dikenali.";
        else if (v && x.type === "url" && !safeUrl(v)) err = "Link tidak valid.";
        else if (v && x.type === "price") v = v.replace(/[^\d]/g, "");
        if (err) { const host = (el && el.closest(".field")) || sheet.querySelector("form"); host.insertAdjacentHTML("beforeend", `<span class="err">${err}</span>`); bad ||= el; }
        if (v) data[x.key] = v;
      }
      if (bad) { msg.textContent = "Periksa kembali isian yang ditandai."; msg.hidden = false; (bad.type === "hidden" ? bad.closest(".field") : bad).scrollIntoView({ block: "center", behavior: "smooth" }); return; }
      const status = m ? $("[name=__status]", sheet).value : "draft";
      const ok = await run(async () => {
        if (isNew) {
          const siblings = live(db.items).filter((x) => x.feature_id === f.id);
          await api.insertItem({ feature_id: f.id, data, status, sort: Math.max(-1, ...siblings.map((x) => x.sort)) + 1 });
        } else await api.updateItem(it.id, { data, status });
      }, isNew ? (status === "draft" ? "Disimpan sebagai draft" : "Item ditayangkan") : "Perubahan disimpan");
      if (ok) { sheet.close(); await refresh(); }
    });
  }

  /* ---------- Admin (khusus Pemilik) ---------- */
  function adminsView() {
    const list = db.admins;
    return `
      <div class="adm-title"><div><p class="eyebrow">Khusus Pemilik</p><h1>Admin</h1><p>Maksimal 5 orang. Tidak ada pendaftaran publik: hanya email di daftar ini yang bisa masuk ke halaman admin.</p></div></div>
      <form class="row" data-form="add-admin" style="grid-template-columns:1fr auto auto;margin-bottom:18px">
        <input class="input" name="email" type="email" placeholder="email@contoh.com" required aria-label="Email admin baru" ${list.length >= 5 ? "disabled" : ""}>
        <select class="input" name="role" aria-label="Peran" ${list.length >= 5 ? "disabled" : ""}>${Object.entries(ROLE).map(([k, l]) => `<option value="${k}" ${k === "editor" ? "selected" : ""}>${l}</option>`).join("")}</select>
        <button class="btn" type="submit" ${list.length >= 5 ? "disabled" : ""}>${I.plus} Tambah</button>
      </form>
      <div class="rows">${list.map((a) => `
        <div class="row">
          <span class="ico" style="font-weight:600;color:var(--ink)">${esc(a.email[0].toUpperCase())}</span>
          <div class="main"><strong>${esc(a.email)}</strong><span class="meta">${ROLE_DESC[a.role]}${a.email === String(me.email).toLowerCase() ? " · <b>Anda</b>" : ""}</span></div>
          <div class="acts">
            <select class="input" style="width:auto;padding:8px 12px;font-size:13px" data-act="role" data-email="${esc(a.email)}" aria-label="Peran ${esc(a.email)}">${Object.entries(ROLE).map(([k, l]) => `<option value="${k}" ${k === a.role ? "selected" : ""}>${l}</option>`).join("")}</select>
            <button class="ibtn danger" type="button" data-act="admin-del" data-email="${esc(a.email)}" aria-label="Hapus admin">${I.trash}</button>
          </div>
        </div>`).join("")}</div>
      <p style="color:var(--dim);font-size:13px;margin-top:16px">${list.length}/5 admin. Admin baru cukup membuka halaman admin, memasukkan emailnya, lalu klik link yang dikirim ke email tersebut.</p>`;
  }

  /* ---------- Sampah (khusus Pemilik) ---------- */
  function trashView() {
    const fs = db.features.filter((f) => f.deleted_at), its = db.items.filter((i) => i.deleted_at);
    const when = (t) => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const row = (kind, id, title, sub) => `
      <div class="row">
        <span class="ico">${I.trash}</span>
        <div class="main"><strong>${esc(title)}</strong><span class="meta">${sub}</span></div>
        <div class="acts">
          <button class="btn secondary small" type="button" data-act="restore" data-kind="${kind}" data-id="${id}">${I.restore} Pulihkan</button>
          <button class="ibtn danger" type="button" data-act="purge" data-kind="${kind}" data-id="${id}" aria-label="Hapus permanen">${I.close}</button>
        </div>
      </div>`;
    return `
      <div class="adm-title"><div><p class="eyebrow">Khusus Pemilik</p><h1>Sampah</h1><p>Fitur dan item yang dihapus masuk ke sini dulu. Pulihkan bila perlu, atau hapus permanen.</p></div></div>
      ${!fs.length && !its.length ? `<div class="empty-row">Sampah kosong.</div>` : `<div class="rows">
        ${fs.map((f) => row("features", f.id, f.name, `Fitur · dihapus ${when(f.deleted_at)}`)).join("")}
        ${its.map((i) => { const f = byId(i.feature_id); return f ? row("items", i.id, itemTitle(i, f), `Item di ${esc(f.name)} · dihapus ${when(i.deleted_at)}`) : ""; }).join("")}
      </div>`}`;
  }

  /* ---------- Dialog ---------- */
  let sheetEl;
  function openSheet(html) {
    if (sheetEl) sheetEl.remove();
    sheetEl = document.createElement("dialog");
    sheetEl.className = "sheet";
    sheetEl.innerHTML = `<button class="sheet-close" type="button" aria-label="Tutup">${I.close}</button>${html}`;
    document.body.appendChild(sheetEl);
    sheetEl.addEventListener("click", (e) => { if (e.target === sheetEl || e.target.closest(".sheet-close")) sheetEl.close(); });
    sheetEl.addEventListener("close", () => { document.body.style.overflow = ""; });
    document.body.style.overflow = "hidden";
    sheetEl.showModal();
    const first = sheetEl.querySelector("input:not([type=hidden]):not([type=file]), textarea");
    (first || $(".sheet-close", sheetEl)).focus({ preventScroll: true });
    sheetEl.scrollTop = 0;
    return sheetEl;
  }

  /* ---------- Urutan ---------- */
  async function move(list, id, dir, update) {
    const i = list.findIndex((x) => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const arr = [...list]; [arr[i], arr[j]] = [arr[j], arr[i]];
    await run(async () => { for (let k = 0; k < arr.length; k++) if (arr[k].sort !== k) await update(arr[k].id, { sort: k }); });
    await refresh();
  }

  async function importSeed() {
    const m = S.seedModel();
    const map = {}; // id contoh → id baru di database, agar rujukan topik & langkah jalur tetap benar
    await run(async () => {
      for (const f of m.features) {
        if (db.features.some((x) => x.slug === f.slug && !x.deleted_at)) continue;
        const row = await api.insertFeature({ slug: f.slug, name: f.name, description: f.description, template: f.template, system: f.system, fields: f.fields, sort: f.sort, visible: true });
        const refKeys = f.fields.filter((x) => REF_TYPES.includes(x.type)).map((x) => x.key);
        for (const i of m.items.filter((i) => i.feature_id === f.id).sort((a, b) => a.sort - b.sort)) {
          const data = { ...i.data };
          refKeys.forEach((k) => { if (Array.isArray(data[k])) data[k] = data[k].map((v) => map[v] || v); else if (data[k]) data[k] = map[data[k]] || data[k]; });
          const r = await api.insertItem({ feature_id: row.id, data, sort: i.sort, status: "published" });
          if (r && r.id) map[i.id] = r.id;
        }
      }
    }, "Konten contoh diimpor");
    await refresh();
  }

  /* ---------- Event ---------- */
  app.addEventListener("click", async (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { view.name = nav.dataset.nav; view.filter = "all"; render(); scrollTo({ top: 0 }); return; }
    const fl = e.target.closest("[data-filter]");
    if (fl) { view.filter = fl.dataset.filter; render(); return; }
    const b = e.target.closest("[data-act]");
    if (!b || b.tagName === "SELECT") return;
    const id = b.dataset.id, act = b.dataset.act;
    const feats = live(db.features).sort((a, c) => a.sort - c.sort);
    const f = view.name === "items" ? byId(view.featureId) : null;
    const items = f ? live(db.items).filter((x) => x.feature_id === f.id).sort((a, c) => a.sort - c.sort) : [];
    switch (act) {
      case "logout": await api.signOut(); location.reload(); break;
      case "reset-demo": if (confirm("Kembalikan semua data demo ke konten contoh?")) { api.reset(); await refresh(); toast("Data demo direset"); } break;
      case "import": await importSeed(); break;
      case "new-feature": featureForm(null); break;
      case "edit-feature": featureForm(byId(id)); break;
      case "open-feature": view.name = "items"; view.featureId = id; view.filter = "all"; render(); scrollTo({ top: 0 }); break;
      case "f-up": case "f-down": await move(feats, id, act === "f-up" ? -1 : 1, (x, p) => api.updateFeature(x, p)); break;
      case "f-vis": { const ft = byId(id); if (await run(() => api.updateFeature(id, { visible: !ft.visible }), ft.visible ? "Fitur disembunyikan" : "Fitur ditampilkan")) await refresh(); break; }
      case "f-del": { const ft = byId(id); if (confirm(`Pindahkan fitur “${ft.name}” beserta isinya ke Sampah?`) && await run(() => api.updateFeature(id, { deleted_at: new Date().toISOString() }), "Dipindahkan ke Sampah")) await refresh(); break; }
      case "new-item": itemForm(f, null); break;
      case "edit-item": itemForm(f, db.items.find((x) => x.id === id)); break;
      case "i-up": case "i-down": await move(items, id, act === "i-up" ? -1 : 1, (x, p) => api.updateItem(x, p)); break;
      case "i-status": { const it = db.items.find((x) => x.id === id); const st = it.status === "published" ? "draft" : "published"; if (await run(() => api.updateItem(id, { status: st }), st === "published" ? "Item ditayangkan" : "Item jadi draft")) await refresh(); break; }
      case "i-del": { const it = db.items.find((x) => x.id === id), n = usedBy(id); if (confirm(`Pindahkan “${itemTitle(it, f)}” ke Sampah?${n ? `\n\nItem ini dipakai oleh ${n} item lain (misalnya langkah jalur atau topik konten). Setelah dihapus, rujukannya ikut hilang dari portal.` : ""}`) && await run(() => api.updateItem(id, { deleted_at: new Date().toISOString() }), "Dipindahkan ke Sampah")) await refresh(); break; }
      case "admin-del": if (confirm(`Hapus ${b.dataset.email} dari daftar admin?`) && await run(() => api.deleteAdmin(b.dataset.email), "Admin dihapus")) await refresh(); break;
      case "restore": { const fn = b.dataset.kind === "features" ? api.updateFeature : api.updateItem; if (await run(() => fn.call(api, id, { deleted_at: null }), "Dipulihkan")) await refresh(); break; }
      case "purge": if (confirm("Hapus permanen? Tindakan ini tidak bisa dibatalkan.") && await run(() => api.purge(b.dataset.kind, id), "Dihapus permanen")) await refresh(); break;
    }
  });
  app.addEventListener("change", async (e) => {
    const s = e.target.closest("select[data-act=role]");
    if (!s) return;
    if (await run(() => api.upsertAdmin(s.dataset.email, s.value), "Peran diperbarui")) await refresh(); else await refresh();
  });
  app.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-form=add-admin]");
    if (!form) return;
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase(), role = form.role.value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast("Email tidak valid", true);
    if (db.admins.some((a) => a.email === email)) return toast("Email ini sudah terdaftar", true);
    if (await run(() => api.upsertAdmin(email, role), "Admin ditambahkan")) await refresh();
  });

  /* ---------- Login ---------- */
  function loginView(note) {
    const demo = api && api.mode === "demo";
    app.innerHTML = `
      <div class="login"><div class="login-card">
        <a class="brand" href="index.html">${LOGO}<span>AI Creator Labs<small>Admin portal</small></span></a>
        <h1>Masuk <em>admin</em></h1>
        ${note ? `<div class="form-msg ${note.ok ? "ok" : "bad"}">${esc(note.text)}</div>` : ""}
        ${demo ? `
          <p>Supabase belum dihubungkan, jadi halaman ini berjalan dalam <b>mode demo</b> (hanya di komputer ini). Pilih peran untuk mencoba hak aksesnya.</p>
          <form data-form="demo"><div class="role-pick">${Object.entries(ROLE).map(([k, l], i) => `<label><input type="radio" name="role" value="${k}" ${i === 0 ? "checked" : ""}><span><b>${l}</b><span>${ROLE_DESC[k]}</span></span></label>`).join("")}</div>
          <button class="btn" type="submit">Masuk mode demo ${I.send}</button></form>`
        : `
          <p>Masukkan email yang terdaftar sebagai admin. Kami kirim link masuk ke email tersebut.</p>
          <form data-form="login"><label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required placeholder="nama@contoh.com"></label>
          <button class="btn" type="submit">Kirim link masuk ${I.send}</button></form>`}
        <a class="btn back-home" href="index.html">Kembali ke beranda</a>
      </div></div>`;
    const fd = $("[data-form=demo]"), fl = $("[data-form=login]");
    fd && fd.addEventListener("submit", async (e) => { e.preventDefault(); me = await api.signIn(fd.role.value); await start(); });
    fl && fl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button", fl), email = fl.email.value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return loginView({ text: "Email tidak valid." });
      btn.disabled = true; btn.textContent = "Mengirim…";
      try { await api.signIn(email); loginView({ ok: true, text: `Link masuk dikirim ke ${email}. Buka email Anda dan klik link tersebut di perangkat ini.` }); }
      catch (err) { loginView({ text: friendly(err) }); }
    });
  }

  function blocked(title, text) {
    app.innerHTML = `<div class="login"><div class="login-card"><a class="brand" href="index.html">${LOGO}<span>AI Creator Labs<small>Admin portal</small></span></a><h1>${title}</h1><p>${text}</p><a class="btn" href="index.html">Kembali ke portal</a></div></div>`;
  }

  async function start() {
    db = await api.load();
    view.name = "features";
    render();
  }

  async function boot() {
    try {
      if (S.configured) api = await supabaseAdapter();
      else if (S.isLocal) api = demoAdapter();
      else return blocked("Admin belum <em>aktif</em>", "Halaman admin belum dihubungkan ke database. Isi assets/config.js dengan data Supabase, lalu unggah ulang website.");
      me = await api.session();
      if (!me) return loginView();
      if (!me.role) { await api.signOut(); return loginView({ text: "Akun ini tidak terdaftar sebagai admin." }); }
      await start();
    } catch (e) {
      console.error(e);
      blocked("Terjadi <em>kendala</em>", esc(friendly(e)));
    }
  }
  boot();
})();
