# Checklist Perbaikan & Roadmap Fitur — Bocor Halus App

> **Dokumen Evaluasi & Rencana Pengembangan**  
> Dibuat berdasarkan riset pengalaman pengguna (Ibu Rumah Tangga Muda) untuk meningkatkan kenyamanan, kegunaan, dan kejelasan aplikasi pencatat keuangan minimalis *Bocor Halus*.

---

## 🎯 Ringkasan Persona Pengguna
- **Persona:** Ibu Rumah Tangga Muda (24–32 tahun), mengelola anggaran belanja harian/bulanan keluarga.
- **Karakteristik:** Sibuk mengurus anak dan rumah tangga, anti ribet, tidak suka aplikasi dengan istilah akuntansi rumit (debit-kredit), dan mencari cara cepat mencatat belanjaan harian tanpa kalkulator terpisah.
- **Poin Kuat Aplikasi Saat Ini:**
  - Desain estetik, tenang, dan tidak bikin stres (*Earth tone palette*).
  - Tanpa perlu daftar akun/login/OTP (langsung pakai).
  - Fitur evaluator matematika langsung di nominal (`15.000 + 35.000`).
  - Konsep "Sisa Jatah" dan peringatan "Bocor Halus" (< Rp 50.000) yang sangat menyentuh kebiasaan harian.

---

## 📋 Action Plan & Checklist Pengembangan

### 🔴 Prioritas 1: High Impact & Quick Wins (Pengalaman Pengguna Baru)

- [x] **1. Onboarding / Setup Jatah Awal (First-Time User Experience)** *(Selesai)*
  - [x] **Masalah:** Pengguna baru langsung dihadapkan pada angka default Rp 3.000.000 tanpa penjelasan dari mana angka tersebut berasal.
  - [x] **Solusi:** Buat modal sambutan saat pertama kali aplikasi dibuka jika budget limit belum pernah disimpan:
    - Sapaan hangat: *"Halo Bunda! Berapa anggaran/jatah belanja rumah tangga bulan ini?"*
    - Input nominal dengan format Rupiah otomatis.
    - Tombol cepat (*Preset*): `Rp 2.000.000`, `Rp 3.000.000`, `Rp 5.000.000` atau ketik bebas.
    - Tombol *[Mulai Catat]*.
  - [x] **File Terkait:** `components/BudgetOnboardingModal.tsx`, `app/(tabs)/index.tsx`, `lib/db.ts`.

- [x] **2. Interaktivitas Kartu "Bocor Halus" (Filter Transaksi Mikro)** *(Selesai)*
  - [x] **Masalah:** Di dashboard ada info *"Bulan ini ada X transaksi kecil (< Rp 50k)"*, namun kartu tersebut tidak bisa di-tap, membuat pengguna penasaran transaksi apa saja yang masuk.
  - [x] **Solusi:**
    - Jadikan kartu tersebut dapat di-klik (`TouchableOpacity`).
    - Buka modal daftar transaksi atau arahkan ke tampilan filter khusus transaksi `< Rp 50.000` bulan berjalan.
    - Tampilkan ringkasan total uang yang keluar untuk belanjaan kecil tersebut.
  - [x] **File Terkait:** `components/MicroExpensesModal.tsx`, `components/TotalCard.tsx`, `app/(tabs)/index.tsx`, `lib/db.ts`.

- [x] **3. Ekspansi & Kustomisasi Kategori Belanja IRT** *(Selesai)*
  - [x] **Masalah:** Saat ini hanya ada 6 kategori (*Dapur, Jajan, Anak, Tagihan, Transport, Lain-lain*). Banyak pengeluaran penting IRT yang akhirnya terpaksa masuk ke "Lain-lain".
  - [x] **Solusi:**
    - Tambahkan kategori esensial bawaan:
      - 💊 **Kesehatan & Obat** (Dokter, imunisasi, vitamin, obat)
      - 💄 **Kebutuhan Ibu** (Skincare, perawatan diri)
      - 🎁 **Sedekah & Sosial** (Arisan, kondangan, sedekah)
      - 📱 **Pulsa & Paket Data**
    - *(Fase 2)* Tambahkan opsi `[+ Tambah Kategori Kustom]` di menu Pengaturan.
  - [x] **File Terkait:** `constants/Colors.ts`, `app/tambah.tsx`, `components/ExpenseRow.tsx`.

