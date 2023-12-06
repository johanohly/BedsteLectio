import { POSTGRES_URL } from "$env/static/private";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { migrate } from "drizzle-orm/node-postgres/migrator";

// const client = await pool.connect();
// const db = drizzle(client);
// await migrate(db, { migrationsFolder: "drizzle" })

import pg from "pg";

let pool: pg.Pool | undefined = undefined;
if (POSTGRES_URL !== undefined && POSTGRES_URL !== "") {
    pool = new pg.Pool({ // pg is commonjs for some reason
        connectionString: POSTGRES_URL,
    });
}

export const createDbClient = async (): Promise<pg.PoolClient | undefined> => {
    if (pool === undefined) return undefined;
    try {
        return await pool.connect()
    } catch (e) {
        console.error("Failed to connect to Postgres", e);
        return undefined;
    }
}
