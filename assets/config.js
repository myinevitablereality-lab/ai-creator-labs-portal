/* =========================================================
   Konfigurasi Supabase
   Isi dua nilai di bawah dari Supabase → Project Settings → API.
   - supabaseUrl      : "Project URL", contoh https://abcd1234.supabase.co
   - supabaseAnonKey  : kunci "anon public" (aman untuk dipasang di browser,
                        karena semua data dilindungi Row Level Security)
   JANGAN pernah memasang kunci "service_role" di sini.

   Selama masih kosong:
   - Halaman depan memakai konten contoh dari assets/data.js
   - admin.html hanya bisa dibuka dalam "mode demo" di localhost
   ========================================================= */
window.ACL_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
