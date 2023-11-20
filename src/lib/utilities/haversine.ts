import type { LatLng } from "$lib/types/location";

const { atan2, cos, sin, sqrt, PI } = Math


export const distanceBetween = (a: LatLng, b: LatLng) => {
  const R = 6371e3; // meters
  const φ1 = a.lat * PI / 180; // φ, λ in radians
  const φ2 = b.lat * PI / 180;
  const Δφ = (b.lat - a.lat) * PI / 180;
  const Δλ = (b.lng - a.lng) * PI / 180;

  const x = sin(Δφ / 2) * sin(Δφ / 2) +
    cos(φ1) * cos(φ2) *
    sin(Δλ / 2) * sin(Δλ / 2);
  const y = 2 * atan2(sqrt(x), sqrt(1 - x));

  return R * y; // meters
}