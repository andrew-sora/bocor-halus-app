import { formatRupiah, formatAngkaId } from "./format";

describe("formatAngkaId", () => {
  test("92000 → '92.000'", () => expect(formatAngkaId(92000)).toBe("92.000"));
  test("1000000 → '1.000.000'", () => expect(formatAngkaId(1000000)).toBe("1.000.000"));
  test("0 → '0'", () => expect(formatAngkaId(0)).toBe("0"));
  test("500 → '500' (kurang dari 1000)", () => expect(formatAngkaId(500)).toBe("500"));
  test("1500 → '1.500'", () => expect(formatAngkaId(1500)).toBe("1.500"));
});

describe("formatRupiah", () => {
  test("92000 → 'Rp 92.000'", () => expect(formatRupiah(92000)).toBe("Rp 92.000"));
  test("0 → 'Rp 0'", () => expect(formatRupiah(0)).toBe("Rp 0"));
  test("1000000 → 'Rp 1.000.000'", () => expect(formatRupiah(1000000)).toBe("Rp 1.000.000"));
});
