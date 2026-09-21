# BRIEF: Aplikasi Pencatat Pengeluaran (Android + iOS)

> Dokumen ini adalah sumber kebenaran tunggal untuk proyek. Baca seluruhnya sebelum menulis kode.
> Kerjakan **per fase**. Setelah tiap fase selesai: jalankan `npx tsc --noEmit`, `npx eslint .`, dan `npm test`, ringkas hasilnya, lalu **berhenti dan tunggu konfirmasi** sebelum lanjut ke fase berikutnya.
> Bagian bertanda **[MANUAL]** dikerjakan manusia (Andrew), bukan agent. Jangan mencoba mengerjakannya, cukup tulis instruksi langkahnya di README.

---

## 0. Konteks

Aplikasi pencatat pengeluaran pribadi untuk seorang guru perempuan yang merantau. Pengguna non-teknis, jadi antarmuka harus sederhana, huruf besar, dan tidak ada fitur yang tidak diminta.

**Empat permintaan pengguna (wajib, ini acceptance utama):**

1. Input nominal bisa berupa ekspresi kalkulator, contoh `17.000+75.000` (belanja pasar + bulanan) langsung dihitung otomatis, tanpa membuka aplikasi kalkulator lain.
2. Ada rekap setiap bulan selama 12 bulan. **Tanpa diagram atau grafik.** Cukup tabel/daftar.
3. Setiap pengeluaran punya **tanggal pasti**.
4. **Dashboard paling atas menampilkan total pengeluaran.** Seluruh antarmuka **berbahasa Indonesia**.

**Target platform:** Android dan iOS (pengguna punya keduanya dan belum tahu mana yang dipakai). Kode harus platform-agnostic. Jangan pakai API khusus satu platform tanpa fallback.

**Di luar cakupan (JANGAN dibuat):** grafik/chart, kategori, akun/login, sinkronisasi cloud, backend, notifikasi, multi-mata-uang, dark mode, analytics, iklan. Tambahkan hanya jika diminta eksplisit nanti.

---

## 1. Stack dan aturan teknis

| Hal | Keputusan |
|---|---|
| Framework | Expo (SDK stabil terbaru), React Native, TypeScript `strict: true` |
| Routing | Expo Router (file-based), tab navigation |
| Storage | `expo-sqlite` (API async terbaru: `openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`). Cek dokumentasi untuk versi SDK yang terpasang |
| Styling | NativeWind (Tailwind untuk RN) |
| ID | `expo-crypto` → `randomUUID()` |
| Tanggal | `@react-native-community/datetimepicker` |
| Backup | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| Test | `jest-expo` + `@testing-library/react-native` untuk komponen kritis |
| Build | EAS Build (cloud). **Tidak memakai Android Studio maupun Xcode** |
| Bahasa UI | Indonesia. Identifier kode, nama file, dan komentar teknis dalam Bahasa Inggris |

**Aturan keras:**

- **Dilarang** `eval`, `new Function`, atau library eval-string. Evaluasi ekspresi memakai parser di bagian 3.1.
- **Tidak ada permintaan jaringan.** Aplikasi 100% offline dan lokal. Tidak ada SDK pihak ketiga yang mengirim data.
- **Tidak ada izin (permission) tambahan** di Android/iOS selain yang dibutuhkan otomatis. Jangan tambahkan izin kamera, lokasi, kontak, dsb.
- Semua query SQL memakai **parameter binding** (`?`), bukan string concatenation.
- **Jangan pakai `toISOString()` untuk tanggal transaksi.** Itu bergeser ke UTC (Indonesia UTC+7), sehingga catatan dini hari bisa jatuh ke hari sebelumnya. Pakai helper `toLocalDateString` (bagian 3.2).
- Uang disimpan sebagai **integer rupiah**. Tanpa float, tanpa desimal.
- Jangan matikan backup bawaan OS (Android Auto Backup, iCloud). Biarkan default.

**Struktur folder:**

