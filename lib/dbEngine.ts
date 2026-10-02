export interface DbClient {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  runAsync(sql: string, params?: unknown[]): Promise<void>;
  withTransactionAsync(cb: () => Promise<void>): Promise<void>;
}

export async function getDbInstance(): Promise<DbClient> {
  throw new Error("Platform dbEngine not found");
}

export function resetDbInstance(): void {
  // no-op
}
