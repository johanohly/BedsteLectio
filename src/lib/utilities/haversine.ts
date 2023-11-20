export interface LatLng {
    lat: number
    lng: number
}

const { asin, cos, sin, sqrt, PI } = Math
// equatorial mean radius of Earth (in meters)
const R = 6378137

function squared (x: number): number { return x * x }
function toRad (x: number): number { return x * PI / 180.0 }
function hav (x: number): number {
  return squared(sin(x / 2))
}

export function distanceBetween(a: LatLng, b: LatLng) {
  const aLat = toRad(a.lat)
  const bLat = toRad(b.lat)
  const aLng = toRad(a.lng)
  const bLng = toRad(b.lng)

  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng)
  return 2 * R * asin(sqrt(ht))
}