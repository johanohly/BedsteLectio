import { settings } from "$lib/server/schema";
import { decodeUserID } from "$lib/utilities/cookie";
import { json, type RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ request, locals }) => {
    const cookie = request.headers.get("lectio-cookie");
    if (!cookie) return new Response("Unauthorized", { status: 401 });

    const response = await fetch("https://api.bedstelectio.tech/check-cookie", {
        headers: {
            "lectio-cookie": cookie
        }
    })
    const { valid } = await response.json();
    if (!valid) return new Response("Unauthorized", { status: 401 });

    const userId = decodeUserID(cookie);

    const db = locals.db;
    const result = await db.select().from(settings).where(eq(settings.id, userId));
    if (result.length === 0) {
        console.log("Creating new settings for user", userId)
        const insert = await db.insert(settings).values({ id: userId }).returning();
        return json(insert[0]);
    }

    return json(result[0]);
};