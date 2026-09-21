// lib/backup.ts
// Export via expo-sharing (share sheet ke WhatsApp/Drive/Files)
// Import via expo-document-picker

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { exportAll, importAll, type BackupFile } from "./db";
import { todayLocal } from "./date";

/** Nama file backup: catatan-keuangan-YYYY-MM-DD.json */
function backupFileName(): string {
  return `catatan-keuangan-${todayLocal()}.json`;
}

/**
 * Export semua data ke file JSON dan buka share sheet.
 * Pengguna bisa kirim ke WhatsApp, simpan ke Drive, Files, dll.
 */
export async function exportBackup(): Promise<void> {
  const data = await exportAll();
  const json = JSON.stringify(data, null, 2);
  const fileName = backupFileName();
  const fileUri = FileSystem.cacheDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing tidak tersedia di perangkat ini.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Cadangkan Data Bocor Halus",
    UTI: "public.json",
  });
}

export type ImportResult = { added: number; skipped: number };

/**
 * Pilih file JSON dari file manager dan import datanya.
 * @param mode "replace" = hapus semua lalu import, "merge" = gabungkan
 * @returns hasil import atau null jika pengguna batal
 */
export async function importBackup(
  mode: "replace" | "merge"
): Promise<ImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) return null;

  const json = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("File tidak valid atau rusak.");
  }

  if (!isValidBackupFile(data)) {
    throw new Error("Format file tidak dikenal atau versi tidak didukung.");
  }

  return await importAll(data, mode);
}

/** Validasi struktur BackupFile */
function isValidBackupFile(data: unknown): data is BackupFile {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.app === "catatan-keuangan" &&
    typeof d.version === "number" &&
    d.version >= 1 &&
    Array.isArray(d.expenses)
  );
}
