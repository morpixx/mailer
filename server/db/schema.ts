import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const sendLogs = sqliteTable('send_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  status: text('status').notNull(), // 'success' | 'failed'
  errorMessage: text('error_message'),
  template: text('template'),
  timestamp: text('timestamp').default('CURRENT_TIMESTAMP'),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type SendLog = typeof sendLogs.$inferSelect;
export type NewSendLog = typeof sendLogs.$inferInsert;
