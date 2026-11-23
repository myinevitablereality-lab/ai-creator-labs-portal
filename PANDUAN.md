# Panduan Portal AI Creator Labs

Portal ini berupa website statis (HTML, CSS, JS) yang membaca kontennya dari **Supabase**. Konten dikelola lewat halaman **admin.html** tanpa perlu mengubah kode.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html`, `jalur.html`, `resources.html`, `knowledges.html`, `articles.html`, `topik.html` | Halaman publik: Beranda, Jalur Belajar, Materi, Video, Artikel, Topik |
| `admin.html` | Halaman admin (tidak ditautkan dari halaman publik) |
| `assets/config.js` | Tempat mengisi alamat & kunci Supabase |
| `assets/store.js` | Membaca konten dari Supabase / konten contoh |
| `assets/app.js`, `assets/motion.css`, `assets/ui.css` | Tampilan, animasi, pencarian, navigasi, dan fitur pengunjung |
| `assets/admin.js`, `assets/admin.css` | Halaman admin |
| `assets/data.js` | Konten contoh (dipakai sebelum Supabase terhubung, dan untuk tombol "Impor konten contoh") |
| `supabase/schema.sql` | Struktur database + aturan keamanan |

---

## Langkah 1 — Supabase (database & login)

1. Buat akun dan project baru di [supabase.com](https://supabase.com). Simpan password database di tempat aman.
2. Buka **SQL Editor → New query**. Salin seluruh isi `supabase/schema.sql`.
3. **Penting:** di baris paling bawah, ganti `email-anda@contoh.com` dengan email Anda. Email ini menjadi **Pemilik** pertama.
4. Klik **Run**. Pastikan muncul "Success".
5. Buka **Project Settings → API**, salin:
   - **Project URL**
   - kunci **anon public** (bukan `service_role`!)
6. Buka `assets/config.js`, lalu isi:
   ```js
   window.ACL_CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseAnonKey: "eyJhbGciOi..."
   };
   ```

> Kunci `anon` memang aman dipasang di website. Semua data dilindungi *Row Level Security*: pengunjung hanya bisa **membaca** konten yang sudah tayang, dan hanya admin terdaftar yang bisa mengubah data.

## Langkah 2 — Vercel (online-kan website)

1. Unggah folder ini ke repository GitHub (atau pakai `vercel` CLI).
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → pilih repository → **Framework Preset: Other** → **Deploy**. Tidak perlu build command.
3. Setelah selesai, Anda mendapat alamat seperti `https://nama-project.vercel.app`.
4. Kembali ke Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://nama-project.vercel.app`
   - **Redirect URLs**: tambahkan `https://nama-project.vercel.app/admin.html`
   (Tanpa ini, link masuk di email tidak akan mengarah ke halaman admin.)

## Langkah 3 — Domain (nanti)

1. Vercel → Project → **Settings → Domains** → tambahkan domain Anda, ikuti petunjuk DNS-nya.
2. Setelah domain aktif, perbarui **Site URL** dan **Redirect URLs** di Supabase dengan domain baru (misal `https://belajar.domainanda.com/admin.html`).

---

## Cara pakai admin

1. Buka `https://alamat-anda/admin.html` (simpan alamat ini; tidak ada tautan dari halaman publik).
2. Masukkan email Pemilik → klik **Kirim link masuk** → buka email → klik link-nya di perangkat yang sama.
3. Pertama kali: klik **Impor konten contoh** agar fitur bawaan (Pintasan, Topik, Jalur Belajar, Materi, Video, Artikel) dan isi contohnya masuk ke database. Setelah itu, edit atau hapus sesuai materi asli.

