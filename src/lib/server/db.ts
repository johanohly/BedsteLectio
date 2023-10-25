import { POSTGRES_URL } from "$env/static/private";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: POSTGRES_URL,
});

export const createDbClient = async () => await pool.connect()
