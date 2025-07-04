import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { accounts, sendLogs } from './schema';
import * as path from 'path';
import * as fs from 'fs';
import { eq } from 'drizzle-orm';

// Используем абсолютные пути для надежности
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'db.sqlite');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Используем типы, выведенные из схемы
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type SendLog = typeof sendLogs.$inferSelect;
export type NewSendLog = typeof sendLogs.$inferInsert;

export { accounts, sendLogs };

// Убираем лишние async/await, т.к. better-sqlite3 работает синхронно
export function getAllAccounts(): Account[] {
    return db.select().from(accounts).all();
}

export function getAccountByEmail(email: string): Account | undefined {
    return db.select()
        .from(accounts)
        .where(eq(accounts.email, email))
        .get();
}

export function addAccount(email: string): Account {
    const existingAccount = getAccountByEmail(email);
    
    if (existingAccount) {
        throw new Error('Account already exists');
    }
    
    return db.insert(accounts)
        .values({ email })
        .returning()
        .get();
}

export function deleteAccount(id: number): void {
    db.delete(accounts).where(eq(accounts.id, id)).run();
}

export function clearAccounts(): void {
    db.delete(accounts).run();
}

export function getAllLogs(): SendLog[] {
    return db.select().from(sendLogs).all();
}

export function addLog(log: Omit<NewSendLog, 'timestamp'>): SendLog {
    if (log.status !== 'success' && log.status !== 'failed') {
        throw new Error(`Invalid status: ${log.status}`);
    }
    
    return db.insert(sendLogs)
        .values({
            email: log.email,
            status: log.status,
            errorMessage: log.errorMessage,
            template: log.template
        })
        .returning()
        .get();
}

// Добавляем проверку статуса в SQL
export function createTables(): void {
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS send_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
            error_message TEXT,
            template TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('SQLite database initialized');
}

// Добавляем функцию для закрытия соединения
export function closeDatabase(): void {
    sqlite.close();
}