```
app/
  _layout.tsx              # root: init DB, splash sampai DB siap
  (tabs)/
    _layout.tsx            # 3 tab: Beranda, Rekap, Pengaturan
    index.tsx              # Beranda: dashboard total + daftar transaksi
    rekap.tsx              # Rekap 12 bulan
    pengaturan.tsx         # Backup / restore / tentang
  tambah.tsx               # modal: tambah / edit pengeluaran (?id=...)
  rekap/[ym].tsx           # detail transaksi satu bulan (ym = 2026-09)
components/
  OperatorBar.tsx          # baris tombol + − × ÷ ( )
  ExpenseRow.tsx
  TotalCard.tsx
  MoneyText.tsx
lib/
  evalExpr.ts
  evalExpr.test.ts
  date.ts
  date.test.ts
  format.ts
  format.test.ts
  db.ts
  db.test.ts               # jika memungkinkan dengan mock; jika tidak, uji fungsi murni saja
  backup.ts
constants/
  strings.ts               # semua teks UI Indonesia di satu tempat
```

---

## 2. Model data

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id          TEXT PRIMARY KEY,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  expression  TEXT NOT NULL,          -- ekspresi asli, mis. "17.000+75.000"
  note        TEXT NOT NULL DEFAULT '',
  spent_at    TEXT NOT NULL,          -- 'YYYY-MM-DD' (tanggal lokal)
  created_at  TEXT NOT NULL           -- ISO timestamp, hanya untuk audit
);
CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses(spent_at);
PRAGMA user_version = 1;              -- siapkan mekanisme migrasi berbasis user_version
```

```ts
export type Expense = {
  id: string;
  amount: number;       // integer rupiah > 0
  expression: string;
  note: string;
  spentAt: string;      // 'YYYY-MM-DD'
  createdAt: string;
};
```

---

## 3. Fase 1: Logika inti (tanpa UI)

Selesaikan dan uji semua modul `lib/` dulu. Fase ini tidak boleh menyentuh layar.

### 3.1 `lib/evalExpr.ts`

Format angka Indonesia: **titik = pemisah ribuan**, **koma = desimal**. Operator: `+ - * /`, alias `x`/`×` untuk kali dan `:`/`÷` untuk bagi, kurung `( )`. Spasi diabaikan. Hasil dibulatkan ke integer. Input tidak valid atau hasil tak hingga mengembalikan `null`.

Gunakan implementasi ini (boleh dirapikan, perilaku tidak boleh berubah):

```ts
export function evalExpr(input: string): number | null {
  const s = input
    .replace(/\s/g, "")
    .replace(/[x×]/gi, "*")
    .replace(/[÷:]/g, "/");
  if (!s || !/^[\d.,+\-*/()]+$/.test(s)) return null;

  const tokens = s.match(/\d+(?:\.\d{3})*(?:,\d+)?|[+\-*/()]/g);
  if (!tokens || tokens.join("") !== s) return null; // ada karakter yang lolos tokenisasi

  let i = 0;
  const toNum = (t: string) => parseFloat(t.replace(/\./g, "").replace(",", "."));

  const expr = (): number => {
    let v = term();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };
  const factor = (): number => {
    const t = tokens[i++];
    if (t === "-") return -factor();
    if (t === "(") {
      const v = expr();
      if (tokens[i++] !== ")") throw new Error("paren");
      return v;
    }
    if (!t || !/^\d/.test(t)) throw new Error("token");
    return toNum(t);
  };

  try {
    const v = expr();
    return i === tokens.length && Number.isFinite(v) ? Math.round(v) : null;
  } catch {
    return null;
  }
}
```

**Test wajib (`evalExpr.test.ts`):**

| Input | Output |
|---|---|
| `"17.000+75.000"` | `92000` |
| `"17.000 + 75.000"` | `92000` |
| `"2x15.000"` | `30000` |
| `"2×15.000"` | `30000` |
| `"(5.000+3.000)*2"` | `16000` |
| `"100.000/3"` | `33333` |
| `"1.000.000"` | `1000000` |
| `"1,5x10.000"` | `15000` |
| `"12+34"` | `46` |
| `"-5.000+2.000"` | `-3000` |
| `"10.000/0"` | `null` |
| `"abc"` | `null` |
| `""` | `null` |
| `"1.5"` | `null` (titik bukan ribuan valid) |
| `"1.00"` | `null` |
| `"5.000+"` | `null` |
| `"((5.000)"` | `null` |
| `"(5.000)(3.000)"` | `null` |
| `"5.000++3.000"` | `null` |

Catatan: `evalExpr` boleh mengembalikan angka negatif. **Validasi `amount > 0` dilakukan di form**, bukan di parser.

### 3.2 `lib/date.ts`

```ts
export const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const todayLocal = () => toLocalDateString(new Date());
export const parseLocalDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const currentYearMonth = () => todayLocal().slice(0, 7); // 'YYYY-MM'
```

Tambah `formatTanggalId(s: string)` → `"Sen, 21 Sep 2026"` (locale `id-ID`), dan `namaBulan(m: number)` → `"Januari"…"Desember"`.

**Test:** tanggal `2026-01-01 00:30` waktu lokal harus tetap `"2026-01-01"` (bukan `2025-12-31`). Uji dengan `new Date(2026, 0, 1, 0, 30)`.

### 3.3 `lib/format.ts`

- `formatRupiah(n: number): string` → `"Rp 92.000"` (pakai `Intl.NumberFormat("id-ID")` lalu prefiks `Rp `; jika Intl `id-ID` tidak tersedia di runtime Hermes, buat fallback manual dengan regex ribuan). **Uji di device nyata, jangan hanya di Node.**
- `formatAngkaId(n: number): string` → `"92.000"`.

### 3.4 `lib/db.ts`

API (semua async):

```ts
initDb(): Promise<void>                                   // buat tabel + migrasi via user_version
addExpense(input: {amount; expression; note; spentAt}): Promise<Expense>
updateExpense(id: string, input: {...}): Promise<void>
deleteExpense(id: string): Promise<void>
getExpense(id: string): Promise<Expense | null>
listRecent(limit: number): Promise<Expense[]>             // urut spent_at DESC, created_at DESC
listByMonth(ym: string): Promise<Expense[]>               // ym = 'YYYY-MM', spent_at LIKE 'ym-%'
totalByMonth(ym: string): Promise<number>
totalByYear(year: number): Promise<number>
monthlyTotals(year: number): Promise<{month: number; total: number; count: number}[]> // selalu 12 elemen, bulan kosong = 0
availableYears(): Promise<number[]>                       // tahun yang punya data, plus tahun berjalan
exportAll(): Promise<BackupFile>
importAll(data: BackupFile, mode: "replace" | "merge"): Promise<{added: number; skipped: number}>
```

- `monthlyTotals` memakai `GROUP BY substr(spent_at, 1, 7)` dengan filter tahun, lalu dilengkapi ke 12 bulan di sisi JS.
- `importAll` dalam **satu transaksi**. Validasi setiap baris (tipe, `amount` integer > 0, format tanggal `YYYY-MM-DD`, id string). Baris tidak valid dilewati dan dihitung. Mode `merge` melewati id yang sudah ada.

### 3.5 `lib/backup.ts`

Format file:

```json
{ "app": "catatan-keuangan", "version": 1, "exportedAt": "ISO", "expenses": [ ... ] }
```

Nama file: `catatan-keuangan-YYYY-MM-DD.json`. Export lewat `expo-sharing` (share sheet, sehingga bisa dikirim ke WhatsApp/Drive/Files). Import lewat `expo-document-picker`.

**Kriteria selesai Fase 1:** semua test hijau, `tsc` dan `eslint` bersih, tidak ada file UI yang dibuat selain skeleton kosong.

---

## 4. Fase 2: UI dan layar

### 4.1 Prinsip desain

- Pengguna guru non-teknis. **Huruf minimal 16 pt, angka uang 20 pt ke atas, area sentuh minimal 48×48 dp.**
- Palet hangat dan tenang (mis. latar krem `#FAF7F2`, aksen hijau tua `#2F6F4F`, teks `#1F2933`). Kontras teks memenuhi WCAG AA.
- Satu aksi utama per layar. Tombol utama "Catat Pengeluaran" selalu terlihat di Beranda (FAB atau tombol lebar di bawah).
- Tidak ada grafik, ikon dekoratif berlebihan, atau animasi berat.
- Tangani safe area (notch, home indicator) di kedua platform. Gunakan `react-native-safe-area-context`.
- Semua teks UI diambil dari `constants/strings.ts`.

