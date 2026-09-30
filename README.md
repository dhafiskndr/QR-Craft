# QR-Craft — Sistem QR-Code Generator Multifungsi & Interaktif

Aplikasi web modern generator QR-Code profesional dengan sistem visual canggih, real-time live preview, dukungan cloud upload, dan kustomisasi tanpa batas.

---

## 🌟 Fitur Utama

1. **6 Tipe Konten Multifungsi**:
   - **Link / URL**: Auto-prepend `https://`, status validasi link aktif, dan fitur URL shortener opsional (`/s/:code`).
   - **File & Dokumen**: Drag-and-drop file upload dengan live progress bar (PDF, Word, Excel, PPT, ZIP hingga 20MB) yang otomatis menghasilkan tautan unduhan publik aman (`/f/:id`).
   - **Foto & Gambar**: Upload gambar instan dengan thumbnail preview responsif yang mengarah ke laman Galeri Viewer responsif (`/img/:id`).
   - **Teks Bebas / Catatan**: Textarea auto-resize dengan penghitung karakter dan jumlah kata real-time.
   - **Wi-Fi Access**: Konfigurasi SSID, kata sandi (dengan tombol sembunyikan/lihat), jenis enkripsi (WPA/WPA2/WEP/Open), dan opsi jaringan tersembunyi yang langsung menghubungkan smartphone saat dipindai.
   - **Kontak Digital (vCard 3.0)**: Nama, No. WhatsApp, telepon, email, instansi, jabatan, dan catatan memo yang langsung memicu pop-up "Simpan ke Kontak" pada iOS dan Android.

2. **Kustomisasi QR Real-Time**:
   - **Warna & Linear Gradient**: Pilihan warna Foreground solid atau Gradien Linear (0°, 45°, 90°, 135°), warna latar belakang, dan mode latar transparan.
   - **Bentuk Pola & Sudut**: Pilihan titik pola (Rounded halus, dots bulat, classy, classy-rounded, square standar, extra-rounded), bingkai sudut (lengkung, bulat, kotak), dan titik sudut.
   - **Sisipkan Logo di Tengah**: Presets logo QR-Craft, Google Drive, PDF, Link, WhatsApp, Wi-Fi, serta dukungan upload logo kustom sendiri dengan pengaturan ukuran dan margin slider.
   - **Format Unduhan Multi-Resolusi**:
     - Unduh PNG Resolusi Tinggi (1000px, 2000px Ultra HD, 4000px Master).
     - Unduh SVG Vektor lossless.
     - Cetak & Ekspor PDF siap cetak dengan kop branding resmi.
   - **Simulasi Scan Smartphone**: Modal interaktif dengan viewfinder kamera beranimasi laser scan yang mendeteksi jenis data QR dan memberikan tombol aksi langsung (buka link, unduh file, salin sandi Wi-Fi, unduh kontak vCard).

3. **Bahasa Desain & UI/UX**:
   - **Modern Design Tokens**: Royal Blue (`#2563eb`, `#1d4ed8`), deep navy dark mode (`#070a13`), soft light mode (`#f8fafc`).
   - **Glassmorphism Header**: Sticky navbar dengan logo badge QR-Craft, sliding indicator aktif, dan theme toggle Dark/Light mode.
   - **Hero Modern**: Radial glow biru, status pulsing green dot badge, dan teks gradien.
   - **Floating Preview Card**: Preview 3D dengan status chip "★ Siap Diunduh" dan sinkronisasi real-time tanpa reload.

---

## 🚀 Cara Menjalankan

```bash
# Masuk ke direktori
cd d:\QR-code

# Jalankan server
npm start
# atau
npm run dev
```

Buka peramban di: `http://localhost:3000`

---

## 📂 Struktur Proyek

```
d:\QR-code\
├── public/
│   ├── assets/           # Logo QR-Craft, icon SVG presets
│   ├── css/
│   │   ├── style.css     # Design tokens & styling utama
│   │   └── viewer.css    # Styling halaman publik /f/:id dan /img/:id
│   ├── js/
│   │   └── app.js        # Logika reaktivitas, QRCodeStyling, uploader & simulator
│   ├── vendor/           # qr-code-styling & jspdf lokal offline-ready
│   ├── favicon.ico
│   └── index.html        # Antarmuka studio QR-Craft
├── storage/
│   ├── database.json     # Metadata storage & short links
│   ├── uploads/          # Berkas dokumen publik (maks 20MB)
│   └── images/           # Berkas gambar galeri (maks 20MB)
├── server.js             # Express.js REST API & static server
├── package.json
└── README.md
```
