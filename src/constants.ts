
export const APP_CONFIG = {
  university: {
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c3/Unsyiah-logo.svg",
    name: "Universitas Syiah Kuala"
  },
  author: {
    name: "Syifa Annisa Sirait",
    npm: "250920017100001",
    course: "Pengembangan Praktikum IPA",
    lecturer: "Dr. Ibnu Khaldun, M.Si"
  },
  modules: [
    {
      id: "differences",
      title: "Mengungkapkan Perbedaan",
      description: "Mengapa anggur tenggelam sementara es mengapung?",
      icon: "Anchor",
      videoUrl: "https://www.youtube.com/embed/iC4Eq0vjA0M",
      orientationText: "Saat kamu membuat es teh manis, kamu memperhatikan bahwa es batu selalu mengapung di bagian atas gelas. Namun, saat kamu memasukkan potongan buah anggur dengan ukuran yang lebih kecil dari es batu tersebut, anggur itu justru tenggelam ke dasar gelas. Mengapa es batu yang ukurannya lebih besar bisa mengapung, sementara anggur yang lebih kecil tidak?.",
      phetUrl: "https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html",
      objectives: [
        "C4 (Analisis): Menganalisis hubungan massa, volume, dan massa jenis terhadap posisi benda dalam fluida.",
        "C5 (Evaluasi): Mengevaluasi pengaruh perubahan massa dan volume terhadap kondisi benda (terapung, melayang, tenggelam).",
        "C6 (Kreasi): Mendesain kondisi benda agar dapat terapung atau melayang dengan memanipulasi variabel."
      ],
      subExperiments: [
        {
          id: "same-mass",
          title: "Sama Massa",
          instruction: "Catatan: Pada setiap kegiatan, kamu boleh mengganti jenis cairan untuk membandingkan hasil pengamatan.",
          steps: [
            "Klik menu Compare di bagian bawah layar.",
            "Centang Force Values agar nilai gaya (N) terlihat.",
            "Centang Mass Values agar massa balok (kg) terlihat.",
            "Klik opsi Same Mass pada panel kanan atas.",
            "Pilih jenis cairan pada panel Fluid (air, minyak, madu, dan lain-lain).",
            "Atur Volume Balok 1A dan Balok 1B hingga keduanya memiliki volume berbeda.",
            "Masukkan Balok 1A dan Balok 1B ke dalam cairan.",
            "Amati nilai pada panah merah muda (Buoyancy Force).",
            "Catat hasil pengamatan pada tabel yang disediakan."
          ],
          headers: ["Percobaan", "Benda", "Jenis Cairan", "Massa (kg)", "% Bagian Tercelup", "Gaya Apung (N)", "Posisi Benda"]
        },
        {
          id: "same-volume",
          title: "Sama Volume",
          instruction: "Catatan: Kamu boleh mengganti jenis cairan untuk membandingkan hasil pengamatan.",
          steps: [
            "Klik menu Compare di bagian bawah layar.",
            "Centang Force Values agar nilai gaya (N) terlihat.",
            "Centang Mass Values agar massa balok (kg) terlihat.",
            "Klik opsi Same Volume pada panel kanan atas.",
            "Pilih jenis cairan pada panel Fluid.",
            "Atur volume Balok 1A dan Balok 1B hingga nilainya berbeda.",
            "Masukkan kedua balok ke dalam cairan.",
            "Amati nilai pada panah merah muda (Buoyancy Force).",
            "Catat hasil pengamatan pada tabel."
          ],
          headers: ["Percobaan", "Benda", "Jenis Cairan", "Volume (L)", "% Bagian Tercelup", "Gaya Apung (N)", "Posisi Benda"]
        },
        {
          id: "same-density",
          title: "Sama Massa Jenis",
          instruction: "Catatan: Pada setiap kegiatan, kamu boleh mengganti jenis cairan untuk membandingkan hasil pengamatan.",
          steps: [
            "Klik menu Compare di bagian bawah layar.",
            "Centang Force Values agar nilai gaya (N) terlihat.",
            "Klik opsi Same Density pada panel kanan atas.",
            "Pilih jenis cairan pada panel Fluid.",
            "Amati Balok 3A dan 3B yang memiliki massa jenis sama namun ukuran berbeda.",
            "Masukkan Balok 3A dan Balok 3B ke dalam cairan.",
            "Amati nilai pada panah merah muda (Buoyancy Force).",
            "Catat hasil pengamatan pada tabel yang disediakan."
          ],
          headers: ["Percobaan", "Benda", "Jenis Cairan", "Massa Jenis Cairan", "Massa Jenis Benda", "% Bagian Tercelup", "Gaya Apung (N)", "Posisi Benda"]
        }
      ],
      evaluations: [
        {
          id: 1,
          type: "multiple-choice",
          category: "C1 - MENGINGAT",
          stimulus: "Saat makan siang, Budi mengamati sebuah fenomena unik. Sebuah es batu besar terapung dengan tenang di permukaan gelas teh manisnya. Namun, ketika sebuah biji anggur kecil jatuh ke dalam gelas yang sama, biji tersebut langsung meluncur jatuh hingga menyentuh dasar gelas.",
          question: "Berdasarkan pengamatan Budi, posisi biji anggur yang berada tepat di dasar gelas merupakan fenomena yang disebut...",
          options: ["Mengapung", "Melayang", "Tenggelam", "Terlarut", "Mengendap"],
          answer: "Tenggelam"
        },
        {
          id: 2,
          type: "multiple-choice",
          category: "C2 - MEMAHAMI",
          stimulus: "Saat makan siang, Budi mengamati sebuah fenomena unik. Sebuah es batu besar terapung dengan tenang di permukaan gelas teh manisnya. Namun, ketika sebuah biji anggur kecil jatuh ke dalam gelas yang sama, biji tersebut langsung meluncur jatuh hingga menyentuh dasar gelas.",
          question: "Mengapa es batu yang volumenya jauh lebih besar dari biji anggur tetap bisa berada di permukaan cairan?",
          options: [
            "Karena es batu memiliki massa jenis yang lebih kecil daripada air teh",
            "Karena benda yang berukuran besar selalu didorong ke atas oleh gravitasi",
            "Karena biji anggur memiliki gaya apung yang lebih besar dari beratnya",
            "Karena air teh memberikan tekanan yang lebih besar pada benda kecil",
            "Karena es batu tidak dipengaruhi oleh gaya tarik bumi"
          ],
          answer: "Karena es batu memiliki massa jenis yang lebih kecil daripada air teh"
        },
        {
          id: 3,
          type: "multiple-choice",
          category: "C3 - MENERAPKAN",
          stimulus: "Di laboratorium, seorang siswa menguji dua buah balok dengan massa yang identik yaitu 4,00 kg. Balok 1A adalah bata padat dengan volume 2 Liter, sedangkan Balok 1B adalah kayu dengan volume 10 Liter. Keduanya akan dimasukkan ke dalam kolam berisi air (Massa jenis air: 1,00 Kg/L).",
          question: "Berdasarkan data pada stimulus, berapakah nilai massa jenis Balok 1B (Kayu)?",
          options: ["0,2 Kg/L", "0,4 Kg/L", "2,5 Kg/L", "4,0 Kg/L", "10,5 Kg/L"],
          answer: "0,4 Kg/L"
        },
        {
          id: 4,
          type: "multiple-choice",
          category: "C5 - MENGEVALUASI",
          stimulus: "Di laboratorium, seorang siswa menguji dua buah balok dengan massa yang identik yaitu 4,00 kg. Balok 1A adalah bata padat dengan volume 2 Liter, sedangkan Balok 1B adalah kayu dengan volume 10 Liter. Keduanya akan dimasukkan ke dalam kolam berisi air (Massa jenis air: 1,00 Kg/L).",
          question: "Jika siswa tersebut memasukkan kedua balok ke air, manakah prediksi posisi benda yang paling tepat berdasarkan bukti massa jenisnya?",
          options: [
            "Keduanya tenggelam karena memiliki massa yang sama-sama berat",
            "Balok 1A tenggelam karena massa jenisnya 2 Kg/L, sedangkan Balok 1B terapung karena massa jenisnya 0,4 Kg/L",
            "Keduanya terapung karena air mampu menahan beban maksimal 5 Kg",
            "Balok 1B tenggelam karena ukuran volumenya yang besar menghalangi gaya angkat air",
            "Balok 1A melayang tepat di tengah air karena massanya setimbang dengan massa jenis air"
          ],
          answer: "Balok 1A tenggelam karena massa jenisnya 2 Kg/L, sedangkan Balok 1B terapung karena massa jenisnya 0,4 Kg/L"
        },
        {
          id: 5,
          type: "multiple-choice",
          category: "C2 - MEMAHAMI",
          stimulus: "Dua buah balok, 2A (Bata) dan 2B (Kayu), dibuat dengan volume yang sama tepat 5,00 L. Saat ditimbang, Balok 2A memiliki massa 10 Kg, sedangkan Balok 2B hanya memiliki massa 2 Kg. Keduanya kemudian ditekan hingga masuk seluruhnya ke bawah permukaan air.",
          question: "Saat kedua balok tersebut berada sepenuhnya di bawah air, manakah pernyataan yang benar mengenai gaya apung (buoyancy) yang mereka terima?",
          options: [
            "Balok 2A menerima gaya apung lebih besar karena massanya lebih berat",
            "Balok 2B menerima gaya apung lebih besar karena massa jenisnya lebih kecil",
            "Keduanya menerima gaya apung yang sama besar karena memindahkan volume air yang sama",
            "Gaya apung hanya bekerja pada balok kayu karena ia berbahan ringan",
            "Tidak ada gaya apung yang bekerja jika benda dipaksa masuk oleh tangan manusia"
          ],
          answer: "Keduanya menerima gaya apung yang sama besar karena memindahkan volume air yang sama"
        },
        {
          id: 6,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dua buah balok, 2A (Bata) dan 2B (Kayu), dibuat dengan volume yang sama tepat 5,00 L. Saat ditimbang, Balok 2A memiliki massa 10 Kg, sedangkan Balok 2B hanya memiliki massa 2 Kg. Keduanya kemudian ditekan hingga masuk seluruhnya ke bawah permukaan air.",
          question: "Setelah kedua balok dilepaskan di dalam air, Balok 2A tenggelam sepenuhnya sementara Balok 2B terapung di permukaan. Manakah pernyataan yang paling akurat mengenai perbandingan gaya apung yang dialami kedua balok pada kondisi tersebut?",
          options: [
            "Gaya apung pada Balok 2A lebih kecil daripada Balok 2B karena bata lebih berat.",
            "Gaya apung pada Balok 2A lebih besar daripada Balok 2B karena Balok 2A memindahkan volume air yang lebih banyak (seluruh volumenya tercelup)",
            "Keduanya menerima gaya apung yang sama besar karena volume total kedua balok adalah sama (5 L)",
            "Gaya apung pada Balok 2B lebih besar karena kayu memiliki kemampuan alami untuk menolak gravitasi",
            "Balok 2A tidak menerima gaya apung sama sekali karena posisinya sudah menyentuh dasar kolam."
          ],
          answer: "Gaya apung pada Balok 2A lebih besar daripada Balok 2B karena Balok 2A memindahkan volume air yang lebih banyak (seluruh volumenya tercelup)"
        },
        {
          id: 7,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Terdapat dua potong kayu (3A dan 3B) yang berasal dari jenis pohon yang sama. Potongan 3A kecil (2 Kg) dan potongan 3B besar (4 Kg). Karena berasal dari bahan yang sama, keduanya memiliki massa jenis yang identik yaitu 0,40 kg/L.",
          question: "Jika kedua kayu tersebut dimasukkan ke air (1 Kg/L), bagian volume yang muncul di atas permukaan air pada kayu 3A dibandingkan kayu 3B adalah...",
          options: [
            "Kayu 3B muncul lebih banyak karena lebih berat",
            "Kayu 3A muncul lebih sedikit karena lebih ringan",
            "Sama besar secara persentase karena massa jenis keduanya sama",
            "Kayu 3B tenggelam seluruhnya karena massanya mencapai 4 kg",
            "Tidak dapat ditentukan tanpa mengetahui suhu air kolam"
          ],
          answer: "Sama besar secara persentase karena massa jenis keduanya sama"
        },
        {
          id: 8,
          type: "multiple-choice",
          category: "C6 - MENCIPTAKAN",
          stimulus: "Terdapat dua potong kayu (3A dan 3B) yang berasal dari jenis pohon yang sama. Potongan 3A kecil (2 Kg) dan potongan 3B besar (4 Kg). Karena berasal dari bahan yang sama, keduanya memiliki massa jenis yang identik yaitu 0,40 kg/L.",
          question: "Berdasarkan data massa jenis kayu 0,4 Kg/L, hitunglah berapa persentase volume balok yang akan tercelup di bawah permukaan air!",
          options: ["4%", "20%", "40%", "55%", "30%"],
          answer: "40%"
        },
        {
          id: 9,
          type: "multiple-choice",
          category: "C1 - MENGINGAT",
          stimulus: "Seorang ilmuwan menemukan logam misterius bermassa 8 Kg dengan volume 4 L. Ia penasaran apakah logam ini bisa terapung jika diletakkan di dalam wadah berisi air raksa yang memiliki massa jenis sangat tinggi, yaitu 13,6 Kg/L.",
          question: "Pada kondisi benda yang berhasil terapung dengan stabil di atas cairan, maka besarnya gaya berat benda dan gaya apung adalah...",
          options: [
            "Gaya berat harus lebih besar dari gaya apung",
            "Gaya berat harus lebih kecil atau sama dengan gaya apung",
            "Gaya apung harus bernilai nol",
            "Gaya berat harus bernilai nol",
            "Gaya apung harus lebih kecil dari gaya berat"
          ],
          answer: "Gaya berat harus lebih kecil atau sama dengan gaya apung"
        },
        {
          id: 10,
          type: "multiple-choice",
          category: "C5 - MENGEVALUASI",
          stimulus: "Seorang ilmuwan menemukan logam misterius bermassa 8 Kg dengan volume 4 L. Ia penasaran apakah logam ini bisa terapung jika diletakkan di dalam wadah berisi air raksa yang memiliki massa jenis sangat tinggi, yaitu 13,6 Kg/L.",
          question: "Setelah dihitung, balok misterius tersebut memiliki massa jenis 2,00 kg/L. Jika dimasukkan ke minyak goreng 0,8 Kg/L posisi benda tersebut yang paling tepat adalah...",
          options: [
            "Tenggelam, karena massa 8 Kg terlalu berat untuk ditahan oleh minyak",
            "Melayang, karena massa jenis balok sama persis dengan massa jenis minyak goreng",
            "Terapung, karena ukuran balok yang besar memudahkan minyak menahannya",
            "Tenggelam, karena minyak goreng memiliki kekentalan yang rendah",
            "Terapung, karena gaya gravitasi tidak bekerja pada benda di dalam minyak"
          ],
          answer: "Tenggelam, karena massa 8 Kg terlalu berat untuk ditahan oleh minyak"
        }
      ]
    },
    {
      id: "mass-volume",
      title: "Mengatur Massa dan Volume",
      description: "Mengapa telur memiliki posisi berbeda ketika di dalam air?",
      icon: "Scale",
      videoUrl: "https://www.youtube.com/embed/yaWSmkCAos4",
      orientationText: "Seorang koki sedang bereksperimen di dapur. Ia memasukkan sebutir telur mentah ke dalam gelas berisi air tawar, dan telur tersebut langsung tenggelam ke dasar gelas. Namun, setelah ia melarutkan beberapa sendok garam ke dalam air tersebut, telur yang tadinya tenggelam perlahan-lahan naik ke tengah gelas (melayang) dan akhirnya muncul ke permukaan (terapung).",
      phetUrl: "https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html",
      objectives: [
        "C4 (Analisis): Menganalisis hubungan antara massa, volume, dan massa jenis benda terhadap posisinya (terapung, melayang, tenggelam) di dalam berbagai jenis cairan.",
        "C5 (Evaluasi): Mengevaluasi pengaruh perubahan massa jenis fluida (cairan) terhadap besarnya gaya angkat yang diterima oleh benda yang sama.",
        "C6 (Kreasi): Mendesain kondisi benda agar dapat melayang sempurna dengan memanipulasi variabel massa jenis benda agar setara dengan massa jenis cairan."
      ],
      subExperiments: [
        {
          id: "one-object",
          title: "Satu Benda",
          instruction: "Catatan: Di setiap kegiatan nanti, kamu diperbolehkan mengubah jenis cairan pada panel Fluid (Air, Minyak, Madu, atau Custom) untuk melihat perbedaannya terhadap benda.",
          steps: [
            "Klik menu \"Explore\" pada bagian bawah layar simulasi PhET Buoyancy.",
            "Klik menu \" 🟥 \" pada bagian bawah layar simulasi PhET Buoyancy.",
            "Centang kotak \"Buoyancy\" pada panel Forces di kiri bawah agar panah gaya apung muncul.",
            "Centang kotak \"Force Values\" agar angka gaya (Newton) terlihat.",
            "Centang kotak \"Mass Values\" agar angka massa (kg) terlihat pada balok.",
            "Tentukan jenis cairan yang akan digunakan pada panel Fluid di bagian bawah.",
            "Gunakan slider Density dan Volume pada Balok A agar mendapatkan nilai massa jenis dan ukuran yang diinginkan.",
            "Masukkan Balok A ke dalam cairan tersebut dan amati interaksinya.",
            "Amati angka yang tertera pada panah merah muda (Buoyancy Force), panel Density Comparison, dan panel % Submerged.",
            "Catat hasil pengamtaan pada tabel yang tersedia."
          ],
          headers: ["Percobaan", "Benda", "Massa Benda (kg)", "Massa Jenis (kg/L)", "Jenis Fluida", "Massa Jenis Fluida (Kg/L)", "Volume Fluida (L)", "Gaya Apung (N)", "% Bagian Tercelup", "Posisi Benda"]
        },
        {
          id: "two-objects",
          title: "Dua Benda",
          instruction: "Catatan: Di setiap kegiatan nanti, kamu diperbolehkan mengubah jenis cairan pada panel Fluid (Air, Minyak, Madu, atau Custom) untuk melihat perbedaannya terhadap benda.",
          steps: [
            "Klik menu \"Explore\" pada bagian bawah layar simulasi PhET Buoyancy.",
            "Klik menu \" 🟦🟥 \" pada bagian bawah layar simulasi PhET Buoyancy.",
            "Centang kotak \"Buoyancy\" pada panel Forces di kiri bawah agar panah gaya apung muncul.",
            "Centang kotak \"Force Values\" agar angka gaya (Newton) terlihat.",
            "Centang kotak \"Mass Values\" agar angka massa (kg) terlihat pada balok.",
            "Pilih jenis benda yang akan digunakan pada menu dropdown di panel kanan atas.",
            "Tentukan jenis cairan yang akan digunakan pada panel Fluid Density di bagian bawah.",
            "Gunakan slider Massa dan Volume pada Balok A dan Balok B untuk menentukan massa dan volume benda yang ingin diuji.",
            "Masukkan balok A dan Balok B ke dalam cairan dan amati angka yang tertera pada panah merah muda (Buoyancy Force), panel Density Comparison, dan panel % Submerged.",
            "Catat hasil pengamtaan pada tabel yang tersedia."
          ],
          headers: ["Percobaan", "Benda", "Massa Benda (kg)", "Volume Benda (L)", "Massa Jenis Benda (kg/L)", "Jenis Fluida", "Massa Jenis FLuida (Kg/L)",  "Gaya Apung (N)", "& Bagian Tercelup", "Posisi Benda"]
        }
      ],
      evaluations: [
        {
          id: 11,
          type: "multiple-choice",
          category: "C3 - MENERAPKAN",
          stimulus: "Seorang koki menambahkan garam ke dalam air, lalu memasukkan telur. Awalnya telur tenggelam, tetapi setelah ditambahkan banyak garam, telur mulai melayang bahkan terapung.",
          question: "Mengapa telur bisa berubah dari tenggelam menjadi terapung?",
          options: ["Gaya gravitasi menurun", "Massa telur berkurang", "Massa jenis air meningkat", "Telur menjadi lebih ringan", "Volume telur bertambah"],
          answer: "Massa jenis air meningkat"
        },
        {
          id: 12,
          type: "multiple-choice",
          category: "C5 - MENGEVALUASI",
          stimulus: "Seorang koki menambahkan garam ke dalam air, lalu memasukkan telur. Awalnya telur tenggelam, tetapi setelah ditambahkan banyak garam, telur mulai melayang bahkan terapung. Seorang siswa mengatakan, “Telur mengapung karena massanya berkurang setelah diberi garam.”",
          question: "Pernyataan siswa tersebut adalah...",
          options: ["Salah, karena volume lebih berpengaruh", "Benar, karena air mempengaruhi massa", "Benar, karena garam mengurangi massa telur", "Salah, karena massa telur tetap", "Tidak dapat ditentukan"],
          answer: "Salah, karena massa telur tetap"
        },
        {
          id: 13,
          type: "multiple-choice",
          category: "C1 - MENGINGAT",
          stimulus: "Seorang siswa melakukan percobaan menggunakan simulasi PhET Buoyancy mode satu benda. Ia mengatur massa jenis Balok A lebih kecil dari massa jenis air. Ketika dimasukkan ke dalam air, balok tersebut hanya sebagian yang terendam.",
          question: "Kondisi benda yang sebagian terendam menunjukkan bahwa benda tersebut...",
          options: ["Memiliki massa jenis lebih kecil dari cairan", "Memiliki massa jenis sama dengan cairan", "Memiliki massa jenis lebih besar dari air", "Tidak mengalami gaya apung", "Memiliki volume lebih kecil dari cairan"],
          answer: "Memiliki massa jenis lebih kecil dari cairan"
        },
        {
          id: 14,
          type: "multiple-choice",
          category: "C3 - MENERAPKAN",
          stimulus: "Seorang siswa melakukan percobaan menggunakan simulasi PhET Buoyancy mode satu benda. Ia mengatur massa jenis Balok A lebih kecil dari massa jenis air. Ketika dimasukkan ke dalam air, balok tersebut hanya sebagian yang terendam.",
          question: "Jika siswa ingin membuat Balok A tenggelam, maka perubahan yang harus dilakukan adalah...",
          options: ["Meningkatkan massa jenis balok", "Meningkatkan gaya apung", "Mengurangi massa balok", "Mengurangi gaya gravitasi", "Mengurangi volume balok"],
          answer: "Meningkatkan massa jenis balok"
        },
        {
          id: 15,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Seorang siswa melakukan percobaan menggunakan simulasi PhET Buoyancy mode satu benda. Ia mengatur massa jenis Balok A lebih kecil dari massa jenis air. Ketika dimasukkan ke dalam air, balok tersebut hanya sebagian yang terendam.",
          question: "Saat balok terapung, hubungan antara gaya apung dan berat benda adalah...",
          options: ["Berat benda tidak berpengaruh", "Gaya apung lebih besar dari berat", "Gaya apung lebih kecil dari berat", "Gaya apung sama dengan berat", "Gaya apung nol"],
          answer: "Gaya apung sama dengan berat"
        },
        {
          id: 16,
          type: "multiple-choice",
          category: "C3 - MENERAPKAN",
          stimulus: "Di laboratorium sekolah, Andi melakukan percobaan menggunakan dua balok berbeda. Balok A memiliki massa 500 gram dan volume 400 cm³, sedangkan Balok B memiliki massa 300 gram dan volume 400 cm³. Kedua balok dimasukkan ke dalam wadah berisi air.",
          question: "Balok manakah yang akan tenggelam?",
          options: ["Balok A", "Keduanya melayang", "Keduanya mengapung", "Keduanya tenggelam", "Balok B"],
          answer: "Balok A"
        },
        {
          id: 17,
          type: "multiple-choice",
          category: "C3 - MENERAPKAN",
          stimulus: "Pada suatu sore yang sibuk di dermaga, dua buah peti logistik terjatuh ke laut akibat tali katrol yang putus. Peti pertama berisi komponen mesin berat bermassa 19,2 Kg dengan volume hanya 2,4 L. Peti kedua berisi tumpukan pelampung sintetis yang ringan bermassa 4,5 Kg dengan volume 15L.",
          question: "Berapakah massa jenis dari isi peti kedua (pelampung sintetis)?",
          options: ["0,95 Kg/L", "0,30 Kg/L", "0,45 Kg/L", "1,25 Kg/L", "0,75 Kg/L"],
          answer: "0,30 Kg/L"
        },
        {
          id: 18,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Pada suatu sore yang sibuk di dermaga, dua buah peti logistik terjatuh ke laut akibat tali katrol yang putus. Peti pertama berisi komponen mesin berat bermassa 19,2 Kg dengan volume hanya 2,4 L. Peti kedua berisi tumpukan pelampung sintetis yang ringan bermassa 4,5 Kg dengan volume 15L.",
          question: "Mengapa peti pertama tenggelam cepat, sedangkan peti kedua terapung lambat meskipun volumenya lebih kecil?",
          options: ["Peti kedua memiliki kemampuan menghisap udara", "Volume kecil pada benda menarik gravitasi lebih kuat", "Gaya apung hanya bekerja pada benda bervolume > 10L", "Massa jenis peti pertama > air, sedangkan peti kedua < air", "Air laut hanya sanggup menahan benda bermassa < 5 Kg"],
          answer: "Massa jenis peti pertama > air, sedangkan peti kedua < air"
        },
        {
          id: 19,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dua buah balok, Balok A (Logam) dan Balok B (Plastik), memiliki massa sama yaitu 6,00 kg. Balok A memiliki volume hanya 0,75 L, sedangkan Balok B memiliki volume 8 L. Keduanya dimasukkan ke dalam air (1 kg/L).",
          question: "Kesimpulan paling tepat mengenai posisi kedua balok tersebut adalah...",
          options: ["Balok A melayang karena massanya seimbang", "Balok A tenggelam (ρ=8 Kg/L) dan Balok B terapung (ρ=0,75 Kg/L)", "Balok B tenggelam karena volumenya lebih besar", "Keduanya terapung karena air menahan beban 6 Kg", "Keduanya tenggelam karena beratnya 6 Kg"],
          answer: "Balok A tenggelam (ρ=8 Kg/L) dan Balok B terapung (ρ=0,75 Kg/L)"
        },
        {
          id: 20,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dua buah balok, Balok A (Logam) dan Balok B (Plastik), memiliki massa sama yaitu 6,00 kg. Balok A memiliki volume hanya 0,75 L, sedangkan Balok B memiliki volume 8 L. Keduanya dimasukkan ke dalam air (1 kg/L).",
          question: "Mengapa Balok A tenggelam sedangkan Balok B terapung?",
          options: ["Keduanya tenggelam karena beratnya mencapai 6 Kg", "Balok A tenggelam dan Balok B terapung karena perbedaan massa jenis", "Balok B tenggelam karena volumenya lebih besar", "Balok A melayang karena massanya seimbang dengan air", "Keduanya terapung karena air sanggup menahan beban 6 Kg"],
          answer: "Balok A tenggelam dan Balok B terapung karena perbedaan massa jenis"
        }
      ]
    },
    {
      id: "proof",
      title: "Membuktikan Gaya Apung",
      description: "Mengapa Air Tumpah Saat Benda Dimasukkan ke Dalamnya?.",
      icon: "Droplets",
      videoUrl: "https://www.youtube.com/embed/QGMpqZCC20I",
      orientationText: "Bayangkan kamu sedang menuangkan air ke dalam gelas hingga benar-benar penuh. Lalu, kamu memasukkan sebuah batu kecil ke dalamnya. Tiba-tiba, air meluap dan tumpah keluar gelas.",
      phetUrl: "https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html",
      objectives: [
        "C4 (Analisis): Menganalisis hubungan antara gaya apung dengan volume fluida yang dipindahkan.",
        "C5 (Evaluasi): Mengevaluasi kesesuaian hasil dengan Hukum Archimedes.",
        "C6 (Kreasi): Mendesain eksperimen untuk menentukan gaya apung."
      ],
      subExperiments: [
        {
          id: "archimedes-proof",
          title: "Lab Archimedes",
          instruction: "Catatan: Kalian diperbolehkan mengubah jenis cairan pada panel Fluid (Air, Minyak, Madu, atau Custom) untuk melihat perbedaannya terhadap benda.",
          steps: [
            "Klik menu \"Lab\" pada bagian bawah layar simulasi PhET Buoyancy.",
            "Centang kotak \"Buoyancy\" pada panel Forces di kiri bawah agar panah gaya apung muncul.",
            "Centang kotak \"Force Values\" agar angka gaya (Newton) terlihat pada benda.",
            "Klik tanda plus (+) pada panel Fluid Displaced di sisi kiri untuk menampilkan gelas ukur perpindahan zat cair.",
            "Klik tanda plus (+) pada panel Object Density dan % Submerged di sisi kanan untuk memantau data benda secara detail.",
            "Pilih jenis benda yang akan digunakan pada menu dropdown di panel kanan atas.",
            "Tentukan jenis cairan pada panel Fluid Density dan atur kekuatan gravitasi pada panel Gravity.",
            "Masukkan benda ke dalam cairan dan amati kenaikan volume air pada kolam serta volume air yang tumpah ke gelas ukur di sisi kiri.",
            "Amati angka yang tertera pada Panah merah muda (Buoyancy Force) pada benda dan Nilai berat pada panel Fluid Displaced (angka di bawah gelas ukur kecil).",
            "Masukkan data ke dalam tabel pengamatan."
          ],
          headers: ["Percobaan", "Benda", "Jenis FLuida", "Massa Jenis Fluida (Kg/L)", "Volume Fluida (L)", "Volume yang dipindahkan (L)", "Gaya gravitasi(m/s^2)","Gaya Apung (N)", "Berat Zat Cair yang Dipindahkan (N)"]
        }
      ],
      evaluations: [
        {
          id: 21,
          type: "multiple-choice",
          category: "C1 - MENGINGAT",
          stimulus: "Saat praktikum di laboratorium, Rina mengisi sebuah gelas ukur hingga penuh dengan air. Ia kemudian memasukkan sebuah batu kecil ke dalam gelas tersebut. Air langsung meluap dan tumpah ke luar. Rina mengumpulkan air yang tumpah dan mengukurnya, ternyata volumenya 50 mL.",
          question: "Peristiwa air yang tumpah saat benda dimasukkan ke dalam air menunjukkan bahwa...",
          options: [
            "Air memiliki massa jenis tetap",
            "Benda mengalami gaya gravitasi",
            "Benda memindahkan sebagian volume air",
            "Air berubah menjadi lebih berat",
            "Benda menyerap air"
          ],
          answer: "Benda memindahkan sebagian volume air"
        },
        {
          id: 22,
          type: "multiple-choice",
          category: "C2 - MEMAHAMI",
          stimulus: "Rina mengisi gelas ukur hingga penuh dengan air. Saat memasukkan batu, air tumpah 50 mL. Kemudian, ia mengganti batu tersebut dengan sebuah balok kayu yang ukurannya lebih besar. Saat dimasukkan ke dalam air, sebagian air juga tumpah, tetapi volume air yang tumpah hanya 30 mL, meskipun ukuran kayu lebih besar dari batu.",
          question: "Mengapa volume air yang tumpah saat kayu dimasukkan lebih kecil dibandingkan batu?",
          options: [
            "Kayu lebih ringan dari air",
            "Kayu tidak memiliki volume",
            "Kayu hanya tercelup sebagian dalam air",
            "Batu menyerap air lebih banyak",
            "Air tidak bereaksi terhadap kayu"
          ],
          answer: "Kayu hanya tercelup sebagian dalam air"
        },
        {
          id: 23,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Budi melakukan percobaan dengan memasukkan dua jenis batu ke dalam gelas berisi air penuh secara bergantian. Saat batu kecil dimasukkan, sedikit air yang tumpah. Saat batu yang lebih besar dimasukkan, air yang tumpah jauh lebih banyak.",
          question: "Apa yang dapat disimpulkan dari percobaan Budi tersebut?",
          options: [
            "Massa benda menentukan banyak air yang tumpah",
            "Volume benda menentukan banyak air yang tumpah",
            "Bentuk benda menentukan semuanya",
            "Massa jenis benda menentukan air tumpah",
            "Gaya apung tidak berpengaruh"
          ],
          answer: "Volume benda menentukan banyak air yang tumpah"
        },
        {
          id: 24,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dina mengisi wadah dengan air penuh (ρ_air = 1 g/cm³). Ia memasukkan Benda A (massa 1200 g) hingga tercelup seluruhnya, dan air yang tumpah terukur 150 mL.",
          question: "Berdasarkan data tersebut, massa jenis benda A adalah...",
          options: ["6 g/cm³", "8 g/cm³", "13 g/cm³", "5 g/cm³", "14 g/cm³"],
          answer: "8 g/cm³"
        },
        {
          id: 25,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dina memiliki dua benda, A dan B, dengan massa yang sama yaitu 1200 g. Benda A tenggelam seluruhnya memindahkan 150 mL air. Benda B terapung sehingga hanya sebagian yang tenggelam, dan air yang tumpah hanya 90 mL.",
          question: "Perbedaan volume air tumpah antara benda A dan B menunjukkan bahwa...",
          options: [
            "Massa memengaruhi volume air tumpah",
            "Volume tercelup menentukan volume air tumpah",
            "Semua benda memindahkan air sama banyak",
            "Air memiliki massa jenis berbeda",
            "Gaya gravitasi berubah"
          ],
          answer: "Volume tercelup menentukan volume air tumpah"
        },
        {
          id: 26,
          type: "multiple-choice",
          category: "C2 - MEMAHAMI",
          stimulus: "Di laboratorium, siswa memasukkan sebuah balok ke dalam wadah berisi air penuh. Hasil pengamatan menunjukkan bahwa volume air yang keluar selalu sama dengan volume bagian balok yang masuk ke dalam air.",
          question: "Jika setengah bagian balok masuk ke dalam air, maka volume air yang keluar adalah...",
          options: [
            "Sama dengan seluruh volume balok",
            "Sama dengan setengah volume balok",
            "Lebih besar dari volume balok",
            "Lebih kecil dari setengah volume",
            "Tidak ada air yang keluar"
          ],
          answer: "Sama dengan setengah volume balok"
        },
        {
          id: 27,
          type: "multiple-choice",
          category: "C2 - MEMAHAMI",
          stimulus: "Seorang siswa mengamati bahwa setiap kali benda dimasukkan ke air, air akan meluap. Ia menyadari bahwa volume air yang tumpah identik dengan volume benda yang berada di bawah permukaan air.",
          question: "Mengapa volume air yang keluar bisa sama dengan volume benda yang tercelup?",
          options: [
            "Karena air menyesuaikan ruang yang ditempati benda",
            "Karena massa air bertambah",
            "Karena gaya apung hilang",
            "Karena benda menyerap air",
            "Karena tekanan air berkurang"
          ],
          answer: "Karena air menyesuaikan ruang yang ditempati benda"
        },
        {
          id: 28,
          type: "multiple-choice",
          category: "C4 - MENGANALISIS",
          stimulus: "Dalam sebuah diskusi kelompok, seorang siswa berpendapat: \"Jika benda dimasukkan lebih dalam ke dalam air (selama belum tenggelam seluruhnya), maka volume air yang keluar akan tetap sama karena bendanya sama.\"",
          question: "Bagaimana pendapat anda terhadap pernyataan siswa tersebut?",
          options: [
            "Benar, karena massa benda tidak berubah",
            "Salah, karena semakin banyak bagian benda yang masuk, semakin banyak air yang keluar",
            "Benar, jika benda tersebut adalah benda kecil",
            "Salah, karena massa jenis air akan meningkat",
            "Salah, karena tekanan udara menghambat air keluar"
          ],
          answer: "Salah, karena semakin banyak bagian benda yang masuk, semakin banyak air yang keluar"
        },
        {
          id: 29,
          type: "multiple-choice",
          category: "C5 - MENGEVALUASI",
          stimulus: "Siti menimbang air yang tumpah saat ia memasukkan batu ke wadah penuh. Ia juga merasakan batu lebih ringan saat diangkat di dalam air. Siti menyimpulkan bahwa berat air yang tumpah tersebut sama dengan besar gaya angkat ke atas yang dialami benda.",
          question: "Bagaimana evaluasi anda terhadap kesimpulan Siti?",
          options: [
            "Salah, berat air tidak ada hubungannya dengan gaya angkat",
            "Benar, karena gaya apung sebanding dengan berat fluida yang dipindahkan",
            "Tidak dapat ditentukan tanpa massa jenis benda",
            "Hanya benar jika benda tersebut terapung",
            "Salah, gaya angkat hanya dipengaruhi oleh kedalaman air"
          ],
          answer: "Benar, karena gaya apung sebanding dengan berat fluida yang dipindahkan"
        },
        {
          id: 30,
          type: "multiple-choice",
          category: "C6 - MENCIPTAKAN",
          stimulus: "Anda diminta membuktikan Hukum Archimedes secara mandiri dengan alat sederhana di rumah: gelas, air, wadah penampung, dan timbangan digital.",
          question: "Langkah kreasi apa yang paling tepat untuk membuktikan besarnya gaya apung?",
          options: [
            "Mengukur panjang dan lebar benda saja",
            "Menimbang berat air yang tumpah dan membandingkannya dengan selisih berat benda di udara dan di air",
            "Hanya mengamati warna air saat benda dimasukkan",
            "Mengukur suhu air sebelum dan sesudah benda dimasukkan",
            "Menghitung kecepatan benda saat jatuh ke dalam air"
          ],
          answer: "Menimbang berat air yang tumpah dan membandingkannya dengan selisih berat benda di udara dan di air"
        }
      ]
    }
  ]
};
