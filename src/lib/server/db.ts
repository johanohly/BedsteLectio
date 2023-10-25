import { POSTGRES_URL } from "$env/static/private";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const pool = new pg.Pool({ // pg is commonjs for some reason
    connectionString: POSTGRES_URL,
});
// const client = await pool.connect();
// const db = drizzle(client);
// await migrate(db, { migrationsFolder: "drizzle" })

export const createDbClient = async () => await pool.connect()
