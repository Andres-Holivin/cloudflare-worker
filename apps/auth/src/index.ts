import { Hono } from 'hono';
import { createDbD1, schema } from '@repo/db';
import { hashPassword, verifyPassword, generateToken } from '@repo/utils';
import { eq } from 'drizzle-orm';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/health', (c) => c.json({ ok: true }));

app.post('/register', async (c) => {
    const { email, password } = await c.req.json();
    const db = createDbD1(c.env.DB);

    const hashedPassword = hashPassword(password);

    const result = await db
        .insert(schema.users)
        .values({
            email,
            password: hashedPassword,
            created_at: new Date()
        })
        .returning();

    return c.json({ user: { id: result[0].id, email: result[0].email } });
});

app.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    const db = createDbD1(c.env.DB);

    const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

    if (user.length === 0 || !verifyPassword(password, user[0].password)) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user[0].id);

    return c.json({ token, user: { id: user[0].id, email: user[0].email } });
});

app.get('/me', async (c) => {
    const auth = c.req.header('Authorization');

    if (!auth) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user: { id: 1, email: 'user@example.com' } });
});

export default app;
