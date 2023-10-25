import type { Config } from "drizzle-kit";

export default {
    schema: "src/lib/server/schema.ts",
    out: "drizzle",
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.POSTGRES_URL,
    }
} satisfies Config;