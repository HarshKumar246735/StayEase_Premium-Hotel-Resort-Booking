// All stay dates are "date-only" strings (YYYY-MM-DD). A stay of N nights occupies the N nights
// starting on check-in; the check-out day itself is NOT occupied, so a booking ending on June 10
// never blocks another one that starts on June 10.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateStr(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(checkIn, checkOut) {
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

export function eachNight(checkIn, nights) {
  return Array.from({ length: nights }, (_, i) => addDays(checkIn, i));
}

/** "Today" in the business time zone as YYYY-MM-DD. */
export function todayStr(tzOffsetMinutes = 330, now = new Date()) {
  return new Date(now.getTime() + tzOffsetMinutes * 60000).toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekday(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}
