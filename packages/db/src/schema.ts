import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const products = sqliteTable('products', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    price: integer('price').notNull(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const profiles = sqliteTable('profiles', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id').notNull().references(() => users.id),
    name: text('name').notNull(),
    bio: text('bio')
});
