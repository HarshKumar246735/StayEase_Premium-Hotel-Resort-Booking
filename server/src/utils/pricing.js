import { eachNight, weekday } from './dates.js';

export const LONG_STAY_NIGHTS = 5;
export const LONG_STAY_PERCENT = 10;

/** Offer applies only when the seed data supports it (offer.discountPercent present). */
function offerApplies(offer, nightDates) {
  if (!offer || !offer.discountPercent) return false;
  if (offer.type === 'weekend') {
    // needs at least one Friday or Saturday night in the stay
    return nightDates.some((d) => [5, 6].includes(weekday(d)));
  }
  return true;
}

/**
 * Authoritative price calculation. Always executed on the server.
 * All amounts are whole rupees (integers).
 */
export function computePricing({ pricePerNight, nights, rooms, checkIn, offer }) {
  const nightDates = eachNight(checkIn, nights);
  const subtotal = pricePerNight * nights * rooms;

  let discountPercent = 0;
  let discountLabel = '';
  if (offerApplies(offer, nightDates)) {
    discountPercent = offer.discountPercent;
    discountLabel = offer.label || 'Special offer';
  }
  if (nights >= LONG_STAY_NIGHTS && LONG_STAY_PERCENT > discountPercent) {
    discountPercent = LONG_STAY_PERCENT;
    discountLabel = 'Long-stay discount';
  }

  const discount = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discount;
  // Simplified demo tax slab by nightly room price
  const taxRate = pricePerNight >= 7500 ? 0.18 : 0.12;
  const taxes = Math.round(taxable * taxRate);
  const total = taxable + taxes;

  return {
    pricePerNight,
    nights,
    rooms,
    subtotal,
    discountPercent,
    discountLabel,
    discount,
    taxRate,
    taxes,
    total,
    currency: 'INR',
  };
}
