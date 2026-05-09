import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ENV } from "../utils/env.js";

class DatabaseManager {
  private db: Database.Database;

  constructor(databaseUrl: string) {
    // create folder if not exists
    const dbDir = path.dirname(databaseUrl);
    if (dbDir && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.db = new Database(databaseUrl);
    this.db.pragma("journal_mode = WAL");
  }

  public getDb(): Database.Database {
    return this.db;
  }

  public exec(sql: string) {
    this.db.exec(sql);
  }

  public prepare(sql: string): unknown {
    return this.db.prepare(sql);
  }

  public close() {
    this.db.close();
  }
}

export const db = ENV.DATABASE_ENABLED
  ? new DatabaseManager(ENV.DATABASE_URL)
  : null;
