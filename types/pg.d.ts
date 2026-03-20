declare module "pg" {
  export class Pool {
    constructor(config?: { connectionString?: string; [key: string]: unknown });
    query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
    end(): Promise<void>;
  }
  export default { Pool };
}
