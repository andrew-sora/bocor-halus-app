import { calculateSavingGoalProgress } from "./SavingGoalCard";

describe("calculateSavingGoalProgress", () => {
  test("menghitung persentase tabungan secara akurat", () => {
    const res = calculateSavingGoalProgress(150000, 500000);
    expect(res.percentage).toBe(30);
    expect(res.remaining).toBe(350000);
    expect(res.isCompleted).toBe(false);
  });

  test("menangani tabungan yang sudah mencapai target 100%", () => {
    const res = calculateSavingGoalProgress(500000, 500000);
    expect(res.percentage).toBe(100);
    expect(res.remaining).toBe(0);
    expect(res.isCompleted).toBe(true);
  });

  test("membatasi persentase maksimal 100% jika tabungan melebihi target", () => {
    const res = calculateSavingGoalProgress(650000, 500000);
    expect(res.percentage).toBe(100);
    expect(res.remaining).toBe(0);
    expect(res.isCompleted).toBe(true);
  });

  test("menangani nominal 0 atau target tidak valid secara aman", () => {
    const res = calculateSavingGoalProgress(0, 500000);
    expect(res.percentage).toBe(0);
    expect(res.remaining).toBe(500000);
    expect(res.isCompleted).toBe(false);
  });
});
