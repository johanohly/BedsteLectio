import { validateCookie } from "$lib/server/cookie";
import { settings } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, locals: { db, redis } }) => {
    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const userId = await validateCookie(cookie);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const cached = await redis.get(`settings:${userId}`);
    if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) return json(parsed[0])
        else return json(parsed);
    }

    const result = await db.select().from(settings).where(eq(settings.id, userId));
    let row = {};
    if (result.length === 0) {
        const insert = await db.insert(settings).values({ id: userId }).returning();
        row = insert[0]
    } else {
        row = result[0];
    }

    await redis.set(`settings:${userId}`, JSON.stringify(row), "EX", 60 * 60 * 24 * 7);
    return json(row);
};
