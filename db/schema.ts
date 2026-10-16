// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const imports = sqliteTable('imports', {
 id: text('id').primaryKey(), userId: text('user_id').notNull(), billingMonth: text('billing_month').notNull(),
 hash: text('hash').notNull(), status: text('status').notNull(), result: text('result'), createdAt: text('created_at').notNull(),
});
export const schedules = sqliteTable('schedules', {
 id: text('id').primaryKey(), userId: text('user_id').notNull(), month: text('month').notNull(),
 name: text('name').notNull(), days: text('days').notNull(), updatedAt: text('updated_at').notNull(),
});
export const subscriptions = sqliteTable('subscriptions', {
 endpoint: text('endpoint').primaryKey(), userId: text('user_id').notNull(), subscription: text('subscription').notNull(),
 enabled: integer('enabled').notNull().default(1), createdAt: text('created_at').notNull(),
});
export const deliveries = sqliteTable('deliveries', {
 id: text('id').primaryKey(), userId: text('user_id').notNull(), day: text('day').notNull(),
 status: text('status').notNull(), updatedAt: text('updated_at').notNull(),
});
export const reminderCopy = sqliteTable('reminder_copy', {
 day: text('day').primaryKey(), message: text('message'), status: text('status').notNull(),
 createdAt: text('created_at').notNull(),
});
