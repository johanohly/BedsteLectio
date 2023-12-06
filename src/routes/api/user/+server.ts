import { validateCookie } from "$lib/server/cookie";
import { settings } from "$lib/server/schema";
import type { RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const DELETE: RequestHandler = async ({ request, locals: { db } }) => {
    if (!db) return new Response("OK", { status: 200 });

    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const userId = await validateCookie(cookie);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    await db.delete(settings).where(eq(settings.id, userId));
    return new Response("OK", { status: 200 });
};