---

### 🟡 Prioritas 2: Medium (Penyempurnaan Fitur & Edukasi)

- [x] **4. Penyederhanaan Bahasa & Edukasi Cadangkan Data (Backup)** *(Selesai)*
  - [x] **Masalah:** Istilah "Ekspor JSON" terdengar teknis dan menakutkan bagi pengguna non-developer, serta timbul kekhawatiran data hilang jika ganti HP.
  - [x] **Solusi:**
    - Ubah label tombol menjadi: *"Simpan Cadangan Data"* / *"Kirim Cadangan ke WhatsApp / Email"*.
    - Tambahkan banner penenang (*Privacy & Security Reassurance*):
      - 🛡️ *"Data Anda tersimpan 100% aman di HP ini. Tidak ada pihak lain yang bisa melihat selain Anda."*
    - Berikan panduan singkat 1 kalimat cara memindahkan data saat ganti HP.
  - [x] **File Terkait:** `app/(tabs)/pengaturan.tsx`, `lib/backup.ts`.

- [x] **5. Dukungan "Uang Masuk / Tambahan Jatah" Sederhana** *(Selesai)*
  - [x] **Masalah:** Jatah belanja sering bertambah di tengah bulan (transferan tambahan suami, cair arisan, dsb). Saat ini limit budget bersifat statis per bulan.
  - [x] **Solusi:**
    - Tambahkan tombol kecil di samping kartu jatah: `[+ Tambah Jatah Bulan Ini]`.
    - Pengguna bisa memasukkan nominal uang masuk tambahan tanpa mengubah master budget default di pengaturan.
  - [x] **File Terkait:** `components/AddExtraBudgetModal.tsx`, `components/TotalCard.tsx`, `app/(tabs)/index.tsx`, `lib/db.ts`.

---

### 🟢 Prioritas 3: Nice-to-Have (Pemanis Tampilan & Kenyamanan Tambahan)

- [x] **6. Grafik Komposisi Kategori Sederhana (Category Breakdown)** *(Selesai)*
  - [x] Di tab **Rekap** (detail bulan), ditambahkan kartu komposisi pengeluaran dengan multi-progress bar visual, persentase pengeluaran, serta breakdown per kategori.
  - [x] **File Terkait:** `app/rekap/[ym].tsx`.

- [x] **7. Fitur Kunci Aplikasi (App Lock / PIN Sederhana)** *(Selesai)*
  - [x] Opsi mengunci aplikasi dengan PIN 4 angka rahasia agar catatan belanja tidak sengaja diutak-atik saat HP dimainkan anak, lengkap dengan keypad, indikator titik, dan pengaturan aktivasi/penonaktifan.
  - [x] **File Terkait:** `components/PinLockScreen.tsx`, `components/SetPinModal.tsx`, `app/_layout.tsx`, `app/(tabs)/pengaturan.tsx`, `lib/db.ts`.

---

## 🚀 Roadmap Peluncuran & Monetisasi (Go-to-Market Strategy)

### 1. Model Bisnis & Penetapan Harga
- **Model:** *Pay Once, Own Forever* (Sekali Beli untuk Selamanya).
- **Harga:** **Rp 15.000** (Harga psikologis *impulse buy* tanpa ragu, tanpa beban langganan bulanan).
- **Target Audiens:** Ibu rumah tangga muda, wanita karir, dan pekerja mandiri yang mengelola anggaran belanja harian keluarga.

