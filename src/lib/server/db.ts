import { POSTGRES_URL } from "$env/static/private";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: POSTGRES_URL,
});
// const client = await pool.connect();
// const db = drizzle(client);
// await migrate(db, { migrationsFolder: "drizzle" })

export const createDbClient = async () => await pool.connect()
