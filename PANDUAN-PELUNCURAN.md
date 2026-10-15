# Panduan Peluncuran & Penjualan — Bocor Halus App

Dokumen ini memuat panduan lengkap peluncuran web app **Bocor Halus** di subdomain `bocorhalus.soradev.id`, pengaturan produk di Lynk.id / Mayar, daftar 25 kode lisensi siap pakai, serta template konten TikTok.

---

## 1. Menghubungkan Domain ke Cloudflare Pages (Rekomendasi Utama)

Cloudflare Pages adalah pilihan terbaik untuk project komersil ini karena:
- **100% Gratis & Legal untuk Komersil** (tanpa batasan non-komersial seperti akun hobby Vercel).
- **Unlimited Bandwidth & Anti Down:** Jika video TikTok viral dan diakses puluhan ribu orang, server tidak akan kena limit kuota.
- **CDN Edge Indonesia (Jakarta):** Loading super instan di HP pengguna (Telkomsel, Indosat, XL, WiFi).
- **Setup DNS 1-Klik:** Terhubung langsung dengan domain `soradev.id` di Cloudflare.

### Langkah Deploy ke Cloudflare Pages:
1. **Push Repository ke GitHub** (`andrew-sora/bocor-halus-app`).
2. **Buka Dashboard Cloudflare** -> Masuk ke menu **Workers & Pages** -> **Create application** -> Tab **Pages** -> **Connect to Git**.
3. **Pilih Repository `bocor-halus-app`**:
   - **Project name:** `bocorhalus` (atau `bocor-halus`)
   - **Production branch:** `master`
   - **Framework preset:** `None`
   - **Build command:** `npm run build:web`
   - **Build output directory:** `dist`
4. **Hubungkan Subdomain `bocorhalus.soradev.id`**:
   - Setelah deployment pertama selesai, buka tab **Custom domains** di project Pages Anda.
   - Klik **Set up a custom domain** -> Masukkan `bocorhalus.soradev.id`.
   - Karena DNS `soradev.id` sudah ada di Cloudflare Anda, Cloudflare akan otomatis membuat CNAME record dan mengaktifkan sertifikat SSL secara instan tanpa perlu setting manual!
5. **Dukungan Routing SPA:**
   File `public/_redirects` (`/* /index.html 200`) sudah terpasang otomatis sehingga saat pengguna membuka link langsung atau me-refresh halaman (misal: `/rekap` atau `/pengaturan`), halaman tidak akan 404.

---

## 2. Pengaturan Penjualan di Lynk.id / Mayar

### Detail Produk:
- **Nama Produk:** Bocor Halus — Aplikasi Pencatat Keuangan Rumah Tangga (Akses Selamanya)
- **Kategori:** Produk Digital / Software
- **Tipe Pembayaran:** Sekali Bayar (Pay Once, Own Forever)
- **Harga:** **Rp 15.000**
- **Metode Pembayaran:** QRIS (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, Dana)

### Copywriting Deskripsi Produk (Bisa langsung di-copy):
```text
Bunda sering merasa uang belanja cepat habis tapi bingung habis ke mana?
Itu namanya "BOCOR HALUS" — pengeluaran kecil Rp 5.000, Rp 15.000, jajan receh, atau ongkir yang tak tercatat, tapi pas akhir bulan totalnya bikin kaget.

Bocor Halus hadir sebagai pencatat keuangan rumah tangga yang anti ribet:
- Tanpa akun & tanpa login (buka langsung pakai).
- Ketik langsung hitungan belanjaan pasar (misal: 15.000 + 35.000 + 8.000) tanpa buka kalkulator terpisah.
- Tahu persis "Sisa Jatah" belanja harian secara real-time.
- 100% Privat: Data hanya tersimpan di HP Anda, tidak ada pihak lain yang bisa mengintip.
- Bisa dipasang di layar utama iPhone & Android layaknya aplikasi biasa (tanpa unduh APK yang mencurigakan).
- Beli sekali Rp 15.000, miliki selamanya tanpa biaya langganan bulanan.

Setelah pembayaran berhasil, Anda akan otomatis mendapatkan link web dan 1 KODE LISENSI AKTIVASI untuk dimasukkan ke aplikasi.
```