### 2. Jalur Distribusi: PWA di Subdomain Resmi (Anti-Phishing & Terpercaya)
- **Subdomain:** `https://bocorhalus.soradev.id` (Memanfaatkan infrastruktur Soradev Studio & hosting Vercel).
- **Format:** Progressive Web App (PWA) — fitur *"Tambahkan ke Layar Utama" (Add to Home Screen)*.
- **Keunggulan:**
  - 100% aman dan kredibel (Bebas dari stigma negatif/ketakutan terhadap file `.apk` penipuan).
  - Kompatibel untuk pengguna **Android maupun iPhone (iOS)**.
  - Tetap berfungsi secara luring (*offline-first*), cepat, dan data tersimpan di perangkat pengguna.

### 3. Saluran Penjualan, Pembayaran & Proteksi Lisensi
- Menggunakan platform instan tanpa biaya registrasi awal (**Lynk.id** atau **Mayar.id**).
- Metode pembayaran otomatis: **QRIS, GoPay, ShopeePay, OVO, dan Transfer Bank**.
- **Sistem Proteksi Kode Lisensi (Anti-Pembajakan / Anti-Share):**
  - Pembeli mendapatkan 1 Kode Lisensi Unik (contoh: `BH-XXXX`) setelah transaksi sukses.
  - Saat membuka `bocorhalus.soradev.id`, pengguna cukup memasukkan kode lisensi sekali.
  - **Batas Kuota Perangkat:** 1 kode lisensi dapat digunakan maksimal di 2–3 perangkat pribadi pembeli (misal HP utama & HP kedua), mencegah penyebaran link ke grup publik/arisan tanpa izin.

### 4. Strategi Pemasaran (Live TikTok & Video Pendek)
- **Konten Relatable:** Menyorot fenomena boncos belanja harian dan jajan receh yang tak terasa (*bocor halus*).
- **Demo Visual Utama:** Mengetik hitungan belanjaan pasar secara langsung (`15.000 + 35.000 + 8.000`) tanpa kalkulator terpisah dan memperlihatkan pergerakan indikator *Sisa Jatah*.
- **Call-to-Action (CTA):** Mengarahkan penonton ke link di bio untuk mendapatkan akses seumur hidup hanya dengan Rp 15.000.

### 5. Fase Lanjutan: Rilis Google Play Store
- Setelah modal terkumpul dari penjualan tahap awal di TikTok, aplikasi akan didaftarkan ke Google Play Console ($25) untuk menjangkau pasar yang lebih luas secara resmi.

---

## 📌 Catatan Pelaksanaan (Progress Log)
- **Fitur UX & IRT (Prioritas 1, 2, 3):** Selesai 100% (Onboarding Modal, Interaktivitas Bocor Halus, 10 Kategori Belanja, Empathetic Backup UI, Tambah Jatah Bulanan, Rekap Breakdown, PIN App Lock).
- **Pembersihan AI Slop:** Bersih 100% (semua sparkle, bunga pink, dan badge emoji alay dihapus).
- **Distribusi PWA & Web Vercel:** Selesai 100% (`+html.tsx` Apple meta tags, `public/manifest.json`, `vercel.json`, responsif mobile vs desktop frame, dan `PwaInstallBanner`).
- **Sistem Lisensi & Proteksi Ringan:** Selesai 100% (`lib/license.ts`, `components/LicenseGateModal.tsx`, unit tests).
- **Kesiapan Ekspor:** Build web `npm run build:web` berhasil diekspor ke `dist/` (10 static routes, 1.4MB bundle).
- **Panduan Peluncuran:** Tersedia di [PANDUAN-PELUNCURAN.md](file:///e:/Bocor%20Halus%20App/PANDUAN-PELUNCURAN.md) lengkap dengan 25 kode lisensi siap pakai dan materi promosi TikTok.
- **Kualitas Kode:** 7 test suites lulus (66 tests passed), 0 TypeScript error, 0 ESLint error.
