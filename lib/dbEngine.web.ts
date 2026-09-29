export interface DbClient {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
  runAsync(sql: string, params?: any[]): Promise<void>;
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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const data = localStorage.getItem("bocor_halus_expenses_web");
        if (data) this.expenses = JSON.parse(data);
      }
    } catch {}
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("bocor_halus_expenses_web", JSON.stringify(this.expenses));
      }
    } catch {}
  }

  async execAsync(sql: string): Promise<void> {
    if (sql.includes("DELETE FROM expenses")) {
      this.expenses = [];
      this.saveToStorage();
    }
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    if (sql.includes("PRAGMA user_version")) {
      return { user_version: 2 } as T;
    }
    if (sql.includes("WHERE id = ?")) {
      const found = this.expenses.find((e) => e.id === params[0]);
      return (found as T) ?? null;
    }
    if (sql.includes("SUM(amount)") && sql.includes("amount < 50000")) {
      const ym = params[0]?.replace("%", "");
      const filtered = this.expenses.filter(
        (e) => e.spent_at.startsWith(ym) && e.amount < 50000
      );
      const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
      return { total, count: filtered.length } as T;
    }
    if (sql.includes("SUM(amount)")) {
      const ym = params[0]?.replace("%", "");
      const filtered = this.expenses.filter((e) => e.spent_at.startsWith(ym));
      const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
      return { total } as T;
    }
    return null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (sql.includes("ORDER BY spent_at DESC, created_at DESC")) {
      let list = [...this.expenses].sort(
        (a, b) => b.spent_at.localeCompare(a.spent_at) || b.created_at.localeCompare(a.created_at)
      );
      if (sql.includes("WHERE spent_at LIKE ?")) {
        const ym = params[0]?.replace("%", "");
        list = list.filter((e) => e.spent_at.startsWith(ym));
      }
      if (params.length > 0 && typeof params[0] === "number") {
        list = list.slice(0, params[0]);
      }
      return list as T[];
    }
    if (sql.includes("GROUP BY ym")) {
      const year = params[0]?.replace("%", "");
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

  async runAsync(sql: string, params: any[] = []): Promise<void> {
    if (sql.startsWith("INSERT INTO expenses")) {
      const [id, amount, expression, note, category, spent_at, created_at] = params;
      this.expenses.push({ id, amount, expression, note, category, spent_at, created_at });
      this.saveToStorage();
    } else if (sql.startsWith("UPDATE expenses")) {
      const [amount, expression, note, category, spent_at, id] = params;
      const index = this.expenses.findIndex((e) => e.id === id);
      if (index !== -1) {
        this.expenses[index] = { ...this.expenses[index], amount, expression, note, category, spent_at };
        this.saveToStorage();
      }
    } else if (sql.startsWith("DELETE FROM expenses WHERE id = ?")) {
      const [id] = params;
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
