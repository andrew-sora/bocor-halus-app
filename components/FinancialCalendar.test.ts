import {
  formatCompactK,
  computeDayStatus,
  generateMonthGrid,
} from "./FinancialCalendar";
import type { Expense } from "@/lib/db";

describe("FinancialCalendar helper functions", () => {
  describe("formatCompactK", () => {
    test("memformat nominal di bawah 1000", () => {
      expect(formatCompactK(500)).toBe("500");
      expect(formatCompactK(0)).toBe("");
      expect(formatCompactK(-100)).toBe("");
    });

    test("memformat ribuan (k) dengan rapi", () => {
      expect(formatCompactK(15000)).toBe("15k");
      expect(formatCompactK(45000)).toBe("45k");
      expect(formatCompactK(150000)).toBe("150k");
      expect(formatCompactK(999000)).toBe("999k");
    });

    test("memformat jutaan (jt) dengan rapi", () => {
      expect(formatCompactK(1000000)).toBe("1jt");
      expect(formatCompactK(1500000)).toBe("1.5jt");
      expect(formatCompactK(2750000)).toBe("2.8jt");
    });
  });

  describe("computeDayStatus", () => {
    test("hari masa depan berstatus 'future'", () => {
      expect(computeDayStatus(0, 0, 100000, true)).toBe("future");
      expect(computeDayStatus(50000, 1, 100000, true)).toBe("future");
    });

    test("hari tanpa pengeluaran berstatus 'no_spend'", () => {
      expect(computeDayStatus(0, 0, 100000, false)).toBe("no_spend");
    });

    test("hari dengan pengeluaran di atas batas belanja tinggi berstatus 'heavy'", () => {
      expect(computeDayStatus(200000, 0, 100000, false)).toBe("heavy");
    });

    test("hari dengan transaksi bocor halus (<50k) berstatus 'bocor'", () => {
      expect(computeDayStatus(65000, 2, 100000, false)).toBe("bocor");
    });

    test("hari dengan transaksi normal berstatus 'safe'", () => {
      expect(computeDayStatus(80000, 0, 100000, false)).toBe("safe");
    });
  });

  describe("generateMonthGrid", () => {
    test("menghasilkan grid hari lengkap untuk bulan tertentu", () => {
      const expenses: Expense[] = [
        {
          id: "1",
          amount: 25000,
          expression: "25000",
          note: "Kopi",
          spentAt: "2026-04-10",
          createdAt: "2026-04-10T10:00:00Z",
        },
        {
          id: "2",
          amount: 300000,
          expression: "300000",
          note: "Belanja Bulanan",
          spentAt: "2026-04-15",
          createdAt: "2026-04-15T10:00:00Z",
        },
      ];

      const grid = generateMonthGrid("2026-04", expenses, 100000, "2026-04-20");

      // April punya 30 hari
      const currentMonthDays = grid.filter((c) => c.isCurrentMonth);
      expect(currentMonthDays.length).toBe(30);

      // Cek tanggal 10 April (ada jajan 25rb -> bocor halus)
      const day10 = currentMonthDays.find((c) => c.dayNumber === 10);
      expect(day10).toBeDefined();
      expect(day10?.total).toBe(25000);
      expect(day10?.bocorCount).toBe(1);
      expect(day10?.status).toBe("bocor");

      // Cek tanggal 15 April (300rb -> heavy spend)
      const day15 = currentMonthDays.find((c) => c.dayNumber === 15);
      expect(day15?.total).toBe(300000);
      expect(day15?.status).toBe("heavy");

      // Cek tanggal 5 April (nol belanja, sebelum hari ini -> no_spend)
      const day5 = currentMonthDays.find((c) => c.dayNumber === 5);
      expect(day5?.total).toBe(0);
      expect(day5?.status).toBe("no_spend");

      // Cek tanggal 25 April (nol belanja, setelah hari ini -> future)
      const day25 = currentMonthDays.find((c) => c.dayNumber === 25);
      expect(day25?.status).toBe("future");
    });
  });
});
