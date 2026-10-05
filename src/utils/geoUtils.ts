/**
 * Geospatial Mathematics & Utility Helpers
 * Implements the Great-Circle Haversine Formula for high-precision
 * spherical distance calculation between two GPS coordinates (Latitude/Longitude).
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great-Circle Distance using Haversine Formula
 * 
 * Formula:
 * a = sin²(Δφ/2) + cos(φ1) ⋅ cos(φ2) ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 * 
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimals
}

/**
 * Estimates travel arrival time (ETA) based on local road traffic & travel velocity
 * Standard local bike/service van speed ~ 25 km/h in urban streets + 5 min dispatch buffer
 */
export function estimateETA(distanceKm: number, isEmergency: boolean = false): number {
  const averageSpeedKmH = isEmergency ? 38 : 24;
  const dispatchBufferMins = isEmergency ? 3 : 6;
  const travelMins = (distanceKm / averageSpeedKmH) * 60;
  return Math.max(3, Math.round(travelMins + dispatchBufferMins));
}

/**
 * Human-readable distance display (e.g. 450 m or 3.2 km)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format Indian Rupee currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Reverse Geocoding with OpenStreetMap Nominatim with graceful fallback
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      const parts = [
        addr.suburb || addr.neighbourhood || addr.road || addr.village,
        addr.city || addr.town || addr.county,
        addr.state,
      ].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
      return data.display_name?.split(',').slice(0, 3).join(',') || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
    }
  } catch {
    // network timeout or CORS issue fallback
  }

  return `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}