### Fitur
- **Fitur sistem** (Pintasan Beranda, Topik, Jalur Belajar, Materi, Video, Artikel) dipakai langsung oleh halaman portal. Field-nya dikunci, tapi isinya bebas ditambah, diubah, diurutkan, dan dihapus. Nama, urutan, dan tampil/sembunyinya fitur juga bisa diatur.
- **Topik**: satu daftar topik untuk semua konten. Setiap materi, video, dan artikel wajib memilih satu topik dan satu level (Pemula, Menengah, Lanjut). Mengganti nama topik otomatis berlaku di semua konten.
- **Jalur Belajar**: setiap jalur berisi nama, deskripsi, level, **jalur sebelumnya** (membentuk peta bercabang), **cocok untuk pengalaman/tujuan** (dipakai rekomendasi dari pertanyaan sambutan di beranda), dan **langkah**. Langkah dipilih dari daftar materi/video/artikel, lalu diurutkan dengan ▲▼ atau dihapus dengan ✕.
- Saat menghapus topik atau konten yang masih dipakai jalur, admin memberi peringatan dulu. Konten yang dihapus otomatis hilang dari langkah jalur di portal.
- Alamat halaman jalur dan topik dibuat dari namanya (misal `jalur.html?p=kenal-ai`). Kalau namanya diganti, perbarui juga link di **Pintasan Beranda** yang mengarah ke sana.
- **Tambah fitur** → pilih template (Video, Galeri, Teks singkat, Link, Produk, Kosong) → beri nama → atur field → **Buat fitur**. Fitur baru otomatis muncul di **beranda** sebagai section "Sorotan" setelah ada item yang tayang.
- Tombol ▲▼ mengatur urutan, sakelar mengatur tampil/sembunyi.

### Item
- **Kelola isi** → **Tambah item**. Formulir dibuat otomatis dari field fitur.
- **Link YouTube**: tempel link-nya, thumbnail muncul otomatis, dan video diputar saat kartunya diklik.
- **Gambar**: pilih file (otomatis diperkecil sebelum diunggah) atau tempel URL gambar.
- **Status**: *Tayang* langsung tampil di portal, *Draft* disimpan dulu.
- Perubahan terlihat di portal setelah halaman di-refresh.

### Peran

| Peran | Bisa apa |
|---|---|
| Pemilik | Semua, termasuk kelola admin dan Sampah |
| Editor | Kelola fitur dan item, termasuk menghapus |
| Kontributor | Hanya menambah item; item masuk draft sampai disetujui Editor/Pemilik |

- Menu **Admin** (khusus Pemilik): tambah hingga 5 admin. Admin baru cukup membuka `admin.html`, memasukkan emailnya, dan klik link di email. Tidak ada pendaftaran publik: email yang tidak terdaftar tidak bisa membuat akun.
- Menu **Sampah** (khusus Pemilik): fitur/item yang dihapus masuk ke sini dulu dan bisa dipulihkan atau dihapus permanen.

---

## Mencoba tanpa Supabase (mode demo)

Selama `assets/config.js` masih kosong, `admin.html` bisa dibuka di komputer sendiri (localhost) dalam **mode demo**: pilih peran, lalu coba semua fiturnya. Data demo tersimpan di browser itu saja dan langsung tampil di portal lokal. Di website online, mode demo tidak aktif.

Menjalankan secara lokal:
```
python -m http.server 5173
```
lalu buka `http://localhost:5173`.

## Fitur untuk pengunjung

- **Sambutan 3 pertanyaan** di beranda (pengalaman, tujuan, waktu per minggu) → rekomendasi jalur, langkah berikutnya, dan perkiraan berapa minggu. Bisa dilewati atau diubah kapan saja.
- **Jalur Belajar** dengan peta bercabang dan langkah bernomor. Di setiap konten muncul posisinya ("Jalur 2 · Langkah 3 dari 7") dan tombol lanjut ke langkah berikutnya.
- **Pencarian cepat**: tombol Cari di header, `Ctrl+K` / `⌘K`, atau tombol `/`. Mencari jalur, topik, materi, video, dan artikel sekaligus.
- **Navigasi**: di komputer header menempel saat digulir; di ponsel/tablet tegak ada bar bawah (Beranda · Jalur · Cari · Tersimpan · Menu).
- **Simpan** konten (ikon penanda) dan **Tandai sudah dipelajari**; progres per jalur tampil di beranda dan di menu Tersimpan.
- Semua ini tersimpan di browser pengunjung, tanpa akun.
