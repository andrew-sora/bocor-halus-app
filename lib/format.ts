// lib/format.ts
// Format angka ke format rupiah Indonesia

/**
 * Format integer ke "Rp 92.000"
 * Menggunakan Intl.NumberFormat id-ID, dengan fallback manual jika tidak tersedia (Hermes)
 */
export function formatRupiah(n: number): string {
  return `Rp ${formatAngkaId(n)}`;
}

/**
 * Format integer ke "92.000" (tanpa prefix Rp)
 */
export function formatAngkaId(n: number): string {
  try {
    const result = new Intl.NumberFormat("id-ID").format(n);
    // Validasi: pastikan hasilnya pakai titik sebagai pemisah ribuan
    // (beberapa runtime mungkin tidak support id-ID dengan benar)
    if (result.includes(".") || n < 1000) {
      return result;
    }
    // Fallback jika id-ID tidak menghasilkan titik ribuan
    return fallbackFormat(n);
  } catch {
    return fallbackFormat(n);
  }
}

/** Fallback manual dengan regex pemisah ribuan (titik) */
function fallbackFormat(n: number): string {
  const abs = Math.abs(Math.round(n));
  const str = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return n < 0 ? `-${str}` : str;
}
