import crypto from 'crypto';
import { Inventory } from '../models/Inventory.js';
import { startOfTodayUTC } from '../models/Booking.js';
import { ApiError } from '../utils/http.js';

const DAY = 24 * 60 * 60 * 1000;
export const MAX_NIGHTS = 30;
export const MAX_ROOMS = 5;

export function parseDay(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    throw new ApiError(400, `${label} must be a valid date (YYYY-MM-DD).`);
  }
  const d = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, `${label} must be a valid date.`);
  return d;
}

/** A stay occupies the nights [checkIn, checkOut). The check-out day itself stays free for the next guest. */
export function validateStay(checkInRaw, checkOutRaw) {
  const checkIn = parseDay(checkInRaw, 'Check-in');
  const checkOut = parseDay(checkOutRaw, 'Check-out');
  const today = startOfTodayUTC();
  if (checkIn < today) throw new ApiError(400, 'Check-in date cannot be in the past.');
  if (checkIn.getTime() > today.getTime() + 365 * DAY) throw new ApiError(400, 'Bookings open up to one year ahead.');
  const nights = Math.round((checkOut - checkIn) / DAY);
  if (nights < 1) throw new ApiError(400, 'Check-out must be after check-in.');
  if (nights > MAX_NIGHTS) throw new ApiError(400, `Stays are limited to ${MAX_NIGHTS} nights.`);
  return { checkIn, checkOut, nights };
}

export function nightDates(checkIn, nights) {
  return Array.from({ length: nights }, (_, i) => new Date(checkIn.getTime() + i * DAY));
}

export async function remainingByRoomType(hotel, checkIn, nights) {
  const dates = nightDates(checkIn, nights);
  const rows = await Inventory.aggregate([
    { $match: { hotel: hotel._id, date: { $in: dates } } },
    { $group: { _id: '$roomTypeId', maxBooked: { $max: '$booked' } } },
  ]);
  const booked = new Map(rows.map((r) => [String(r._id), r.maxBooked]));
  return new Map(hotel.roomTypes.map((rt) => [String(rt._id), Math.max(0, rt.totalRooms - (booked.get(String(rt._id)) || 0))]));
}

export async function releaseRooms(hotelId, roomTypeId, dates, rooms) {
  if (!dates.length) return;
  await Inventory.updateMany(
    { hotel: hotelId, roomTypeId, date: { $in: dates }, booked: { $gte: rooms } },
    { $inc: { booked: -rooms } },
  );
}

/** Atomically takes `rooms` units for every night, or takes nothing. */
export async function reserveRooms(hotelId, roomType, dates, rooms) {
  const reserved = [];
  try {
    for (const date of dates) {
      let updated = null;
      try {
        updated = await Inventory.findOneAndUpdate(
          { hotel: hotelId, roomTypeId: roomType._id, date, booked: { $lte: roomType.totalRooms - rooms } },
          { $inc: { booked: rooms } },
          { upsert: true, new: true },
        );
      } catch (err) {
        // Duplicate key means the night's document exists but is too full to match our filter.
        if (err.code !== 11000) throw err;
      }
      if (!updated) {
        throw new ApiError(
          409,
          'Sorry, that room is no longer available for all of your selected dates. Please pick different dates or another room type.',
        );
      }
      reserved.push(date);
    }
  } catch (err) {
    await releaseRooms(hotelId, roomType._id, reserved, rooms);
    throw err;
  }
}

export function offerApplies(offer, checkIn, nights) {
  if (!offer?.kind || !offer.discountPercent) return false;
  if (nights < (offer.minNights || 1)) return false;
  if (offer.kind === 'weekend') {
    const dow = checkIn.getUTCDay();
    return dow === 5 || dow === 6; // Friday or Saturday arrival
  }
  return true;
}

/** The only place booking prices are calculated. The client never supplies totals. */
export function computePricing(hotel, roomType, nights, rooms, checkIn) {
  const pricePerNight = roomType.pricePerNight;
  const subtotal = pricePerNight * nights * rooms;
  const applies = offerApplies(hotel.offer, checkIn, nights);
  const discount = applies ? Math.round((subtotal * hotel.offer.discountPercent) / 100) : 0;
  const taxable = subtotal - discount;
  const taxRatePercent = pricePerNight <= 7500 ? 12 : 18; // simplified GST-style slab for the demo
  const taxes = Math.round((taxable * taxRatePercent) / 100);
  return {
    pricePerNight,
    nights,
    rooms,
    subtotal,
    discountLabel: applies ? hotel.offer.label : '',
    discount,
    taxRatePercent,
    taxes,
    total: taxable + taxes,
    currency: hotel.currency || 'INR',
  };
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateReference() {
  const bytes = crypto.randomBytes(8);
  return `SE-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')}`;
}

export const generateVerificationCode = () => crypto.randomBytes(16).toString('hex');
export const generateDemoTransactionId = () => `DEMO-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
