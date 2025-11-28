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

app.get('/products', async (c) => {
    const db = createDbD1(c.env.DB);

    const products = await db.select().from(schema.products);

    return c.ApiResponse({ products });
});

app.post('/products', async (c) => {
    const { name, price } = await c.req.json();
    const db = createDbD1(c.env.DB);

    const result = await db
        .insert(schema.products)
        .values({
            name,
            price,
            created_at: new Date()
        })
        .returning();

    return c.ApiResponse({ product: result[0] }, 201);
});

app.get('/products/:id', async (c) => {
    const id = Number.parseInt(c.req.param('id'));
    const db = createDbD1(c.env.DB);

    const product = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, id))
        .limit(1);

    if (product.length === 0) {
        throw new HTTPException(404, {
            message: 'Product not found'
        });
    }

    return c.ApiResponse({ product: product[0] });
});

export default app;
