/* Konten contoh portal AI Creator Labs. Ganti/kembangkan sesuai materi asli. */
window.ACL_DATA = {
  resources: [
    { id: "peta-belajar-ai", title: "Peta Belajar AI dari Nol", topic: "dasar", format: "Panduan", level: "Pemula", time: "20 menit",
      desc: "Urutan belajar yang jelas: dari konsep LLM, prompting, sampai membangun alur kerja AI pertama.",
      items: ["Glosarium istilah AI yang sering dipakai", "Jalur belajar 4 minggu yang bisa diikuti", "Rekomendasi latihan per tahap", "Checklist kesiapan sebelum lanjut ke agent"] },
    { id: "anatomi-prompt", title: "Anatomi Prompt yang Efektif", topic: "prompting", format: "Cheatsheet", level: "Pemula", time: "10 menit",
      desc: "Kerangka peran, konteks, tugas, format, dan contoh untuk menulis prompt yang konsisten hasilnya.",
      items: ["Template 5 bagian prompt", "Contoh sebelum–sesudah", "Kesalahan umum dan cara memperbaikinya"] },
    { id: "pustaka-prompt-kreator", title: "Pustaka Prompt untuk Kreator", topic: "konten", format: "Template", level: "Menengah", time: "Referensi",
      desc: "Kumpulan prompt siap pakai untuk riset ide, menulis naskah, membuat caption, dan repurposing konten.",
      items: ["40+ prompt dikelompokkan per kebutuhan", "Variabel yang bisa diganti cepat", "Tips menyesuaikan dengan gaya bahasa sendiri"] },
    { id: "rancang-ai-agent", title: "Merancang AI Agent Pertama", topic: "agent", format: "Panduan", level: "Menengah", time: "35 menit",
      desc: "Cara memecah tugas, memilih tools, dan menulis instruksi agar agent bekerja andal dan bisa diaudit.",
      items: ["Kanvas perancangan agent", "Pola tool-use yang umum", "Cara menguji dan mengevaluasi hasil agent"] },
    { id: "checklist-evaluasi-agent", title: "Checklist Evaluasi Agent", topic: "agent", format: "Checklist", level: "Lanjut", time: "15 menit",
      desc: "Daftar periksa untuk menilai akurasi, keamanan, dan biaya sebelum agent dipakai untuk pekerjaan nyata.",
      items: ["25 butir pemeriksaan", "Skenario uji kasus tepi", "Lembar skor sederhana"] },
    { id: "automasi-tanpa-kode", title: "Automasi Konten Tanpa Kode", topic: "automasi", format: "Panduan", level: "Pemula", time: "25 menit",
      desc: "Hubungkan AI dengan spreadsheet, formulir, dan email untuk memangkas pekerjaan berulang setiap minggu.",
      items: ["Contoh alur: ide → draf → jadwal posting", "Pemicu dan aksi yang paling berguna", "Cara memantau alur agar tidak gagal diam-diam"] },
    { id: "sistem-second-brain", title: "Sistem Catatan Berbantuan AI", topic: "konten", format: "Template", level: "Menengah", time: "Referensi",
      desc: "Struktur catatan dan prompt ringkasan agar riset, ide, dan referensi mudah ditemukan kembali.",
      items: ["Struktur folder dan tag", "Prompt ringkasan mingguan", "Rutinitas review 15 menit"] },
    { id: "prompt-visual", title: "Prompt untuk Visual & Ilustrasi", topic: "visual", format: "Cheatsheet", level: "Pemula", time: "12 menit",
      desc: "Kosakata gaya, pencahayaan, komposisi, dan lensa untuk menghasilkan visual AI yang lebih terarah.",
      items: ["Daftar kata kunci gaya visual", "Formula prompt gambar", "Etika dan lisensi aset visual AI"] },
    { id: "storyboard-video-ai", title: "Storyboard Video dengan AI", topic: "visual", format: "Template", level: "Menengah", time: "20 menit",
      desc: "Template storyboard untuk merencanakan video pendek: naskah, shot list, dan prompt per adegan.",
      items: ["Template storyboard 6 adegan", "Contoh naskah 30 detik", "Prompt konsistensi karakter"] },
    { id: "perbandingan-tools", title: "Memilih Tools AI yang Tepat", topic: "dasar", format: "Panduan", level: "Pemula", time: "15 menit",
      desc: "Kerangka menilai tools AI berdasarkan kebutuhan, privasi data, biaya, dan kemudahan integrasi.",
      items: ["Matriks keputusan sederhana", "Pertanyaan wajib sebelum berlangganan", "Tanda bahaya soal privasi data"] },
    { id: "ai-untuk-riset", title: "AI untuk Riset & Verifikasi", topic: "prompting", format: "Checklist", level: "Menengah", time: "10 menit",
      desc: "Cara memakai AI untuk riset cepat tanpa terjebak informasi keliru: sumber, kutipan, dan cek silang.",
      items: ["Alur riset 3 langkah", "Prompt untuk meminta sumber", "Checklist verifikasi fakta"] },
    { id: "etika-ai-kreator", title: "Pedoman Etika AI untuk Kreator", topic: "etika", format: "Panduan", level: "Pemula", time: "12 menit",
      desc: "Prinsip transparansi, hak cipta, dan privasi saat memakai AI dalam karya dan konten publik.",
      items: ["Kapan perlu mencantumkan penggunaan AI", "Hak cipta dan aset pihak ketiga", "Menjaga data pribadi audiens"] }
  ],

  videos: [
    { id: "apa-itu-llm", title: "Apa Itu LLM? Penjelasan Tanpa Jargon", topic: "dasar", dur: "12:40", level: "Pemula", hue: 232,
      desc: "Memahami cara kerja model bahasa besar dengan analogi sederhana, plus batasan yang perlu diketahui.",
      chapters: [["Pembuka", "0:00"], ["Token dan prediksi kata", "2:10"], ["Kenapa AI bisa salah", "6:30"], ["Rangkuman", "11:05"]] },
    { id: "prompt-5-bagian", title: "Menulis Prompt 5 Bagian dalam 10 Menit", topic: "prompting", dur: "10:15", level: "Pemula", hue: 262,
      desc: "Praktik langsung kerangka prompt peran–konteks–tugas–format–contoh dengan kasus nyata kreator.",
      chapters: [["Kenapa prompt sering gagal", "0:00"], ["Lima bagian prompt", "1:45"], ["Demo sebelum–sesudah", "5:20"], ["Latihan mandiri", "9:00"]] },
    { id: "few-shot", title: "Teknik Few-Shot: Mengajari AI dengan Contoh", topic: "prompting", dur: "14:02", level: "Menengah", hue: 280,
      desc: "Memberi contoh yang tepat agar keluaran AI mengikuti gaya, struktur, dan nada yang diinginkan.",
      chapters: [["Konsep few-shot", "0:00"], ["Memilih contoh yang baik", "3:40"], ["Demo gaya penulisan", "7:15"], ["Kesalahan umum", "12:00"]] },
    { id: "agent-pertama", title: "Membangun AI Agent Pertama Langkah demi Langkah", topic: "agent", dur: "24:30", level: "Menengah", hue: 205, featured: true,
      desc: "Dari ide sampai agent yang berjalan: memecah tugas, menulis instruksi, memberi tools, lalu mengujinya bersama-sama.",
      chapters: [["Merumuskan tugas agent", "0:00"], ["Menulis instruksi sistem", "4:20"], ["Menambahkan tools", "10:05"], ["Menguji dan memperbaiki", "17:40"], ["Penutup", "23:10"]] },
    { id: "evaluasi-agent", title: "Cara Mengevaluasi Hasil Agent", topic: "agent", dur: "18:12", level: "Lanjut", hue: 190,
      desc: "Membuat set uji, metrik sederhana, dan kebiasaan review agar agent tetap andal dari waktu ke waktu.",
      chapters: [["Kenapa evaluasi penting", "0:00"], ["Membuat set uji", "3:30"], ["Metrik sederhana", "9:10"], ["Review rutin", "14:45"]] },
    { id: "multi-agent", title: "Pola Multi-Agent untuk Tugas Besar", topic: "agent", dur: "21:48", level: "Lanjut", hue: 248,
      desc: "Kapan memecah pekerjaan ke beberapa agent, cara mengoordinasikannya, dan kapan sebaiknya tidak.",
      chapters: [["Satu agent vs banyak", "0:00"], ["Pola orkestrator", "5:00"], ["Berbagi konteks", "11:20"], ["Biaya dan risiko", "17:30"]] },
    { id: "automasi-mingguan", title: "Automasi Rutinitas Konten Mingguan", topic: "automasi", dur: "16:20", level: "Pemula", hue: 170,
      desc: "Membangun alur otomatis dari ide di spreadsheet hingga draf siap tinjau tanpa menulis kode.",
      chapters: [["Memetakan rutinitas", "0:00"], ["Menyusun pemicu", "4:10"], ["Langkah AI di tengah alur", "8:30"], ["Pemantauan", "13:50"]] },
    { id: "email-otomatis", title: "Asisten Email Berbasis AI", topic: "automasi", dur: "11:35", level: "Menengah", hue: 220,
      desc: "Mengelompokkan, meringkas, dan menyiapkan draf balasan email dengan tetap memegang kendali akhir.",
      chapters: [["Masalah inbox penuh", "0:00"], ["Klasifikasi otomatis", "2:40"], ["Draf balasan", "6:15"], ["Batas yang aman", "9:50"]] },
    { id: "visual-konsisten", title: "Visual AI yang Konsisten untuk Brand", topic: "visual", dur: "15:05", level: "Menengah", hue: 300,
      desc: "Menjaga gaya, palet, dan karakter tetap konsisten di seluruh visual yang dihasilkan AI.",
      chapters: [["Panduan gaya mini", "0:00"], ["Prompt referensi", "4:00"], ["Konsistensi karakter", "8:45"], ["Kurasi akhir", "13:00"]] },
    { id: "naskah-video", title: "Dari Ide ke Naskah Video Pendek", topic: "konten", dur: "13:28", level: "Pemula", hue: 318,
      desc: "Memakai AI sebagai partner brainstorming dan penyunting naskah, tanpa kehilangan suara sendiri.",
      chapters: [["Mencari sudut cerita", "0:00"], ["Kerangka hook–isi–ajakan", "3:20"], ["Menyunting bersama AI", "7:40"], ["Membaca ulang", "11:30"]] },
    { id: "batasan-ai", title: "Halusinasi AI dan Cara Mengatasinya", topic: "dasar", dur: "09:50", level: "Pemula", hue: 244,
      desc: "Mengenali jawaban yang terdengar meyakinkan tetapi keliru, serta kebiasaan verifikasi yang sederhana.",
      chapters: [["Apa itu halusinasi", "0:00"], ["Contoh nyata", "2:30"], ["Teknik verifikasi", "5:10"], ["Rangkuman", "8:40"]] },
    { id: "privasi-data", title: "Privasi Data Saat Memakai Tools AI", topic: "etika", dur: "08:44", level: "Pemula", hue: 214,
      desc: "Data apa yang aman dibagikan, cara membaca kebijakan privasi, dan pengaturan yang perlu dicek.",
      chapters: [["Mengapa penting", "0:00"], ["Jenis data sensitif", "1:50"], ["Pengaturan yang dicek", "4:30"], ["Kebiasaan aman", "7:20"]] }
  ],

  topics: [

    { id: "dasar", name: "Dasar AI", desc: "Cara kerja AI, istilah penting, dan memilih tools dengan bijak." },

    { id: "prompting", name: "Prompting", desc: "Menulis instruksi agar AI memberi hasil yang tepat dan konsisten." },

    { id: "konten", name: "Menulis & Konten", desc: "Riset, menulis, dan memproduksi konten dengan bantuan AI." },

    { id: "visual", name: "Visual & Video", desc: "Membuat gambar dan video dengan AI yang tetap konsisten dan terarah." },

    { id: "automasi", name: "Automasi", desc: "Alur kerja otomatis untuk memangkas pekerjaan berulang, tanpa kode." },

    { id: "agent", name: "AI Agent", desc: "Merancang, menguji, dan menjalankan agent yang bekerja untuk Anda." },

    { id: "etika", name: "Etika AI", desc: "Transparansi, hak cipta, dan privasi saat memakai AI." }

  ],



  /* Jalur belajar: langkah merujuk ke konten di atas (r: materi, v: video, a: artikel).

     exp & goal menentukan rekomendasi dari pertanyaan sambutan di beranda. */

  paths: [

    { id: "kenal-ai", title: "Kenal AI", level: "Pemula", after: null,

      exp: ["baru"], goal: ["konten", "kerja", "automasi", "penasaran"],

      desc: "Titik mulai untuk yang benar-benar baru: cara kerja AI, batasannya, memilih tools, dan memakainya dengan aman.",

      steps: ["v:apa-itu-llm", "r:peta-belajar-ai", "v:batasan-ai", "a:memilih-tools", "r:perbandingan-tools", "v:privasi-data", "a:privasi-prompt", "r:etika-ai-kreator"] },

    { id: "prompting-efektif", title: "Prompting Efektif", level: "Pemula", after: "kenal-ai",

      exp: ["pernah"], goal: ["konten", "kerja", "automasi", "penasaran"],

      desc: "Dari prompt asal-asalan ke instruksi yang konsisten: kerangka 5 bagian, contoh, dan berpikir bertahap.",

      steps: ["a:prompt-bukan-mantra", "v:prompt-5-bagian", "r:anatomi-prompt", "a:contoh-lebih-kuat", "v:few-shot", "a:chain-of-thought", "r:ai-untuk-riset"] },

    { id: "kreator-konten", title: "Kreator Konten dengan AI", level: "Menengah", after: "prompting-efektif",

      exp: ["rutin"], goal: ["konten", "penasaran"],

      desc: "Menulis naskah, membuat visual yang konsisten, dan menyusun pipeline konten tanpa kehilangan suara sendiri.",

      steps: ["v:naskah-video", "a:suara-sendiri", "r:pustaka-prompt-kreator", "r:prompt-visual", "v:visual-konsisten", "r:storyboard-video-ai", "a:transparansi-ai", "a:pipeline-konten"] },

    { id: "automasi-agent", title: "Automasi & AI Agent", level: "Menengah", after: "prompting-efektif",

      exp: ["rutin"], goal: ["kerja", "automasi"],

      desc: "Mengotomatiskan pekerjaan berulang, lalu naik kelas ke agent yang andal dan bisa dievaluasi.",

      steps: ["a:automasi-pertama", "v:automasi-mingguan", "r:automasi-tanpa-kode", "v:email-otomatis", "a:kapan-tidak-pakai-agent", "r:rancang-ai-agent", "v:agent-pertama", "v:evaluasi-agent"] }

  ],


  articles: [
    { id: "prompt-bukan-mantra", title: "Prompt Bukan Mantra: Cara Berpikir Saat Menulis Instruksi", date: "2026-11-12", read: 7, topic: "prompting", level: "Pemula",
      excerpt: "Prompt yang baik lahir dari pemahaman tugas, bukan dari kata-kata ajaib. Begini cara menyusunnya.",
      points: ["Mulai dari tujuan akhir, bukan dari kalimat pembuka", "Berikan konteks yang hanya Anda ketahui", "Minta format keluaran secara eksplisit"] },
    { id: "contoh-lebih-kuat", title: "Mengapa Satu Contoh Lebih Kuat dari Sepuluh Aturan", date: "2026-11-02", read: 5, topic: "prompting", level: "Menengah",
      excerpt: "AI meniru pola. Satu contoh yang tepat sering lebih efektif daripada daftar larangan yang panjang.",
      points: ["Pilih contoh yang mewakili hasil ideal", "Variasikan contoh agar AI tidak menyalin mentah", "Gunakan aturan hanya untuk batas yang penting"] },
    { id: "agent-yang-bisa-dipercaya", title: "Membangun Agent yang Bisa Dipercaya", date: "2026-10-28", read: 9, topic: "agent", level: "Menengah",
      excerpt: "Agent yang andal bukan soal model tercanggih, tetapi soal instruksi jelas, tools terbatas, dan evaluasi rutin.",
      points: ["Batasi tools sesuai kebutuhan tugas", "Catat setiap langkah agar bisa diaudit", "Uji dengan kasus tepi sebelum dipakai"] },
    { id: "kapan-tidak-pakai-agent", title: "Kapan Sebaiknya Tidak Memakai Agent", date: "2026-10-15", read: 6, topic: "agent", level: "Menengah",
      excerpt: "Tidak semua pekerjaan butuh agent. Kadang satu prompt atau alur sederhana jauh lebih efisien.",
      points: ["Tugas sekali jalan cukup dengan prompt", "Agent cocok untuk tugas bercabang dan berulang", "Hitung biaya dan risiko sebelum otomatisasi"] },
    { id: "automasi-pertama", title: "Automasi Pertama Anda Sebaiknya Membosankan", date: "2026-10-08", read: 5, topic: "automasi", level: "Pemula",
      excerpt: "Mulailah dari pekerjaan kecil yang berulang dan membosankan, bukan dari proyek ambisius.",
      points: ["Pilih tugas yang dilakukan setiap minggu", "Ukur waktu sebelum dan sesudah", "Tambahkan pemberitahuan saat alur gagal"] },
    { id: "pipeline-konten", title: "Merancang Pipeline Konten dari Ide hingga Terbit", date: "2026-09-30", read: 8, topic: "konten", level: "Menengah",
      excerpt: "Satu sistem untuk menampung ide, menyusun draf dengan AI, meninjau, lalu menjadwalkan publikasi.",
      points: ["Satu tempat untuk semua ide", "AI menyusun draf, manusia menyunting", "Jadwalkan review mingguan"] },
    { id: "suara-sendiri", title: "Menjaga Suara Sendiri Saat Menulis dengan AI", date: "2026-09-21", read: 6, topic: "konten", level: "Pemula",
      excerpt: "AI bisa mempercepat menulis, tetapi audiens datang untuk suara dan sudut pandang Anda.",
      points: ["Tulis kerangka dan opini sendiri dulu", "Gunakan AI untuk menyunting, bukan menggantikan", "Baca ulang dengan suara keras"] },
    { id: "transparansi-ai", title: "Transparansi: Kapan Perlu Mengatakan Konten Dibantu AI", date: "2026-09-10", read: 7, topic: "etika", level: "Pemula",
      excerpt: "Panduan praktis tentang keterbukaan penggunaan AI agar kepercayaan audiens tetap terjaga.",
      points: ["Terbuka saat AI berperan besar dalam karya", "Jangan memakai kemiripan orang tanpa izin", "Hormati hak cipta aset pihak ketiga"] },
    { id: "privasi-prompt", title: "Data Apa yang Tidak Boleh Masuk ke Prompt", date: "2026-08-29", read: 5, topic: "etika", level: "Pemula",
      excerpt: "Sebelum menempelkan dokumen ke chatbot, pahami risiko privasi dan cara menyamarkan data sensitif.",
      points: ["Hindari data pribadi dan rahasia klien", "Samarkan nama dan angka penting", "Periksa pengaturan riwayat dan pelatihan"] },
    { id: "memilih-tools", title: "Lima Pertanyaan Sebelum Berlangganan Tools AI", date: "2026-08-18", read: 6, topic: "dasar", level: "Pemula",
      excerpt: "Hindari tumpukan langganan. Lima pertanyaan ini membantu memilih tools yang benar-benar terpakai.",
      points: ["Masalah apa yang diselesaikan?", "Bagaimana data saya diperlakukan?", "Apakah bisa terhubung dengan alur kerja saat ini?"] },
    { id: "studi-kasus-podcast", title: "Studi Kasus: Memangkas Waktu Produksi Podcast", date: "2026-08-05", read: 10, topic: "automasi", level: "Menengah",
      excerpt: "Bagaimana seorang anggota komunitas memangkas waktu pascaproduksi dengan transkrip dan ringkasan otomatis.",
      points: ["Transkrip otomatis sebagai bahan dasar", "Ringkasan dan catatan episode dibantu AI", "Tetap ada sesi dengar ulang manual"] },
    { id: "studi-kasus-umkm", title: "Studi Kasus: Asisten Katalog untuk Usaha Kecil", date: "2026-07-24", read: 8, topic: "agent", level: "Menengah",
      excerpt: "Agent sederhana yang membantu menulis deskripsi produk dan menjawab pertanyaan umum pelanggan.",
      points: ["Mulai dari 20 produk terlaris", "Jawaban selalu ditinjau sebelum dikirim", "Evaluasi mingguan dari pertanyaan nyata"] },
    { id: "rutinitas-pagi", title: "Rutinitas 20 Menit Pagi Hari dengan Bantuan AI", date: "2026-07-12", read: 4, topic: "dasar", level: "Pemula",
      excerpt: "Menyusun prioritas, merangkum catatan kemarin, dan menyiapkan fokus hari ini dalam 20 menit.",
      points: ["Ringkas catatan kemarin", "Pilih tiga prioritas utama", "Blok waktu untuk kerja mendalam"] },
    { id: "chain-of-thought", title: "Meminta AI Berpikir Bertahap", date: "2026-06-30", read: 6, topic: "prompting", level: "Menengah",
      excerpt: "Memberi ruang bagi AI untuk menguraikan langkah sering meningkatkan kualitas jawaban untuk tugas rumit.",
      points: ["Cocok untuk analisis dan perhitungan", "Minta ringkasan di akhir agar mudah dibaca", "Tidak perlu untuk tugas sederhana"] }
  ]
};