### 4.2 Beranda (`app/(tabs)/index.tsx`)

**Paling atas: kartu dashboard total** (permintaan #4):

- Judul besar: "Total Pengeluaran Bulan Ini" dengan nominal `Rp …` dan nama bulan/tahun (mis. "September 2026").
- Baris kedua lebih kecil: "Total Tahun Ini: Rp …".

Di bawahnya daftar transaksi terbaru, dikelompokkan per tanggal (header tanggal seperti "Senin, 21 September 2026"). Tiap baris (`ExpenseRow`) menampilkan catatan (atau "Tanpa catatan"), ekspresi asli dalam teks kecil bila mengandung operator, dan nominal. Ketuk baris membuka `tambah?id=…` (edit). Gunakan `FlatList`/`SectionList`.

Empty state: "Belum ada pengeluaran. Ketuk *Catat Pengeluaran* untuk mulai."

Data dimuat ulang setiap layar mendapat fokus (`useFocusEffect`).

### 4.3 Form tambah / edit (`app/tambah.tsx`, tampil sebagai modal)

Field:

1. **Nominal** (permintaan #1): `TextInput` dengan `keyboardType="default"` (bukan numerik, karena keyboard numerik tidak punya `+` di banyak perangkat), `autoCorrect={false}`, `autoCapitalize="none"`. Di bawah input tampil **live preview**: `= Rp 92.000` (hijau) bila valid, atau "Ekspresi belum lengkap" (abu-abu) bila tidak valid, tanpa error mengganggu saat masih mengetik.
2. **`OperatorBar`**: baris tombol besar `+  −  ×  ÷  (  )  ⌫` yang menyisipkan karakter **di posisi kursor** (lacak `selection` dari `onSelectionChange`). `−` menyisipkan `-`, `×` menyisipkan `*`, `÷` menyisipkan `/`. Baris ini harus tetap terlihat saat keyboard terbuka (`KeyboardAvoidingView`, `behavior` berbeda untuk iOS dan Android; uji keduanya).
3. **Tanggal** (permintaan #3): wajib, default hari ini. Tampilkan sebagai tombol berisi `formatTanggalId(...)`. Ketuk membuka date picker native. Simpan sebagai `YYYY-MM-DD` lokal via `toLocalDateString`. Tidak boleh tanggal kosong.
4. **Catatan**: opsional, satu baris, contoh placeholder "Mis. jajan pasar + bulanan". Maksimal 200 karakter.

Tombol **Simpan** aktif hanya bila `evalExpr(input)` valid dan hasil > 0. Saat simpan: `amount = hasil`, `expression = teks yang diketik (trim)`. Saat mode edit, `expression` asli dimuat ulang ke input sehingga bisa diubah lagi. Ada tombol **Hapus** (merah, hanya di mode edit) dengan dialog konfirmasi "Hapus pengeluaran ini? Tindakan ini tidak bisa dibatalkan."

Setelah simpan sukses: tutup modal dan kembali ke Beranda. Beranda otomatis segar.

### 4.4 Rekap (`app/(tabs)/rekap.tsx`, permintaan #2)

- Pemilih tahun di atas (panah ‹ 2026 › atau segmented control dari `availableYears()`).
- **Tabel 12 bulan** (Januari sampai Desember), setiap baris: nama bulan, jumlah transaksi, total `Rp …`. Bulan tanpa data tampil `Rp 0` dengan warna redup.
- Baris paling bawah: **Total Setahun**.
- **Tidak ada chart, bar, atau visual grafik apa pun.**
- Ketuk baris bulan membuka `rekap/[ym]` berisi daftar transaksi bulan itu (dikelompokkan per tanggal, bisa diketuk untuk edit) dan total bulan di atas.

### 4.5 Pengaturan (`app/(tabs)/pengaturan.tsx`)

- **Cadangkan Data**: export JSON via share sheet.
- **Pulihkan Data**: pilih file JSON, tampilkan dialog pilihan "Gabungkan dengan data sekarang" vs "Ganti semua data" (yang kedua dengan konfirmasi ekstra), lalu tampilkan hasil ("12 ditambahkan, 0 dilewati").
- Teks bantuan singkat: "Data hanya tersimpan di HP ini. Cadangkan secara berkala agar aman saat ganti HP."
- Versi aplikasi dan tautan kebijakan privasi.

### 4.6 Teks UI (`constants/strings.ts`)

Semua string Indonesia di sini. Contoh minimum: `tabBeranda: "Beranda"`, `tabRekap: "Rekap"`, `tabPengaturan: "Pengaturan"`, `catatPengeluaran: "Catat Pengeluaran"`, `simpan: "Simpan"`, `hapus: "Hapus"`, `batal: "Batal"`, `nominal: "Nominal"`, `tanggal: "Tanggal"`, `catatan: "Catatan"`, `totalBulanIni: "Total Pengeluaran Bulan Ini"`, `totalTahunIni: "Total Tahun Ini"`, `totalSetahun: "Total Setahun"`, `belumAdaData: "Belum ada pengeluaran."`.

**Kriteria selesai Fase 2:**

- [ ] Mengetik `17.000+75.000` menampilkan preview `= Rp 92.000` dan tersimpan sebagai 92000 dengan ekspresi asli
- [ ] Tombol operator menyisipkan karakter di posisi kursor
- [ ] Dashboard total ada di paling atas Beranda
- [ ] Rekap menampilkan 12 bulan, tanpa grafik
- [ ] Setiap transaksi punya tanggal, dan mencatat pukul 00:30 tetap di tanggal yang benar
- [ ] Seluruh teks UI berbahasa Indonesia
- [ ] Berjalan tanpa error di **Expo Go pada Android dan iOS**

---

## 5. Fase 3: QA dan hardening

Jalankan dan laporkan hasilnya. Perbaiki yang gagal.

**Fungsional:** tambah, edit, hapus. Ganti tahun di rekap. Data 0 transaksi. 1.000+ transaksi (seed lewat skrip dev, cek performa scroll dan waktu query). Nominal sangat besar (`999.999.999.999`, harus ditolak atau dibatasi dengan pesan jelas). Nominal 0 atau negatif ditolak. Catatan panjang. Emoji di catatan.

**Tanggal:** akhir bulan (31 Jan), tahun kabisat (29 Feb 2028), pergantian tahun (31 Des ke 1 Jan), pengubahan zona waktu perangkat.

**Backup:** export lalu hapus data lalu import (mode ganti) hasilnya identik. Import file rusak/bukan JSON/versi tak dikenal menampilkan pesan ramah, tanpa crash dan tanpa mengubah data.

**Platform:** uji keyboard + OperatorBar di iOS dan Android, layar kecil (mis. 360×640) dan besar, ukuran font sistem "Besar" (layout tidak pecah), safe area.

**Keamanan:** `grep` seluruh repo untuk `eval(` dan `new Function`. Hasilnya harus nol. Pastikan tidak ada `fetch`/`axios`/XMLHttpRequest. Pastikan `AndroidManifest`/`Info.plist` tidak meminta izin di luar bawaan.

**Kode:** `tsc --noEmit`, `eslint`, dan `npm test` semuanya bersih. Tidak ada `any` tanpa alasan tertulis.

---

## 6. Fase 4: Persiapan rilis (kode dan konfigurasi)

### 6.1 `app.json`

```json
{
  "expo": {
    "name": "Catatan Keuangan",
    "slug": "catatan-keuangan",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "android": {
      "package": "id.soradev.catatankeuangan",
      "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#FAF7F2" }
    },
    "ios": {
      "bundleIdentifier": "id.soradev.catatankeuangan",
      "supportsTablet": false
    },
    "plugins": ["expo-router", "expo-sqlite"]
  }
}
```

Nama aplikasi dan package/bundle ID di atas adalah **placeholder**. Andrew boleh mengganti sebelum build pertama. **Package/bundle ID tidak bisa diubah setelah dipublikasikan.**

### 6.2 `eas.json`

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

### 6.3 Aset

Buat placeholder ikon 1024×1024 (`assets/icon.png`), adaptive icon Android, dan splash sederhana. Andrew akan menggantinya dengan desain final.

### 6.4 Dokumen

- `README.md`: cara menjalankan (`npx expo start`), cara tes, cara build, arsitektur singkat.
- `PRIVACY.md`: draf kebijakan privasi (lihat 8.2).
- Commit rapi per fase dengan pesan yang jelas.

**Kriteria selesai Fase 4:** `npx expo-doctor` bersih, `npx expo export` berhasil.

---

## 7. Fase 5: Build dan distribusi **[MANUAL: Andrew]**

Agent cukup memastikan konfigurasi siap dan menulis langkah ini ke README. Andrew yang menjalankan.

### 7.1 Android: uji ke pengguna (tanpa biaya)

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview      # hasil: APK
```

Kirim APK lewat WhatsApp/Drive. Pengguna mengaktifkan "Install dari sumber tidak dikenal". Minta dipakai sungguhan 1 sampai 2 minggu, catat bug dan permintaan.

### 7.2 iOS: uji ke pengguna

iOS **tidak bisa** menerima APK. Perlu **Apple Developer Program (sekitar US$99 per tahun)**.

```bash
eas build -p ios --profile production
eas submit -p ios                            # ke App Store Connect / TestFlight
```

Distribusi uji lewat **TestFlight** (pengguna menginstal app TestFlight, lalu undangan). Detail tipe tester (internal vs eksternal, perlu Beta App Review atau tidak) cek dokumentasi Apple terbaru.

**Keputusan:** tanyakan dulu ke pengguna HP mana yang akan dipakai sehari-hari. Kalau ternyata hanya Android, biaya Apple tidak perlu dikeluarkan.

### 7.3 Google Play (jika lanjut rilis)

1. Daftar akun Google Play Console (sekitar US$25, sekali bayar). Pilih tipe **Personal** atau **Organization**. Personal akun baru biasanya wajib closed testing dengan minimal sekitar 12 tester selama 14 hari berturut-turut sebelum produksi. Organization (butuh D-U-N-S) biasanya bebas syarat itu. **Cek aturan terbaru di Play Console**, karena ini pernah berubah.
2. `eas build -p android --profile production` menghasilkan **AAB**.
3. **Upload pertama dilakukan manual** di Play Console. Setelah itu bisa `eas submit -p android`.
4. Mulai dari track **Internal testing** (tanpa review), lalu closed testing, lalu produksi.

### 7.4 Aset listing store

| Aset | Spesifikasi |
|---|---|
| Ikon | 512×512 (Play), 1024×1024 (App Store) |
| Feature graphic (Play) | 1024×500 |
| Screenshot | Minimal 2 per platform, dari perangkat nyata/emulator |
| Deskripsi | Bahasa Indonesia, singkat dan jelas |
| Kebijakan privasi | URL publik (mis. halaman di soradev.id) |
| Data safety (Play) / App Privacy (Apple) | Isi "tidak mengumpulkan data" (aplikasi lokal penuh, tanpa jaringan) |

---

## 8. Lampiran

### 8.1 Definisi selesai (Definition of Done) keseluruhan

- Empat permintaan pengguna terpenuhi (bagian 0), diverifikasi manual di Android dan iOS.
- Semua test otomatis hijau, `tsc` dan `eslint` bersih, `expo-doctor` bersih.
- Tidak ada `eval`, tidak ada jaringan, tidak ada izin tambahan.
- Backup dan restore terbukti bolak-balik identik.
- README lengkap dan APK preview berhasil dibuild.

### 8.2 Draf kebijakan privasi (`PRIVACY.md`)

> **Kebijakan Privasi: Catatan Keuangan**
>
> Aplikasi ini menyimpan seluruh data pengeluaran **hanya di perangkat Anda**. Kami tidak mengumpulkan, mengirim, menjual, atau membagikan data apa pun ke server atau pihak ketiga. Aplikasi tidak memerlukan koneksi internet, akun, atau izin khusus.
>
> Data dapat berpindah ke tempat lain hanya jika Anda sendiri menggunakan fitur *Cadangkan Data* dan membagikan berkasnya. Menghapus aplikasi akan menghapus data lokal, kecuali Anda telah membuat cadangan atau memakai pencadangan bawaan sistem (Google/iCloud).
>
> Pertanyaan: [email kontak Soradev]

### 8.3 Instruksi untuk agent

1. Mulai dengan **Fase 0**: inisialisasi proyek (`npx create-expo-app@latest`, template TypeScript), pasang dependensi bagian 1, konfigurasi NativeWind, ESLint, jest-expo. Lalu berhenti dan laporkan.
2. Kerjakan fase 1 sampai 4 berurutan, berhenti di akhir tiap fase.
3. Jika ada keputusan yang tidak tercakup dokumen ini, pilih opsi paling sederhana yang tidak melanggar aturan keras di bagian 1, dan catat keputusannya di `DECISIONS.md`.
4. Jangan menambah fitur di luar cakupan (bagian 0).
5. Jika sebuah API library berbeda dari yang ditulis di sini (versi SDK berubah), ikuti dokumentasi versi terpasang dan catat di `DECISIONS.md`.
