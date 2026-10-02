import { calculateBudgetStatus } from "./TotalCard";
import { strings } from "@/constants/strings";

describe("calculateBudgetStatus", () => {
  test("menghitung sisa jatah dan persentase dengan benar ketika budget aman", () => {
    const result = calculateBudgetStatus(1250000, 3000000);
    expect(result.sisaJatah).toBe(1750000);
    expect(result.percentage).toBe(42);
    expect(result.statusMsg).toBe(strings.budgetOptimal);
  });

  test("memberikan status mepet ketika pengeluaran melebihi 80% budget", () => {
    const result = calculateBudgetStatus(2500000, 3000000);
    expect(result.sisaJatah).toBe(500000);
    expect(result.percentage).toBe(83);
    expect(result.statusMsg).toBe(strings.budgetMepet);
  });

  test("memberikan status overbudget ketika pengeluaran melebihi limit", () => {
    const result = calculateBudgetStatus(3500000, 3000000);
    expect(result.sisaJatah).toBe(0);
    expect(result.percentage).toBe(100);
    expect(result.statusMsg).toBe(strings.budgetOver);
  });

  test("menangani budget 0 atau negatif secara aman tanpa divide-by-zero", () => {
    const result = calculateBudgetStatus(500000, 0);
    expect(result.sisaJatah).toBe(0);
    expect(result.percentage).toBe(100);
  });
});
