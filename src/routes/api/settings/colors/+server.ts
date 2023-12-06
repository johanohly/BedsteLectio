import { validateCookie } from "$lib/server/cookie";
import { settings } from "$lib/server/schema";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals: { db, redis } }) => {
    if (!db || !redis) return json({});

    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const userId = await validateCookie(cookie);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = await request.json();
    if (!body) return new Response("Bad Request", { status: 400 });

    if (body.custom_colors) {
        const customColors = body.custom_colors;
        const row = await db.insert(settings).values({ id: userId, customColors }).onConflictDoUpdate({ target: settings.id, set: { customColors } }).returning();
        await redis.set(`settings:${userId}`, JSON.stringify(row), "EX", 60 * 60 * 24 * 7);
    }
    return json({});
};