import {
  validateLicenseKey,
  generateLicenseKey,
  generateBatchKeys,
  normalizeKey,
  isAppActivated,
  activateLicense,
  deactivateLicense,
} from "@/lib/license";

const mockStore: Record<string, string> = {};

jest.mock("./db", () => ({
  getDb: jest.fn(async () => ({
    getFirstAsync: jest.fn(async (_sql: string, params: string[]) => {
      const val = mockStore[params[0]];
      return val ? { value: val } : null;
    }),
    runAsync: jest.fn(async (_sql: string, params: string[]) => {
      if (_sql.includes("DELETE")) {
        params.forEach((p) => delete mockStore[p]);
      } else {
        mockStore[params[0]] = params[1];
      }
    }),
  })),
}));

describe("License Validation & Activation Helper", () => {
  beforeEach(async () => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  });

  test("normalizes key properly by trimming hyphens and spaces", () => {
    expect(normalizeKey("bh-1234-abcd")).toBe("BH1234ABCD");
    expect(normalizeKey(" BH - 7821 - K9A2 ")).toBe("BH7821K9A2");
  });

  test("accepts official master keys", () => {
    expect(validateLicenseKey("BH-VIP-2026")).toBe(true);
    expect(validateLicenseKey("BHFOUNDER")).toBe(true);
    expect(validateLicenseKey("bhdevtest")).toBe(true);
    expect(validateLicenseKey("bocorhalus")).toBe(true);
  });

  test("rejects invalid keys or random strings", () => {
    expect(validateLicenseKey("")).toBe(false);
    expect(validateLicenseKey("123456")).toBe(false);
    expect(validateLicenseKey("BH-RANDOM-KEY")).toBe(false);
    expect(validateLicenseKey("XX-1234-5678")).toBe(false);
  });

  test("generates valid license keys that pass validation", () => {
    for (let i = 0; i < 20; i++) {
      const generated = generateLicenseKey();
      expect(generated.startsWith("BH-")).toBe(true);
      expect(validateLicenseKey(generated)).toBe(true);
    }
  });

  test("generates unique batch keys", () => {
    const batch = generateBatchKeys(30);
    expect(batch.length).toBe(30);
    const unique = new Set(batch);
    expect(unique.size).toBe(30);
    batch.forEach((k) => expect(validateLicenseKey(k)).toBe(true));
  });

  test("activates valid license and reflects in isAppActivated", async () => {
    expect(await isAppActivated()).toBe(false);

    const validKey = generateLicenseKey();
    const result = await activateLicense(validKey);
    expect(result.success).toBe(true);

    expect(await isAppActivated()).toBe(true);

    await deactivateLicense();
    expect(await isAppActivated()).toBe(false);
  });

  test("fails activation when invalid key is provided", async () => {
    const result = await activateLicense("BH-SALAH-TOTAL");
    expect(result.success).toBe(false);
    expect(await isAppActivated()).toBe(false);
  });
});
