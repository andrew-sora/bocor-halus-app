import { evalExpr } from "@/lib/evalExpr";
import { formatRupiah } from "@/lib/format";

describe("Tambah Screen Calculation & Input Helpers", () => {
  test("evaluates complex expression input like 17.000+75.000 to correct total", () => {
    const rawInput = "17.000+75.000";
    const evaluated = evalExpr(rawInput);
    expect(evaluated).toBe(92000);
    expect(formatRupiah(evaluated!)).toBe("Rp 92.000");
  });

  test("handles preset amount addition when input is empty vs when input exists", () => {
    const addPreset = (current: string, amount: number) => {
      if (!current.trim()) return String(amount);
      return `${current}+${amount}`;
    };

    expect(addPreset("", 50000)).toBe("50000");
    expect(addPreset("17.000", 20000)).toBe("17.000+20000");
  });

  test("inserts operator char at selection position", () => {
    const insertChar = (current: string, char: string, selStart: number, selEnd: number) => {
      const before = current.slice(0, selStart);
      const after = current.slice(selEnd);
      return before + char + after;
    };

    expect(insertChar("17000", "+", 5, 5)).toBe("17000+");
    expect(insertChar("10000+50000", "*", 5, 5)).toBe("10000*+50000");
  });

  test("handles backspace deletion at cursor selection", () => {
    const backspace = (current: string, selStart: number, selEnd: number) => {
      if (selStart !== selEnd) {
        return current.slice(0, selStart) + current.slice(selEnd);
      }
      if (selStart === 0) return current;
      return current.slice(0, selStart - 1) + current.slice(selStart);
    };

    expect(backspace("17000+", 6, 6)).toBe("17000");
    expect(backspace("12345", 2, 4)).toBe("125");
  });
});
