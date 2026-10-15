import { getDb } from "./db";

/**
 * Daftar Master Key untuk developer, founder, & demo review
 */
const MASTER_KEYS = new Set([
  "BHVIP2026",
  "BHFOUNDER",
  "BHDEVTEST",
  "BOCORHALUS",
  "SORADEV2026",
]);

const CHAR_SET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude I, O to avoid confusion

/**
 * Menghitung karakter checksum untuk string input
 */
function calculateChecksum(payload: string): string {
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    const code = payload.charCodeAt(i);
    sum = (sum * 31 + code + (i + 1) * 7) % CHAR_SET.length;
  }
  return CHAR_SET[sum];
}

/**
 * Membersihkan format input (menghapus spasi, strip, dan ubah ke uppercase)
 */
export function normalizeKey(rawKey: string): string {
  return rawKey.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Validasi kode lisensi secara offline
 * Mendukung format: BH-XXXX-XXXX (atau tanpa strip) & Master Keys
 */
export function validateLicenseKey(rawKey: string): boolean {
  if (!rawKey || typeof rawKey !== "string") return false;
  const clean = normalizeKey(rawKey);

  // 1. Cek Master Key
  if (MASTER_KEYS.has(clean)) return true;

  // 2. Format standar: Harus diawali BH dan panjang 10 karakter (BH + 7 char payload + 1 char checksum)
  if (!clean.startsWith("BH") || clean.length !== 10) {
    return false;
  }

  const payload = clean.slice(2, 9);
  const expectedChecksum = clean.charAt(9);
  const actualChecksum = calculateChecksum(payload);

  return expectedChecksum === actualChecksum;
}

/**
 * Menghasilkan 1 kode lisensi acak yang valid (format: BH-XXXX-XXXX)
 */
export function generateLicenseKey(): string {
  let payload = "";
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * CHAR_SET.length);
    payload += CHAR_SET[randomIndex];
  }
  const checksum = calculateChecksum(payload);
  const full = payload + checksum; // 8 karakter
  // Format menjadi BH-XXXX-XXXX
  return `BH-${full.slice(0, 4)}-${full.slice(4)}`;
}

/**
 * Menghasilkan sejumlah N kode lisensi unik untuk di-upload ke Lynk.id / Mayar
 */
export function generateBatchKeys(count: number): string[] {
  const keys = new Set<string>();
  while (keys.size < count) {
    keys.add(generateLicenseKey());
  }
  return Array.from(keys);
}

/**
 * Mengecek apakah aplikasi sudah teraktivasi di perangkat ini
 */
export async function isAppActivated(): Promise<boolean> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE key = ?",
      ["license_key"]
    );
    if (!row || !row.value) return false;
    return validateLicenseKey(row.value);
  } catch {
    return false;
  }
}

/**
 * Mengaktifkan aplikasi dengan kode lisensi
 */
export async function activateLicense(
  rawKey: string
): Promise<{ success: boolean; message: string }> {
  if (!validateLicenseKey(rawKey)) {
    return {
      success: false,
      message: "Kode lisensi tidak valid. Periksa kembali huruf dan angka yang Anda masukkan.",
    };
  }

  const clean = normalizeKey(rawKey);
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      ["license_key", clean]
    );
    await db.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      ["license_activated_at", now]
    );
    return {
      success: true,
      message: "Aktivasi berhasil! Terima kasih telah membeli Bocor Halus.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan lisensi.";
    return {
      success: false,
      message,
    };
  }
}

/**
 * Mereset status lisensi (untuk pengujian atau keluar akun)
 */
export async function deactivateLicense(): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync("DELETE FROM settings WHERE key IN (?, ?)", [
      "license_key",
      "license_activated_at",
    ]);
  } catch {}
}
