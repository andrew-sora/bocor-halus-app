// lib/date.ts
// Helper tanggal menggunakan waktu lokal, BUKAN toISOString() agar tidak bergeser UTC

export const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayLocal = (): string => toLocalDateString(new Date());

export const parseLocalDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const currentYearMonth = (): string => todayLocal().slice(0, 7); // 'YYYY-MM'

/**
 * Format tanggal ke format Indonesia pendek, mis. "Sen, 21 Sep 2026"
 * Input: string 'YYYY-MM-DD'
 */
export const formatTanggalId = (s: string): string => {
  const d = parseLocalDate(s);
  try {
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    // Fallback jika id-ID tidak tersedia di runtime
    const hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
                 "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${hari[d.getDay()]}, ${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`;
  }
};

/**
 * Nama bulan Indonesia (1-indexed: 1 = Januari, 12 = Desember)
 */
export const namaBulan = (m: number): string => {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return bulan[m - 1] ?? "";
};
