// Semua teks UI berbahasa Indonesia dikumpulkan di sini
export const strings = {
  // Tab navigation
  tabBeranda: "Beranda",
  tabRekap: "Rekap",
  tabPengaturan: "Pengaturan",

  // Aksi utama
  catatPengeluaran: "Catat Pengeluaran",
  simpan: "Simpan",
  hapus: "Hapus",
  batal: "Batal",
  edit: "Edit",

  // Field form
  nominal: "Nominal",
  tanggal: "Tanggal",
  catatan: "Catatan",
  catatanPlaceholder: "Mis. jajan pasar + bulanan",
  kategori: "Kategori Pengeluaran",

  // Dashboard & Empathy Budget
  totalBulanIni: "Total Pengeluaran Bulan Ini",
  totalTahunIni: "Total Tahun Ini",
  totalSetahun: "Total Setahun",
  sisaJatah: "Sisa Jatah Bulanan",
  budgetOptimal: "Pengeluaran bulan ini masih dalam batas aman ✨",
  budgetMepet: "Perhatian! Pengeluaran sudah terpakai > 80% ⚠️",
  budgetOver: "Overbudget! Pengeluaran melebihi batas jatah 🚨",
  bocorHalusInsightTitle: "Deteksi Bocor Halus",
  bocorHalusInsightText: (total: string, count: number) =>
    `Bulan ini ada ${count} transaksi kecil (< Rp 50rb) senilai total ${total}. Sering tak terasa tapi menumpuk! 💡`,

  // Rekap
  rekap: "Rekap 12 Bulan",
  jumlahTransaksi: "transaksi",

  // State kosong
  belumAdaData: "Belum ada pengeluaran bulan ini.",
  belumAdaDataDetail: "Ketuk Catat Pengeluaran di bawah untuk memulai pencatatan hematmu.",
  tanpaCatatan: "Tanpa catatan",

  // Preview ekspresi
  ekspresiTidakLengkap: "Ekspresi belum lengkap",

  // Dialog hapus
  hapusJudul: "Hapus Pengeluaran",
  hapusPesan: "Hapus pengeluaran ini? Tindakan ini tidak bisa dibatalkan.",
  hapusKonfirmasi: "Hapus",

  // Backup & Pengaturan Budget
  cadangkanData: "Cadangkan Data",
  pulihkanData: "Pulihkan Data",
  gabungkanData: "Gabungkan dengan data sekarang",
  gantiSemuaData: "Ganti semua data",
  gantiKonfirmasi: "Ini akan menghapus semua data saat ini. Lanjutkan?",
  bantuanBackup: "Data 100% aman tersimpan di HP ini. Cadangkan secara berkala agar aman saat ganti HP.",
  tentang: "Tentang Bocor Halus",
  targetBudgetTitle: "Batas Jatah Bulanan (Budget)",
  targetBudgetDesc: "Atur target jatah belanja per bulan untuk memantau indikator keuanganmu.",
  simpanBudget: "Simpan Batas Jatah",

  // Error & info
  fileRusak: "File tidak valid atau rusak.",
  importBerhasil: (added: number, skipped: number) =>
    `${added} ditambahkan, ${skipped} dilewati.`,
  nominalHarusPositif: "Nominal harus lebih dari 0.",
};
