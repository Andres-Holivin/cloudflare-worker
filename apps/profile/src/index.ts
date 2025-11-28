import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createDbD1, schema } from '@repo/db';
import { apiResponseMiddleware, authMiddleware, registerApiErrorHandler, type AuthVariables } from '@repo/utils';
import { eq } from 'drizzle-orm';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

app.use('*', apiResponseMiddleware);
app.use('*', authMiddleware);
registerApiErrorHandler(app);

app.get('/health', (c) => c.ApiResponse({ ok: true }));

app.get('/profile', async (c) => {
    const userId = c.get('userId');
    const db = createDbD1(c.env.DB);

    const profile = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.user_id, userId))
        .limit(1);

    if (profile.length === 0) {
        throw new HTTPException(404, {
            message: 'Profile not found'
        });
    }

    return c.ApiResponse({ profile: profile[0] });
});

app.put('/profile', async (c) => {
    const userId = c.get('userId');
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

        return c.ApiResponse({ profile: result[0] }, 201);
    } else {
        const result = await db
            .update(schema.profiles)
            .set({ name, bio })
            .where(eq(schema.profiles.user_id, userId))
            .returning();

        return c.ApiResponse({ profile: result[0] });
    }
});

export default app;
