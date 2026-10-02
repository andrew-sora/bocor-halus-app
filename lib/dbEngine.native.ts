import * as SQLite from "expo-sqlite";

export interface DbClient {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  runAsync(sql: string, params?: unknown[]): Promise<void>;
  withTransactionAsync(cb: () => Promise<void>): Promise<void>;
}

let instance: DbClient | null = null;

export async function getDbInstance(): Promise<DbClient> {
  if (!instance) {
    const db = await SQLite.openDatabaseAsync("bocor-halus.db");
    instance = db as unknown as DbClient;
  }
  return instance;
}

export function resetDbInstance(): void {
  instance = null;
}
