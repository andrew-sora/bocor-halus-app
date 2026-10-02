export interface DbClient {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  runAsync(sql: string, params?: unknown[]): Promise<void>;
  withTransactionAsync(cb: () => Promise<void>): Promise<void>;
}

type ExpenseRow = {
  id: string;
  amount: number;
  expression: string;
  note: string;
  category?: string;
  spent_at: string;
  created_at: string;
};

class WebMockDb implements DbClient {
  private expenses: ExpenseRow[] = [];
  private settings: Record<string, string> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const data = localStorage.getItem("bocor_halus_expenses_web");
        if (data) this.expenses = JSON.parse(data);
        const settingsData = localStorage.getItem("bocor_halus_settings_web");
        if (settingsData) this.settings = JSON.parse(settingsData);
      }
    } catch {}
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("bocor_halus_expenses_web", JSON.stringify(this.expenses));
        localStorage.setItem("bocor_halus_settings_web", JSON.stringify(this.settings));
      }
    } catch {}
  }

  async execAsync(sql: string): Promise<void> {
    if (sql.includes("DELETE FROM expenses")) {
      this.expenses = [];
      this.saveToStorage();
    }
  }

  async getFirstAsync<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    if (sql.includes("PRAGMA user_version")) {
      return { user_version: 2 } as T;
    }
    if (sql.includes("FROM settings WHERE key = ?")) {
      const key = params[0] as string;
      const val = this.settings[key];
      return val !== undefined ? ({ value: val } as T) : null;
    }
    if (sql.includes("WHERE id = ?")) {
      const found = this.expenses.find((e) => e.id === params[0]);
      return (found as T) ?? null;
    }
    if (sql.includes("SUM(amount)") && sql.includes("amount < ?")) {
      const ym = (params[0] as string)?.replace("%", "");
      const threshold = (params[1] as number) ?? 50000;
      const filtered = this.expenses.filter(
        (e) => e.spent_at.startsWith(ym) && e.amount < threshold
      );
      const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
      return { total, count: filtered.length } as T;
    }
    if (sql.includes("SUM(amount)")) {
      const ym = (params[0] as string)?.replace("%", "");
      const filtered = this.expenses.filter((e) => e.spent_at.startsWith(ym));
      const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
      return { total } as T;
    }
    return null;
  }

  async getAllAsync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (sql.includes("ORDER BY spent_at DESC, created_at DESC")) {
      let list = [...this.expenses].sort(
        (a, b) => b.spent_at.localeCompare(a.spent_at) || b.created_at.localeCompare(a.created_at)
      );
      if (sql.includes("WHERE spent_at LIKE ?")) {
        const ym = (params[0] as string)?.replace("%", "");
        list = list.filter((e) => e.spent_at.startsWith(ym));
      }
      if (params.length > 0 && typeof params[0] === "number") {
        list = list.slice(0, params[0]);
      }
      return list as T[];
    }
    if (sql.includes("GROUP BY ym")) {
      const year = (params[0] as string)?.replace("%", "");
      const map = new Map<string, { total: number; count: number }>();
      this.expenses
        .filter((e) => e.spent_at.startsWith(year))
        .forEach((e) => {
          const ym = e.spent_at.substring(0, 7);
          const current = map.get(ym) ?? { total: 0, count: 0 };
          map.set(ym, { total: current.total + e.amount, count: current.count + 1 });
        });
      const result: { ym: string; total: number; count: number }[] = [];
      map.forEach((val, ym) => {
        result.push({ ym, total: val.total, count: val.count });
      });
      result.sort((a, b) => a.ym.localeCompare(b.ym));
      return result as T[];
    }
    if (sql.includes("DISTINCT CAST")) {
      const years = Array.from(new Set(this.expenses.map((e) => parseInt(e.spent_at.substring(0, 4), 10))));
      years.sort((a, b) => b - a);
      return years.map((year) => ({ year })) as T[];
    }
    return [] as T[];
  }

  async runAsync(sql: string, params: unknown[] = []): Promise<void> {
    if (sql.includes("INTO settings")) {
      const [key, value] = params as [string, string];
      if (key && value) {
        this.settings[key] = value;
        this.saveToStorage();
      }
    } else if (sql.startsWith("INSERT INTO expenses")) {
      const [id, amount, expression, note, category, spent_at, created_at] = params as [
        string,
        number,
        string,
        string,
        string | undefined,
        string,
        string
      ];
      this.expenses.push({ id, amount, expression, note, category, spent_at, created_at });
      this.saveToStorage();
    } else if (sql.startsWith("UPDATE expenses")) {
      const [amount, expression, note, category, spent_at, id] = params as [
        number,
        string,
        string,
        string | undefined,
        string,
        string
      ];
      const index = this.expenses.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.expenses[index] = { ...this.expenses[index], amount, expression, note, category, spent_at };
        this.saveToStorage();
      }
    } else if (sql.startsWith("DELETE FROM expenses WHERE id = ?")) {
      const [id] = params as [string];
      this.expenses = this.expenses.filter((e) => e.id !== id);
      this.saveToStorage();
    } else if (sql.startsWith("DELETE FROM expenses")) {
      this.expenses = [];
      this.saveToStorage();
    }
  }

  async withTransactionAsync(cb: () => Promise<void>): Promise<void> {
    await cb();
  }
}

let instance: DbClient | null = null;

export async function getDbInstance(): Promise<DbClient> {
  if (!instance) {
    instance = new WebMockDb();
  }
  return instance;
}

export function resetDbInstance(): void {
  instance = null;
}
