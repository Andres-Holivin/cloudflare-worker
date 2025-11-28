import { Hono } from 'hono';
import { createDbD1, schema } from '@repo/db';
import { eq } from 'drizzle-orm';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/health', (c) => c.json({ ok: true }));

app.get('/profile', async (c) => {
    const userId = 1;
    const db = createDbD1(c.env.DB);

    const profile = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.user_id, userId))
        .limit(1);

    if (profile.length === 0) {
        return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile: profile[0] });
});

app.put('/profile', async (c) => {
    const userId = 1;
    const { name, bio } = await c.req.json();
    const db = createDbD1(c.env.DB);

    const existingProfile = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.user_id, userId))
        .limit(1);

    if (existingProfile.length === 0) {
        const result = await db
            .insert(schema.profiles)
            .values({
                user_id: userId,
                name,
                bio
            })
            .returning();

        return c.json({ profile: result[0] });
    } else {
        const result = await db
            .update(schema.profiles)
            .set({ name, bio })
            .where(eq(schema.profiles.user_id, userId))
            .returning();

        return c.json({ profile: result[0] });
    }
});

export default app;
