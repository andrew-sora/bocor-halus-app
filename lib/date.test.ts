import {
  toLocalDateString,
  todayLocal,
  parseLocalDate,
  currentYearMonth,
  formatTanggalId,
  namaBulan,
} from "./date";

describe("toLocalDateString", () => {
  test("pukul 00:30 waktu lokal tetap di tanggal yang sama (bukan geser ke hari sebelumnya)", () => {
    // Ini adalah test utama: UTC+7 midnight menjadi 1 Jan, bukan 31 Des
    const d = new Date(2026, 0, 1, 0, 30); // 1 Jan 2026 pukul 00:30 lokal
    expect(toLocalDateString(d)).toBe("2026-01-01");
  });

  test("format YYYY-MM-DD dengan padding nol", () => {
    expect(toLocalDateString(new Date(2026, 8, 5))).toBe("2026-09-05"); // 5 Sep 2026
  });

  test("akhir tahun 31 Desember", () => {
    expect(toLocalDateString(new Date(2025, 11, 31))).toBe("2025-12-31");
  });

  test("tahun kabisat 29 Februari 2028", () => {
    expect(toLocalDateString(new Date(2028, 1, 29))).toBe("2028-02-29");
  });
});

describe("parseLocalDate", () => {
  test("parse kembali ke tanggal yang benar", () => {
    const d = parseLocalDate("2026-09-21");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // 0-indexed
    expect(d.getDate()).toBe(21);
  });
});

describe("todayLocal", () => {
  test("mengembalikan format YYYY-MM-DD", () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("currentYearMonth", () => {
  test("mengembalikan format YYYY-MM", () => {
    expect(currentYearMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("namaBulan", () => {
  test("1 → Januari", () => expect(namaBulan(1)).toBe("Januari"));
  test("6 → Juni", () => expect(namaBulan(6)).toBe("Juni"));
  test("12 → Desember", () => expect(namaBulan(12)).toBe("Desember"));
  test("0 → kosong (out of range)", () => expect(namaBulan(0)).toBe(""));
});

describe("formatTanggalId", () => {
  test("mengembalikan string tanggal yang tidak kosong", () => {
    const result = formatTanggalId("2026-09-21");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("2026");
  });
});
