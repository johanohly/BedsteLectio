import { json, type RequestHandler } from "@sveltejs/kit";
import { locations } from "./locations";
import { distanceBetween } from "$lib/utilities";
import type { ClosestSchool } from "$lib/types/location";


export const GET: RequestHandler = async ({ request: { url } }) => {
    const params = new URL(url).searchParams;
    if (!params) return new Response(null, { status: 400, statusText: "Bad Request" });
    if (!params.has("lat") || !params.has("lng")) return new Response(null, { status: 400, statusText: "Bad Request" });
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));

    let closest: ClosestSchool | null = null;
    locations.forEach((location) => {
        const distance = distanceBetween({ lat, lng }, { lat: location.lat, lng: location.lng });
        if (!closest || distance < closest.distance) closest = { distance, name: location.name, id: location.id };
    });

    if (!closest) return new Response(null, { status: 404, statusText: "Not Found" });
    return json(closest);
};