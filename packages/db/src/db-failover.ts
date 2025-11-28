import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

type DrizzleDB = ReturnType<typeof drizzle>;

type QueryFn<T> = (ctx: {
    db: DrizzleDB;
    sql: ReturnType<typeof postgres>;
}) => Promise<T>;

/**
 * Hybrid failover function:
 * - ctx.db  => Drizzle ORM
 * - ctx.sql => raw postgres client
 */
export async function queryWithFailover<T>(
    env: any,
    callback: QueryFn<T>
): Promise<T> {
    const clients = [
        postgres(env.HYPERDRIVE1),
        postgres(env.HYPERDRIVE2),
        postgres(env.HYPERDRIVE3),
    ];

    const order = clients.sort(() => Math.random() - 0.5);

    let lastError: any;

    for (const client of order) {
        try {
            console.log("✅ Trying DB instance...");

            const db = drizzle(client);

            return await callback({
                db,
                sql: client,
            });
        } catch (e: any) {
            console.warn("❌ DB failed, trying next...", e?.message);
            lastError = e;
        }
    }

    throw new Error(
        `All DB connections failed${lastError?.message ? `: ${lastError.message}` : ""}`
    );
}
