import { validateCookie } from "$lib/server/cookie";
import { settings } from "$lib/server/schema";
import { decodeUserID } from "$lib/utilities/cookie";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, locals }) => {
    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const userId = await validateCookie(cookie);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const db = locals.db;
    const result = await db.select().from(settings).where(eq(settings.id, userId));
    if (result.length === 0) {
        const insert = await db.insert(settings).values({ id: userId }).returning();
        return json(insert[0]);
    }

    return json(result[0]);
};

export const POST: RequestHandler = async ({ request, locals }) => {
    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const userId = await validateCookie(cookie);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = await request.json();
    if (!body) return new Response("Bad Request", { status: 400 });

    const db = locals.db;
    if (body.custom_colors) {
        const customColors = body.custom_colors;
        await db.insert(settings).values({ id: userId, customColors }).onConflictDoUpdate({ target: settings.id, set: { customColors } });
    }
    return json({});
};