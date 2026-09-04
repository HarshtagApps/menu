/**
 * Parse sheet Delivery cell (line breaks allowed):
 *
 * DeliveryCharges(0-5:0,6-10:20,11-15:30),
 * RestoCoords(32.263601,75.675779),
 * WeatherSurcharge(clear:0,cloudy:0,fog:10,drizzle:10,rain:20,heavyrain:30,storm:40,snow:40,night:15)
 */
export function parseDelivery(raw) {
  if (raw == null) return null;
  // Collapse newlines / CR so the cell can be multi-line in Google Sheets
  const text = String(raw)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;

  const chargesMatch = text.match(/DeliveryCharges\s*\(([^)]*)\)/i);
  const coordsMatch = text.match(/RestoCoords\s*\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/i);
  const weatherFeesMatch = text.match(/WeatherSurcharge\s*\(([^)]*)\)/i);
  const surchargeMatch = text.match(/DeliverySurcharge\s*\(\s*(\d+(?:\.\d+)?)\s*:\s*([^)]+)\)/i);

  if (!chargesMatch || !coordsMatch) return null;

  const slabs = chargesMatch[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
      if (!m) return null;
      return {
        minKm: Number(m[1]),
        maxKm: Number(m[2]),
        charge: Number(m[3]),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.maxKm - b.maxKm);

  if (slabs.length === 0) return null;

  const lat = Number(coordsMatch[1]);
  const lng = Number(coordsMatch[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const weatherFees = {};
  if (weatherFeesMatch) {
    weatherFeesMatch[1].split(',').forEach((part) => {
      const m = part.trim().match(/^([a-z]+)\s*:\s*(\d+(?:\.\d+)?)$/i);
      if (!m) return;
      weatherFees[m[1].toLowerCase()] = Number(m[2]);
    });
  } else if (surchargeMatch) {
    weatherFees.heavyrain = Number(surchargeMatch[1]);
    weatherFees.storm = Number(surchargeMatch[1]);
    weatherFees.snow = Number(surchargeMatch[1]);
  }

  return {
    slabs,
    coords: { lat, lng },
    weatherFees: Object.keys(weatherFees).length ? weatherFees : null,
    surcharge: surchargeMatch
      ? {
          amount: Number(surchargeMatch[1]),
          reason: surchargeMatch[2].trim(),
        }
      : null,
  };
}

/** Straight-line distance in km (haversine). */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Resolve distance to a slab charge.
 * Slabs are treated as cumulative max bands (0–5, then up to 10, then up to 15).
 * @returns {{ charge: number, outOfRange: false } | { charge: null, outOfRange: true }}
 */
export function resolveDeliveryCharge(slabs, distanceKm) {
  if (!slabs?.length || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return { charge: null, outOfRange: true };
  }
  const sorted = [...slabs].sort((a, b) => a.maxKm - b.maxKm);
  for (const s of sorted) {
    if (distanceKm <= s.maxKm) {
      return { charge: s.charge, outOfRange: false };
    }
  }
  return { charge: null, outOfRange: true };
}

export function emptyDeliveryState() {
  return {
    status: 'idle',
    distanceKm: null,
    baseCharge: null,
    surcharge: 0,
    surchargeReason: '',
    surchargeLabel: '',
    surchargeLines: [],
    outOfRange: false,
    coords: null,
    accuracy: null,
  };
}

/** Request browser geolocation; returns { lat, lng, accuracy } or throws with .code. */
export function requestUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported');
      err.code = 'GEO_UNSUPPORTED';
      reject(err);
      return;
    }
    // Browsers only allow geolocation on HTTPS, localhost, or 127.0.0.1
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const err = new Error('Location needs a secure connection');
      err.code = 'GEO_INSECURE';
      reject(err);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (geoErr) => {
        const err = new Error(geoErr.message || 'Location denied');
        if (geoErr.code === 1) err.code = 'GEO_DENIED';
        else if (geoErr.code === 2) err.code = 'GEO_UNAVAILABLE';
        else if (geoErr.code === 3) err.code = 'GEO_TIMEOUT';
        else err.code = 'GEO_ERROR';
        reject(err);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      }
    );
  });
}
