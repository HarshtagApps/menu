function inAmountRange(amount, min, max) {
  return amount >= min && (max === Infinity || amount <= max);
}

function parseOrderBand(part) {
  const openNa = part.match(/^(\d+(?:\.\d+)?)\s*\+\s*:\s*NA$/i);
  if (openNa) {
    return {
      minAmount: Number(openNa[1]),
      maxAmount: Infinity,
      ratePerKm: null,
      notAllowed: true,
    };
  }

  const open = part.match(/^(\d+(?:\.\d+)?)\s*\+\s*:\s*(\d+(?:\.\d+)?)$/);
  if (open) {
    return {
      minAmount: Number(open[1]),
      maxAmount: Infinity,
      ratePerKm: Number(open[2]),
      notAllowed: false,
    };
  }

  const closedNa = part.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*:\s*NA$/i);
  if (closedNa) {
    return {
      minAmount: Number(closedNa[1]),
      maxAmount: Number(closedNa[2]),
      ratePerKm: null,
      notAllowed: true,
    };
  }

  const closed = part.match(
    /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/
  );

  if (!closed) return null;
  return {
    minAmount: Number(closed[1]),
    maxAmount: Number(closed[2]),
    ratePerKm: Number(closed[3]),
    notAllowed: false,
  };
}

/** Min cart from NA bands — e.g. 0-200:NA → must order more than ₹200 */

function deriveMinOrder(orderRates, explicitMinOrder) {
  if (Number.isFinite(explicitMinOrder)) return explicitMinOrder;
  let minOrder = null;
  for (const r of orderRates || []) {
    if (!r.notAllowed) continue;
    if (r.maxAmount === Infinity) continue;
    if (minOrder == null || r.maxAmount > minOrder) minOrder = r.maxAmount;
  }

  return minOrder;
}

