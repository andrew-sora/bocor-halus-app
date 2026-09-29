// lib/db.ts
// Semua query memakai parameter binding (?), BUKAN string concatenation
// Tanggal disimpan sebagai 'YYYY-MM-DD' (lokal), bukan ISO UTC

import * as Crypto from "expo-crypto";
import { getDbInstance, resetDbInstance, DbClient } from "./dbEngine";

export type Expense = {
  id: string;
  amount: number;       // integer rupiah > 0
  expression: string;
  note: string;
  category?: string;    // Optional tag id (e.g. 'dapur', 'jajan')
  spentAt: string;      // 'YYYY-MM-DD'
  createdAt: string;
};

export type BackupFile = {
  app: "catatan-keuangan";
  version: number;
  exportedAt: string;
  expenses: Expense[];
};

type MonthlyTotal = {
  month: number;
  total: number;
  count: number;
};

// Row type dari SQLite (snake_case)
type ExpenseRow = {
  id: string;
  amount: number;
  expression: string;
  note: string;
  category?: string;
  spent_at: string;
  created_at: string;
};

async function getDb(): Promise<DbClient> {
  return getDbInstance();
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    expression: row.expression,
    note: row.note,
    category: row.category || "lainnya",
    spentAt: row.spent_at,
    createdAt: row.created_at,
  };
}

