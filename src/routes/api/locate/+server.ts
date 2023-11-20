import { json } from "@sveltejs/kit";
import { locations } from "./locations";
import { distanceBetween } from "$lib/utilities";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request: { url } }) => {
    const params = new URL(url).searchParams;
    if (!params) return new Response(null, { status: 400, statusText: "Bad Request" });
    if (!params.has("lat") || !params.has("lng")) return new Response(null, { status: 400, statusText: "Bad Request" });
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));

    let closest: null | { distance: number, name: string, id: number } = null;
    locations.forEach((location) => {
        const distance = distanceBetween({ lat, lng }, { lat: location.lng, lng: location.lng });
        console.log(location.name, distance)
        if (!closest || distance < closest.distance) closest = { distance, name: location.name, id: location.id };
    });

    if (!closest) return new Response(null, { status: 404, statusText: "Not Found" });
    return json(closest);
};