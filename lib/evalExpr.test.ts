import { evalExpr } from "./evalExpr";

describe("evalExpr", () => {
  // Kasus valid
  test('"17.000+75.000" → 92000', () => expect(evalExpr("17.000+75.000")).toBe(92000));
  test('"17.000 + 75.000" → 92000', () => expect(evalExpr("17.000 + 75.000")).toBe(92000));
  test('"2x15.000" → 30000', () => expect(evalExpr("2x15.000")).toBe(30000));
  test('"2×15.000" → 30000', () => expect(evalExpr("2×15.000")).toBe(30000));
  test('"(5.000+3.000)*2" → 16000', () => expect(evalExpr("(5.000+3.000)*2")).toBe(16000));
  test('"100.000/3" → 33333', () => expect(evalExpr("100.000/3")).toBe(33333));
  test('"1.000.000" → 1000000', () => expect(evalExpr("1.000.000")).toBe(1000000));
  test('"1,5x10.000" → 15000', () => expect(evalExpr("1,5x10.000")).toBe(15000));
  test('"12+34" → 46', () => expect(evalExpr("12+34")).toBe(46));
  test('"-5.000+2.000" → -3000', () => expect(evalExpr("-5.000+2.000")).toBe(-3000));

  // Kasus tidak valid
  test('"10.000/0" → null (bagi nol)', () => expect(evalExpr("10.000/0")).toBeNull());
  test('"abc" → null', () => expect(evalExpr("abc")).toBeNull());
  test('"" → null', () => expect(evalExpr("")).toBeNull());
  test('"1.5" → null (titik bukan ribuan valid)', () => expect(evalExpr("1.5")).toBeNull());
  test('"1.00" → null', () => expect(evalExpr("1.00")).toBeNull());
  test('"5.000+" → null', () => expect(evalExpr("5.000+")).toBeNull());
  test('"((5.000)" → null', () => expect(evalExpr("((5.000)")).toBeNull());
  test('"(5.000)(3.000)" → null', () => expect(evalExpr("(5.000)(3.000)")).toBeNull());
  test('"5.000++3.000" → null', () => expect(evalExpr("5.000++3.000")).toBeNull());
});