/** Inisialisasi tabel dan migrasi via user_version */
export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS expenses (
      id          TEXT PRIMARY KEY,
      amount      INTEGER NOT NULL CHECK (amount > 0),
      expression  TEXT NOT NULL,
      note        TEXT NOT NULL DEFAULT '',
      category    TEXT DEFAULT 'lainnya',
      spent_at    TEXT NOT NULL,
      created_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_spent_at ON expenses(spent_at);
  `);
  // Migrasi berbasis user_version
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion < 1) {
    await db.execAsync("PRAGMA user_version = 1;");
  }
}

export async function addExpense(input: {
  amount: number;
  expression: string;
  note: string;
  category?: string;
  spentAt: string;
}): Promise<Expense> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const category = input.category || "lainnya";
  await db.runAsync(
    "INSERT INTO expenses (id, amount, expression, note, category, spent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, input.amount, input.expression, input.note, category, input.spentAt, createdAt]
  );
  return { id, ...input, category, createdAt };
}

export async function updateExpense(
  id: string,
  input: { amount: number; expression: string; note: string; category?: string; spentAt: string }
): Promise<void> {
  const db = await getDb();
  const category = input.category || "lainnya";
  await db.runAsync(
    "UPDATE expenses SET amount = ?, expression = ?, note = ?, category = ?, spent_at = ? WHERE id = ?",
    [input.amount, input.expression, input.note, category, input.spentAt, id]
  );
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM expenses WHERE id = ?", [id]);
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExpenseRow>(
    "SELECT * FROM expenses WHERE id = ?",
    [id]
  );
  return row ? rowToExpense(row) : null;
}

/** Daftar transaksi terbaru, urut spent_at DESC, created_at DESC */
export async function listRecent(limit: number): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExpenseRow>(
    "SELECT * FROM expenses ORDER BY spent_at DESC, created_at DESC LIMIT ?",
    [limit]
  );
  return rows.map(rowToExpense);
}

/** Transaksi dalam satu bulan (ym = 'YYYY-MM') */
export async function listByMonth(ym: string): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExpenseRow>(
    "SELECT * FROM expenses WHERE spent_at LIKE ? ORDER BY spent_at DESC, created_at DESC",
    [`${ym}-%`]
  );
  return rows.map(rowToExpense);
}

export async function totalByMonth(ym: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE spent_at LIKE ?",
    [`${ym}-%`]
  );
  return row?.total ?? 0;
}

/** Insight Bocor Halus: Menghitung transaksi mikro (< Rp 50.000) bulan ini */
export async function getMicroExpensesSummary(ym: string): Promise<{ total: number; count: number }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number; count: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses WHERE spent_at LIKE ? AND amount < 50000",
    [`${ym}-%`]
  );
  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}

export async function totalByYear(year: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE spent_at LIKE ?",
    [`${year}-%`]
  );
  return row?.total ?? 0;
}

/**
 * Rekap 12 bulan untuk satu tahun.
 * Selalu mengembalikan 12 elemen, bulan tanpa data = { total: 0, count: 0 }
 */
export async function monthlyTotals(year: number): Promise<MonthlyTotal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ ym: string; total: number; count: number }>(
    `SELECT substr(spent_at, 1, 7) as ym,
            COALESCE(SUM(amount), 0) as total,
            COUNT(*) as count
     FROM expenses
     WHERE spent_at LIKE ?
     GROUP BY ym
     ORDER BY ym`,
    [`${year}-%`]
  );

  return completeMonthlyTotals(year, rows);
}

/** Pure function: lengkapi data bulan ke 12 elemen (dapat diuji tanpa DB) */
export function completeMonthlyTotals(
  year: number,
  rows: { ym: string; total: number; count: number }[]
): MonthlyTotal[] {
  const map = new Map<number, { total: number; count: number }>();
  for (const row of rows) {
    const month = parseInt(row.ym.split("-")[1], 10);
    map.set(month, { total: row.total, count: row.count });
  }
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const data = map.get(month);
    return { month, total: data?.total ?? 0, count: data?.count ?? 0 };
  });
}

/** Tahun yang punya data, ditambah tahun berjalan */
export async function availableYears(): Promise<number[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ year: number }>(
    "SELECT DISTINCT CAST(substr(spent_at, 1, 4) AS INTEGER) as year FROM expenses ORDER BY year DESC"
  );
  const years = rows.map((r: { year: number }) => r.year);
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }
  return years;
}

export async function exportAll(): Promise<BackupFile> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExpenseRow>(
    "SELECT * FROM expenses ORDER BY spent_at DESC, created_at DESC"
  );
  return {
    app: "catatan-keuangan",
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses: rows.map(rowToExpense),
  };
}

/** Validasi satu baris expense dari backup (di-export untuk testing) */
export function isValidExpenseRow(row: unknown): row is Expense {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.amount === "number" &&
    Number.isInteger(r.amount) &&
    r.amount > 0 &&
    typeof r.expression === "string" &&
    typeof r.note === "string" &&
    typeof r.spentAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.spentAt) &&
    typeof r.createdAt === "string"
  );
}

/**
 * Import dari BackupFile dalam satu transaksi.
 * mode "replace": hapus semua data dulu, lalu insert.
 * mode "merge": skip id yang sudah ada.
 */
export async function importAll(
  data: BackupFile,
  mode: "replace" | "merge"
): Promise<{ added: number; skipped: number }> {
  const db = await getDb();
  let added = 0;
  let skipped = 0;

  await db.withTransactionAsync(async () => {
    if (mode === "replace") {
      await db.runAsync("DELETE FROM expenses");
    }

    for (const expense of data.expenses) {
      if (!isValidExpenseRow(expense)) {
        skipped++;
        continue;
      }

      if (mode === "merge") {
        const existing = await db.getFirstAsync<{ id: string }>(
          "SELECT id FROM expenses WHERE id = ?",
          [expense.id]
        );
        if (existing) {
          skipped++;
          continue;
        }
      }

      const category = expense.category || "lainnya";
      await db.runAsync(
        "INSERT INTO expenses (id, amount, expression, note, category, spent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          expense.id,
          expense.amount,
          expense.expression,
          expense.note,
          category,
          expense.spentAt,
          expense.createdAt,
        ]
      );
      added++;
    }
  });

  return { added, skipped };
}

/** Budget Preference Management */
let cachedBudgetLimit = 3000000; // Default Rp 3.000.000

export async function getBudgetLimit(): Promise<number> {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("bocor_halus_budget_limit");
      if (stored) return parseInt(stored, 10);
    }
  } catch {}
  return cachedBudgetLimit;
}

export async function setBudgetLimit(limit: number): Promise<void> {
  cachedBudgetLimit = limit;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("bocor_halus_budget_limit", limit.toString());
    }
  } catch {}
}

// Untuk testing: reset instance DB (dipakai oleh mock)
export function _resetDbForTest(): void {
  resetDbInstance();
}
