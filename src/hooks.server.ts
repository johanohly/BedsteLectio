import { createDbClient } from "$lib/server/db";
import { redis } from "$lib/server/redis";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
    const client = await createDbClient();
    let db = undefined;
    if (client) db = drizzle(client);
    event.locals = { db, redis };

    const response = await resolve(event);
    if (client) client.release();

    return response;
}) satisfies Handle;