import { evalExpr } from "@/lib/evalExpr";
import { formatRupiah } from "@/lib/format";
import { addPresetAmount, insertChar, backspaceChar } from "@/lib/expenseInput";

describe("Tambah Screen Calculation & Input Helpers", () => {
  test("evaluates complex expression input like 17.000+75.000 to correct total", () => {
    const rawInput = "17.000+75.000";
    const evaluated = evalExpr(rawInput);
    expect(evaluated).toBe(92000);
    expect(formatRupiah(evaluated!)).toBe("Rp 92.000");
  });

  test("handles preset amount addition when input is empty vs when input exists", () => {
    expect(addPresetAmount("", 50000)).toBe("50000");
    expect(addPresetAmount("17.000", 20000)).toBe("17.000+20000");
  });

  test("inserts operator char at selection position", () => {
    const res1 = insertChar("17000", "+", 5, 5);
    expect(res1.newValue).toBe("17000+");
    expect(res1.newPos).toBe(6);

    const res2 = insertChar("10000+50000", "*", 5, 5);
    expect(res2.newValue).toBe("10000*+50000");
    expect(res2.newPos).toBe(6);
  });

  test("handles backspace deletion at cursor selection", () => {
    const res1 = backspaceChar("17000+", 6, 6);
    expect(res1.newValue).toBe("17000");
    expect(res1.newPos).toBe(5);

    const res2 = backspaceChar("12345", 2, 4);
    expect(res2.newValue).toBe("125");
    expect(res2.newPos).toBe(2);
  });
});
