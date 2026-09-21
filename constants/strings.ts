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

  // Dashboard
  totalBulanIni: "Total Pengeluaran Bulan Ini",
  totalTahunIni: "Total Tahun Ini",
  totalSetahun: "Total Setahun",

  // Rekap
  rekap: "Rekap",
  jumlahTransaksi: "transaksi",

  // State kosong
  belumAdaData: "Belum ada pengeluaran.",
  belumAdaDataDetail: "Ketuk Catat Pengeluaran untuk mulai.",
  tanpaCatatan: "Tanpa catatan",

  // Preview ekspresi
  ekspresiTidakLengkap: "Ekspresi belum lengkap",

  // Dialog hapus
  hapusJudul: "Hapus Pengeluaran",
  hapusPesan: "Hapus pengeluaran ini? Tindakan ini tidak bisa dibatalkan.",
  hapusKonfirmasi: "Hapus",

  // Backup & restore
  cadangkanData: "Cadangkan Data",
  pulihkanData: "Pulihkan Data",
  gabungkanData: "Gabungkan dengan data sekarang",
  gantiSemuaData: "Ganti semua data",
  gantiKonfirmasi: "Ini akan menghapus semua data saat ini. Lanjutkan?",
  bantuanBackup: "Data hanya tersimpan di HP ini. Cadangkan secara berkala agar aman saat ganti HP.",
  tentang: "Tentang",

  // Error & info
  fileRusak: "File tidak valid atau rusak.",
  importBerhasil: (added: number, skipped: number) =>
    `${added} ditambahkan, ${skipped} dilewati.`,
  nominalHarusPositif: "Nominal harus lebih dari 0.",
};
