/**
 * Live weather at restaurant coords via Open-Meteo (no API key).
 * Sheet WeatherSurcharge amounts are applied only for the matching status.
 * Night uses restaurant local time (20:00–06:00), not the weather API.
 */

const CACHE_MS = 10 * 60 * 1000;
const cache = new Map();
export const STATUS_LABELS = {
  clear: 'Clear',
  cloudy: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  heavyrain: 'Heavy rain',
  storm: 'Thunderstorm',
  snow: 'Snow',
  night: 'Night',
};

function cacheKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function weatherStatusFromCode(code, rain, precip, snow) {
  if (snow >= 0.5 || [71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  if (
    precip >= 1.5 ||
    rain >= 1.5 ||
    [63, 65, 66, 67, 81, 82].includes(code)
  ) {
    return 'heavyrain';
  }
  if ([61, 80].includes(code)) return 'rain';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([45, 48].includes(code)) return 'fog';
  if ([2, 3].includes(code)) return 'cloudy';
  if ([0, 1].includes(code)) return 'clear';
  return null;
}

export function isNightHour(date, timeZone) {
  try {
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: timeZone || 'Asia/Kolkata',
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(date)
    );
    return Number.isFinite(hour) && (hour >= 20 || hour < 6);
  } catch {
    const hour = date.getHours();
    return hour >= 20 || hour < 6;
  }
}

export async function fetchRestoWeather(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, status: null, isNight: isNightHour(new Date(), 'Asia/Kolkata') };
  }

  const key = cacheKey(lat, lng);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return {
      ...hit.value,
      isNight: isNightHour(new Date(), hit.value.timeZone),
    };
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lng)}` +
      `&current=weather_code,precipitation,rain,snowfall` +
      `&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      return { ok: false, status: null, isNight: isNightHour(new Date(), 'Asia/Kolkata') };
    }
    const data = await res.json();
    const current = data?.current || {};
    const code = Number(current.weather_code);
    const status = weatherStatusFromCode(
      Number.isFinite(code) ? code : -1,
      Number(current.rain) || 0,
      Number(current.precipitation) || 0,
      Number(current.snowfall) || 0
    );
    const timeZone = data?.timezone || 'Asia/Kolkata';
    const value = { ok: true, status, timeZone };
    cache.set(key, { at: Date.now(), value });
    return { ...value, isNight: isNightHour(new Date(), timeZone) };
  } catch {
    return { ok: false, status: null, isNight: isNightHour(new Date(), 'Asia/Kolkata') };
  }
}

export function formatWeatherStatus(status, isNight) {
  const parts = [];
  if (status && STATUS_LABELS[status]) parts.push(STATUS_LABELS[status]);
  else if (!isNight) parts.push('Clear');
  if (isNight) parts.push(STATUS_LABELS.night);
  return parts.join(' · ');
}

export function formatSurchargeSentence(lines, totalAmount) {
  if (!lines?.length || !(totalAmount > 0)) return '';
  const tail = ', on top of your distance charge';
  if (lines.length === 1) {
    return `We're charging ₹${lines[0].amount} extra for ${lines[0].label.toLowerCase()} delivery${tail}`;
  }
  const parts = lines.map(
    (line) => `₹${line.amount} for ${line.label.toLowerCase()}`
  );
  const last = parts.pop();
  return `We're charging ${parts.join(' and ')} and ${last} (₹${totalAmount} total)${tail}`;
}

/** Short label for UI, e.g. "Night" or "Rain · Night". */
export function formatSurchargeLabel(lines, fallbackReason = '') {
  const fromLines = (lines || [])
    .map((line) => line.label)
    .filter(Boolean);
  if (fromLines.length) return fromLines.join(' · ');

  const reason = String(fallbackReason || '').toLowerCase();
  if (!reason) return '';
  const found = [];
  Object.entries(STATUS_LABELS).forEach(([key, label]) => {
    if (reason.includes(label.toLowerCase()) || reason.includes(key)) {
      found.push(label);
    }
  });
  return [...new Set(found)].join(' · ');
}

/**
 * Applies WeatherSurcharge map. Weather + night can both apply and are added.
 * Unknown weather → no weather fee. Night still applies if the night key is set.
 */
export function resolveWeatherSurcharge(delivery, weather) {
  const fees = delivery?.weatherFees || {};
  const lines = [];
  let amount = 0;

  const status = weather?.ok ? weather.status : null;
  const weatherFee = status != null ? Number(fees[status]) || 0 : 0;
  if (weatherFee > 0) {
    amount += weatherFee;
    lines.push({
      key: status,
      label: STATUS_LABELS[status] || status,
      amount: weatherFee,
    });
  }

  const nightFee = weather?.isNight ? Number(fees.night) || 0 : 0;
  if (nightFee > 0) {
    amount += nightFee;
    lines.push({
      key: 'night',
      label: STATUS_LABELS.night,
      amount: nightFee,
    });
  }

  return {
    amount,
    lines,
    label: formatSurchargeLabel(lines),
    reason: formatSurchargeSentence(lines, amount),
  };
}
