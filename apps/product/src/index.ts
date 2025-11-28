import { Hono } from 'hono';
import { createDbD1, schema } from '@repo/db';
import { eq } from 'drizzle-orm';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/health', (c) => c.json({ ok: true }));

app.get('/products', async (c) => {
    const db = createDbD1(c.env.DB);

    const products = await db.select().from(schema.products);

    return c.json({ products });
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

    return c.json({ product: result[0] });
});

app.get('/products/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const db = createDbD1(c.env.DB);

    const product = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, id))
        .limit(1);

    if (product.length === 0) {
        return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({ product: product[0] });
});

export default app;
