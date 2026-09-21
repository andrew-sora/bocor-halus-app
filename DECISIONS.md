# DECISIONS.md

Dokumen ini mencatat keputusan teknis yang tidak tercakup dalam brief, atau penyesuaian karena versi library berbeda.

---

## Fase 0

### D-001: Nama app dan package ID
- **Keputusan:** Nama aplikasi `Bocor Halus`, package/bundle ID `id.soradev.bocorhalus`
- **Alasan:** Dipilih oleh Andrew (pemilik domain soradev.id)

### D-002: Template Expo
- **Keputusan:** Menggunakan template `tabs` dari `create-expo-app`
- **Alasan:** Template ini sudah include Expo Router dengan file-based routing dan tab navigation, sesuai brief

### D-003: ESLint flat config
- **Keputusan:** Menggunakan ESLint flat config (`eslint.config.js`) bukan `.eslintrc`
- **Alasan:** ESLint 9+ (yang terinstall) sudah default ke flat config. `.eslintrc` deprecated.

### D-004: OperatorBar cursor tracking
- **Keputusan:** Menggunakan `selection` prop + `onSelectionChange` bawaan React Native `TextInput`
- **Alasan:** Tidak perlu library tambahan, lebih ringan, tidak menambah dependency/izin

### D-005: Expo SDK 57
- **Keputusan:** Menggunakan versi yang diinstall `create-expo-app` terbaru yaitu SDK 57
- **Alasan:** Brief meminta "SDK stabil terbaru". SDK 57 adalah stable terbaru per September 2026.

---

---

## Fase 2

### D-006: StyleSheet vs NativeWind className
- **Keputusan:** Menggunakan `StyleSheet.create` sebagai primary styling (bukan className)
- **Alasan:** NativeWind v4 dengan React Native new architecture (RN 0.86) masih memerlukan setup yang tepat. StyleSheet lebih reliabel lintas platform dan tidak membutuhkan build step tambahan. NativeWind tetap dikonfigurasi (metro, babel, global.css) agar bisa digunakan di masa depan.

### D-007: Cursor tracking di OperatorBar
- **Keputusan:** Gunakan `useRef` untuk track selection (bukan useState) + `controlledSelection` state khusus untuk programmatic cursor movement
- **Alasan:** Menggunakan state biasa menyebabkan re-render berlebih saat onSelectionChange. Ref tidak trigger render, hanya dipakai saat insert/backspace.

### D-008: DatePicker iOS vs Android
- **Keputusan:** iOS pakai `display="spinner"` dengan tombol "Selesai", Android pakai `display="default"` (dialog OS)
- **Alasan:** Behavior default Android sudah menutup picker otomatis. iOS perlu dismissal manual.

### D-009: expo-file-system/legacy
- **Keputusan:** Import dari `expo-file-system/legacy` untuk `cacheDirectory`
- **Alasan:** SDK 57 expo-file-system v2 menggunakan class-based API baru. `cacheDirectory` hanya ada di legacy API.

*Tambahkan keputusan baru di sini setiap fase.*