---

## 3. Daftar 25 Kode Lisensi Siap Pakai (Batch 1)

Berikut adalah 25 kode lisensi unik yang telah diverifikasi secara matematis oleh algoritma sistem. Anda bisa langsung memasukkan daftar ini ke inventori digital Lynk.id/Mayar (1 kode per transaksi):

```text
BH-46LC-P9HY
BH-PSKK-30GD
BH-3L8C-DP8Y
BH-H9YF-Q5PS
BH-7Y8R-5FD5
BH-18JZ-NN8F
BH-T4NE-XQGH
BH-T2ED-BNRX
BH-SPWK-63QK
BH-ZPVF-BP95
BH-E5PD-6J6E
BH-5MJL-H73J
BH-90MD-K1UD
BH-2AF4-0XQ4
BH-SND8-3GKY
BH-8WAL-S96S
BH-A3FF-RAB3
BH-NUZW-ZS98
BH-FABL-UA18
BH-0WJX-YY2T
BH-EXPQ-Y2XB
BH-HLRT-7N49
BH-Z7UX-BGQN
BH-EBQB-5XSU
BH-AYAZ-NWL0
```

> **Catatan Pengujian Tim Internal (Master Key Bypass):**  
> Untuk tim developer atau pengujian review pribadi, Anda bisa menggunakan master key berikut:  
> - `BH-VIP-2026`  
> - `BHFOUNDER`  

---

## 4. Template Konten & Hook Promosi TikTok

### Video Singkat (VT) — Hook Masalah Belanjaan
- **Visual Awal (0-3 detik):** Tunjukkan tumpukan struk Indomaret / sayur pasar atau dompet kosong sambil ekspresi bingung.
- **Hook Suara/Teks:**  
  *"Gaji suami 5 juta, baru tanggal 15 kok saldo tinggal 400 ribu? Ternyata kena bocor halus..."*
- **Transisi (3-15 detik):** Rekam layar HP Anda membuka Bocor Halus. Tunjukkan saat mengetik:  
  `15.000 + 40.000 + 12.000` -> tekan simpan.  
  Tunjukkan kartu "Bocor Halus (< 50k)" yang memperlihatkan jajan kecil totalnya sudah tembus Rp 650.000.
- **CTA (15-25 detik):**  
  *"Aplikasinya enteng banget, gak perlu daftar akun, gak ada langganan bulanan. Cuma 15 ribu sekali beli seumur hidup. Link ada di bio ya Bun."*

### Skrip TikTok Live (Saat Mendemokan di Kamera)
1. **Buka Live dengan Masalah Nyata:**  
   *"Siapa di sini yang suka heran uang belanja lari ke mana? Nih Bun, aku kenalin aplikasi buatan anak bangsa namanya Bocor Halus..."*
2. **Tunjukkan Kalkulator Langsungnya:**  
   *"Bunda kalau belanja di tukang sayur kan gak cuma beli 1 barang. Ada bayam 5 ribu, tempe 8 ribu, ayam 35 ribu. Di aplikasi lain Bunda harus buka kalkulator dulu kan? Di sini langsung ketik '5000+8000+35000', langsung kehitung otomatis."*
3. **Tunjukkan Fitur Keamanan & Privasi:**  
   *"Tenang aja Bun, gak ada login-loginan, gak minta nomor HP, gak minta email. Datanya aman di HP Bunda sendiri, bahkan ada PIN kuncinya biar gak diutak-atik anak."*
4. **Dorong Pembelian:**  
   *"Harganya cuma 15 ribu, setara harga es teh manis jumbo dua gelas, tapi bisa dipakai selamanya. Klik link di bio, bayar pakai QRIS, kode langsung masuk!"*
