// lib/db.test.ts
// Hanya menguji fungsi murni (pure functions) dari db.ts
// DB async tidak diuji di sini karena membutuhkan native module expo-sqlite

import { completeMonthlyTotals, isValidExpenseRow } from "./db";

describe("completeMonthlyTotals", () => {
  test("selalu mengembalikan 12 elemen", () => {
    const result = completeMonthlyTotals(2026, []);
    expect(result).toHaveLength(12);
  });

  test("bulan 1 sampai 12 berurutan", () => {
    const result = completeMonthlyTotals(2026, []);
    result.forEach((r, i) => expect(r.month).toBe(i + 1));
  });

  test("bulan tanpa data = total 0 dan count 0", () => {
    const result = completeMonthlyTotals(2026, []);
    result.forEach((r) => {
      expect(r.total).toBe(0);
      expect(r.count).toBe(0);
    });
  });

  test("bulan dengan data terisi dengan benar", () => {
    const rows = [
      { ym: "2026-01", total: 500000, count: 3 },
      { ym: "2026-06", total: 1200000, count: 7 },
      { ym: "2026-12", total: 300000, count: 2 },
    ];
    const result = completeMonthlyTotals(2026, rows);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ month: 1, total: 500000, count: 3 });
    expect(result[5]).toEqual({ month: 6, total: 1200000, count: 7 });
    expect(result[11]).toEqual({ month: 12, total: 300000, count: 2 });
    expect(result[1]).toEqual({ month: 2, total: 0, count: 0 });
  });
});

describe("isValidExpenseRow", () => {
  const valid = {
    id: "abc-123",
    amount: 50000,
    expression: "50.000",
    note: "makan siang",
    spentAt: "2026-09-21",
    createdAt: "2026-09-21T10:00:00.000Z",
  };

  test("row valid → true", () => expect(isValidExpenseRow(valid)).toBe(true));
  test("null → false", () => expect(isValidExpenseRow(null)).toBe(false));
  test("amount 0 → false", () => expect(isValidExpenseRow({ ...valid, amount: 0 })).toBe(false));
  test("amount negatif → false", () => expect(isValidExpenseRow({ ...valid, amount: -1000 })).toBe(false));
  test("amount float → false", () => expect(isValidExpenseRow({ ...valid, amount: 1000.5 })).toBe(false));
  test("spentAt format salah → false", () => expect(isValidExpenseRow({ ...valid, spentAt: "21-09-2026" })).toBe(false));
  test("id kosong → false", () => expect(isValidExpenseRow({ ...valid, id: "" })).toBe(false));
  test("id bukan string → false", () => expect(isValidExpenseRow({ ...valid, id: 123 })).toBe(false));
});