export function parseDelivery(raw) {
  if (raw == null) return null;
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
  const minOrderMatch = text.match(/MinOrder\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  const maxKmMatch = text.match(/MaxKm\s*\(\s*(\d+(?:\.\d+)?)\s*\)/i);
  const discountMatch = text.match(/Discount\s*\(([^)]*)\)/i);
  if (!chargesMatch || !coordsMatch) return null;
  const parts = chargesMatch[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  let mode = 'distance';
  let maxKm = maxKmMatch ? Number(maxKmMatch[1]) : null;
  const body = [...parts];
  if (body[0] && /^(order|distance)$/i.test(body[0])) {
    mode = body.shift().toLowerCase();
  }

  const filtered = [];
  for (const part of body) {
    const mk = part.match(/^maxKm\s*:\s*(\d+(?:\.\d+)?)$/i);
    if (mk) {
      maxKm = Number(mk[1]);
      continue;
    }

    filtered.push(part);
  }

  let slabs = [];
  let orderRates = [];
  if (mode === 'order') {
    orderRates = filtered.map(parseOrderBand).filter(Boolean).sort((a, b) => a.minAmount - b.minAmount);
    if (orderRates.length === 0) return null;
  } else {

    slabs = filtered
      .map((part) => {
        const m = part.match(
          /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/
        );

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
  }

  const lat = Number(coordsMatch[1]);
  const lng = Number(coordsMatch[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const weatherFees = {};
  if (weatherFeesMatch) {
    weatherFeesMatch[1].split(',').forEach((part) => {
      const m = part.trim().match(/^([a-z]+)\s*:\s*(\d+(?:\.\d+)?)$/i);
      if (m) weatherFees[m[1].toLowerCase()] = Number(m[2]);
    });

  } else if (surchargeMatch) {

    weatherFees.heavyrain = Number(surchargeMatch[1]);
    weatherFees.storm = Number(surchargeMatch[1]);
    weatherFees.snow = Number(surchargeMatch[1]);
  }

  const explicitMin = minOrderMatch ? Number(minOrderMatch[1]) : null;
  const minOrder = deriveMinOrder(
    orderRates,
    Number.isFinite(explicitMin) ? explicitMin : null
  );

  const discountBands = [];
  if (discountMatch) {
    discountMatch[1].split(',').forEach((part) => {
      const p = part.trim();
      if (!p) return;
      // 1501+:100  or  1501-2000+:100  (open-ended)
      const open = p.match(
        /^(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*\+\s*:\s*(\d+(?:\.\d+)?)$/
      );
      if (open) {
        discountBands.push({
          minAmount: Number(open[1]),
          maxAmount: Infinity,
          step: Number(open[2]),
        });
        return;
      }
      const closed = p.match(
        /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/
      );
      if (!closed) return;
      discountBands.push({
        minAmount: Number(closed[1]),
        maxAmount: Number(closed[2]),
        step: Number(closed[3]),
      });
    });
    discountBands.sort((a, b) => a.minAmount - b.minAmount);
  }

  return {
    mode,
    slabs,
    orderRates,
    minOrder,
    discountBands: discountBands.length ? discountBands : null,
    maxKm: Number.isFinite(maxKm) ? maxKm : null,
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

/** Cart subtotal from orderDetails.items */

export function cartTotalFromItems(items) {
  return Object.values(items || {}).reduce((acc, sizes) => {
    return (
      acc +
      Object.values(sizes || {}).reduce(
        (sum, entry) =>
          sum + (Number(entry?.quantity) || 0) * (Number(entry?.price) || 0),
        0
      )
    );

  }, 0);

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

/** Reuse cached road km if pin moved less than this (meters). */
export const DELIVERY_REUSE_RADIUS_M = 200;

/**
 * True when previous road distance can be reused for a nearby pin move.
 */
export function canReuseDeliveryDistance(
  prevCoords,
  prevDistanceKm,
  nextLat,
  nextLng,
  radiusM = DELIVERY_REUSE_RADIUS_M
) {
  if (
    !prevCoords ||
    !Number.isFinite(prevDistanceKm) ||
    !Number.isFinite(prevCoords.lat) ||
    !Number.isFinite(prevCoords.lng) ||
    !Number.isFinite(nextLat) ||
    !Number.isFinite(nextLng)
  ) {
    return false;
  }
  const movedM =
    haversineKm(prevCoords.lat, prevCoords.lng, nextLat, nextLng) * 1000;
  return movedM < radiusM;
}

export async function roadDistanceKm(fromLat, fromLng, toLat, toLng) {
  if (![fromLat, fromLng, toLat, toLng].every((n) => Number.isFinite(n))) {
    const err = new Error('Invalid coordinates');
    err.code = 'ORS_INVALID';
    throw err;
  }

  const endpoint =
    import.meta.env.VITE_DELIVERY_DISTANCE_URL ||
    'https://harshtag-resto.vercel.app/api/delivery-distance';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromLat, fromLng, toLat, toLng }),
    });

    if (!res.ok) {
      const err = new Error(`Distance API HTTP ${res.status}`);
      err.code = res.status === 429 ? 'ORS_RATE' : 'ORS_HTTP';
      throw err;
    }

    const data = await res.json();
    const km = data?.distanceKm;
    if (!Number.isFinite(km)) {
      const err = new Error('No road route found');
      err.code = 'ORS_NO_ROUTE';
      throw err;
    }

    return km;
  } catch (err) {

    if (err?.code) throw err;
    const out = new Error(
      err?.name === 'AbortError' ? 'Route timed out' : 'Route failed'
    );

    out.code = err?.name === 'AbortError' ? 'ORS_TIMEOUT' : 'ORS_ERROR';
    throw out;
  } finally {

    clearTimeout(timer);
  }

}

/**
 * Resolve delivery base charge.
 * @returns {{ charge: number|null, outOfRange: boolean, belowMinOrder: boolean, ratePerKm: number|null, minOrder: number|null }}
 */

export function resolveDeliveryCharge(delivery, distanceKm, cartTotal = 0) {
  const empty = {
    charge: null,
    outOfRange: true,
    belowMinOrder: false,
    ratePerKm: null,
    minOrder: null,
  };

  if (!Number.isFinite(distanceKm) || distanceKm < 0) return empty;
  const isLegacySlabs = Array.isArray(delivery);
  const mode = isLegacySlabs ? 'distance' : delivery?.mode || 'distance';
  const slabs = isLegacySlabs ? delivery : delivery?.slabs;
  const orderRates = isLegacySlabs ? null : delivery?.orderRates;
  const minOrder = isLegacySlabs ? null : delivery?.minOrder;
  const maxKm = isLegacySlabs ? null : delivery?.maxKm;
  if (mode === 'order') {
    if (!orderRates?.length) return empty;
    if (maxKm != null && distanceKm > maxKm) {
      return { ...empty, outOfRange: true, minOrder };
    }

    // Prefer a priced band over NA when boundaries overlap (e.g. 200 in both 0-200:NA and 200-400:20)
    const rate = orderRates.find(
      (r) =>
        !r.notAllowed &&
        inAmountRange(cartTotal, r.minAmount, r.maxAmount)
    );

    if (rate) {
      // Bill whole km only; fractional km shown as a "discount".
      const grossCharge = Math.round(distanceKm * rate.ratePerKm);
      const charge = Math.floor(distanceKm) * rate.ratePerKm;
      const discount = Math.max(0, grossCharge - charge);
      return {
        charge,
        grossCharge,
        discount,
        outOfRange: false,
        belowMinOrder: false,
        ratePerKm: rate.ratePerKm,
        minOrder,
      };
    }

    const blocked = orderRates.find(
      (r) =>
        r.notAllowed && inAmountRange(cartTotal, r.minAmount, r.maxAmount)
    );

    if (blocked || (minOrder != null && cartTotal < minOrder)) {
      return {
        charge: null,
        outOfRange: false,
        belowMinOrder: true,
        ratePerKm: null,
        minOrder:
          blocked && blocked.maxAmount !== Infinity
            ? blocked.maxAmount
            : minOrder,
      };
    }

    return {
      charge: null,
      outOfRange: false,
      belowMinOrder: true,
      ratePerKm: null,
      minOrder,
    };
  }

  if (minOrder != null && cartTotal < minOrder) {
    return {
      charge: null,
      outOfRange: false,
      belowMinOrder: true,
      ratePerKm: null,
      minOrder,
    };
  }

  if (!slabs?.length) return empty;
  const sorted = [...slabs].sort((a, b) => a.maxKm - b.maxKm);
  for (const s of sorted) {
    if (distanceKm <= s.maxKm) {
      return {
        charge: s.charge,
        outOfRange: false,
        belowMinOrder: false,
        ratePerKm: null,
        minOrder,
      };
    }

  }

  return { ...empty, minOrder };
}

/**
 * Round payable down to band step (e.g. 50 or 100).
 * Discount(1000-1500:50,1501-2000+:100)
 * @returns {{ rounded: number, discount: number }}
 */
export function resolveRoundOffDiscount(total, bands) {
  if (!Number.isFinite(total) || total < 0 || !bands?.length) {
    return { rounded: total, discount: 0 };
  }
  const band = bands.find(
    (b) => total >= b.minAmount && (b.maxAmount === Infinity || total <= b.maxAmount)
  );
  if (!band || !Number.isFinite(band.step) || band.step <= 0) {
    return { rounded: total, discount: 0 };
  }
  const rounded = Math.floor(total / band.step) * band.step;
  return {
    rounded,
    discount: Math.max(0, Math.round((total - rounded) * 100) / 100),
  };
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
    belowMinOrder: false,
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
