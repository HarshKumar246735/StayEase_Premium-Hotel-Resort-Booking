export function formatMoney(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
}

// Server dates are UTC midnight, so always format in UTC to avoid off-by-one days.
export function formatDate(value, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
}

export const pad = (n) => String(n).padStart(2, '0');
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISODate(new Date());

export function addDaysISO(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

export function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const diff = (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000;
  return Number.isFinite(diff) ? Math.round(diff) : 0;
}

export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#102238"/><stop offset="1" stop-color="#06111F"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="none" stroke="#F2BE62" stroke-width="10" stroke-linejoin="round" opacity=".85"><path d="M330 330 400 265l70 65v75h-48v-48h-44v48h-48z"/></g><text x="400" y="480" text-anchor="middle" font-family="Arial" font-size="32" fill="#A7B5C7">StayEase</text></svg>`,
  );

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=75';
export const AUTH_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=75';

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || 'U';

export function recentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem('stayease_recent') || '[]');
  } catch {
    return [];
  }
}
export function trackViewed(h) {
  try {
    const item = { slug: h.slug, name: h.name, city: h.city, country: h.country, image: h.images?.[0], pricePerNight: h.pricePerNight };
    const list = [item, ...recentlyViewed().filter((x) => x.slug !== h.slug)].slice(0, 6);
    localStorage.setItem('stayease_recent', JSON.stringify(list));
  } catch {
    /* storage unavailable: ignore */
  }
}

export const AMENITY_OPTIONS = ['Wi-Fi', 'Swimming Pool', 'Spa', 'Restaurant', 'Parking', 'Fitness Center', 'Air Conditioning', 'Airport Shuttle', 'Beach Access'];
export const PROPERTY_TYPES = ['Hotel', 'Resort', 'Villa', 'Apartment', 'Boutique', 'Heritage', 'Homestay', 'Lodge', 'Cabin'];
