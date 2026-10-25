import { Booking, startOfTodayUTC } from '../models/Booking.js';
import { Hotel } from '../models/Hotel.js';
import { env } from '../config/env.js';
import { ApiError, asyncHandler, clampInt, isEmail, requireId, str } from '../utils/http.js';
import {
  MAX_ROOMS,
  computePricing,
  generateDemoTransactionId,
  generateReference,
  generateVerificationCode,
  nightDates,
  releaseRooms,
  reserveRooms,
  validateStay,
} from '../services/bookingService.js';

const PAYMENT_METHODS = ['demo_upi', 'demo_card', 'pay_at_property'];

function validateGuest(g) {
  if (!g || typeof g !== 'object') throw new ApiError(400, 'Guest details are required.');
  const fullName = str(g.fullName, 80);
  const email = str(g.email, 120).toLowerCase();
  const phone = str(g.phone, 20);
  if (fullName.length < 2) throw new ApiError(400, 'Please enter the lead guest’s full name.');
  if (!isEmail(email)) throw new ApiError(400, 'Please enter a valid guest email address.');
  if (!/^[+\d][\d\s()-]{6,18}$/.test(phone)) throw new ApiError(400, 'Please enter a valid guest phone number.');
  return { fullName, email, phone, specialRequests: str(g.specialRequests, 400) };
}

export const createBooking = asyncHandler(async (req, res) => {
  const body = req.body || {};
  requireId(body.hotelId, 'hotel id');
  requireId(body.roomTypeId, 'room type id');

  const idempotencyKey = str(body.idempotencyKey, 64);
  if (!/^[\w-]{8,64}$/.test(idempotencyKey)) throw new ApiError(400, 'Missing request key. Please refresh and try again.');

  // A repeated submit (double click, retry, flaky network) returns the original booking.
  const existing = await Booking.findOne({ user: req.user._id, idempotencyKey });
  if (existing) return res.status(200).json({ booking: existing, duplicate: true });

  const { checkIn, checkOut, nights } = validateStay(body.checkIn, body.checkOut);
  const adults = clampInt(body.adults, 1, 40, 0);
  const children = clampInt(body.children, 0, 40, 0);
  const rooms = clampInt(body.rooms, 1, MAX_ROOMS, 0);
  if (!adults) throw new ApiError(400, 'At least one adult is required.');
  if (!rooms) throw new ApiError(400, `You can book between 1 and ${MAX_ROOMS} rooms.`);
  if (!PAYMENT_METHODS.includes(body.paymentMethod)) throw new ApiError(400, 'Please choose a payment method.');
  const guest = validateGuest(body.guest);

  const hotel = await Hotel.findOne({ _id: body.hotelId, isActive: true });
  if (!hotel) throw new ApiError(404, 'We could not find that hotel.');
  const roomType = hotel.roomTypes.id(body.roomTypeId);
  if (!roomType) throw new ApiError(400, 'That room type is not offered by this hotel.');
  if (rooms > roomType.totalRooms) throw new ApiError(400, `This hotel has only ${roomType.totalRooms} rooms of this type.`);
  if (adults + children > roomType.capacity * rooms) {
    throw new ApiError(400, `${roomType.name} sleeps ${roomType.capacity} per room. Add rooms or choose a larger room type.`);
  }

  const dates = nightDates(checkIn, nights);
  await reserveRooms(hotel._id, roomType, dates, rooms);

  const pricing = computePricing(hotel, roomType, nights, rooms, checkIn);
  const payAtProperty = body.paymentMethod === 'pay_at_property';

  let booking;
  try {
    for (let attempt = 0; attempt < 3 && !booking; attempt += 1) {
      try {
        booking = await Booking.create({
          reference: generateReference(),
          verificationCode: generateVerificationCode(),
          idempotencyKey,
          user: req.user._id,
          hotel: hotel._id,
          roomTypeId: roomType._id,
          snapshot: {
            hotelName: hotel.name,
            hotelSlug: hotel.slug,
            city: hotel.city,
            country: hotel.country,
            address: hotel.address,
            image: hotel.images[0],
            roomTypeName: roomType.name,
            bedType: roomType.bedType,
            freeCancellation: hotel.freeCancellation,
            cancellationPolicy: hotel.cancellationPolicy,
            checkInTime: hotel.checkInTime,
            checkOutTime: hotel.checkOutTime,
          },
          checkIn,
          checkOut,
          adults,
          children,
          rooms,
          guest,
          pricing,
          payment: {
            method: body.paymentMethod,
            status: payAtProperty ? 'pay_at_property' : 'demo_paid',
            demoTransactionId: payAtProperty ? undefined : generateDemoTransactionId(),
            isDemo: true,
          },
        });
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.idempotencyKey) throw err;
        if (err.code !== 11000) throw err; // reference/code collision: retry with fresh values
      }
    }
    if (!booking) throw new ApiError(500, 'Could not create the booking. Please try again.');
  } catch (err) {
    await releaseRooms(hotel._id, roomType._id, dates, rooms);
    if (err.code === 11000) {
      // A parallel request with the same key won the race: return its booking.
      const winner = await Booking.findOne({ user: req.user._id, idempotencyKey });
      if (winner) return res.status(200).json({ booking: winner, duplicate: true });
    }
    throw err;
  }

  res.status(201).json({ booking });
});

export const myBookings = asyncHandler(async (req, res) => {
  const today = startOfTodayUTC();
  const tab = str(req.query.tab, 20);
  const filter = { user: req.user._id };
  if (tab === 'upcoming') Object.assign(filter, { status: 'confirmed', checkOut: { $gte: today } });
  else if (tab === 'completed') Object.assign(filter, { status: 'confirmed', checkOut: { $lt: today } });
  else if (tab === 'cancelled') filter.status = 'cancelled';
  const sort = tab === 'upcoming' ? { checkIn: 1 } : { checkIn: -1 };
  const bookings = await Booking.find(filter).sort(sort).limit(200);
  res.json({ bookings });
});

async function findOwned(req) {
  requireId(req.params.id, 'booking id');
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) throw new ApiError(404, 'Booking not found.');
  return booking;
}

export const getBooking = asyncHandler(async (req, res) => {
  res.json({ booking: await findOwned(req) });
});

export const confirmation = asyncHandler(async (req, res) => {
  const booking = await findOwned(req);
  const verifyUrl = `${env.clientUrls[0]}/verify/${booking.verificationCode}`;
  res.json({ booking, verifyUrl });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await findOwned(req);
  if (booking.status === 'cancelled') throw new ApiError(400, 'This booking is already cancelled.');
  if (booking.checkIn < startOfTodayUTC()) throw new ApiError(400, 'Bookings can’t be cancelled once the stay has started.');

  const hoursToCheckIn = (booking.checkIn.getTime() - Date.now()) / 3_600_000;
  const refundable = booking.snapshot.freeCancellation && hoursToCheckIn >= 48;
  const demoPaid = booking.payment.status === 'demo_paid';
  const refundStatus = demoPaid ? (refundable ? 'demo_refund' : 'no_refund') : 'not_applicable';

  // Conditional update so a double request cannot cancel (and release inventory) twice.
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, user: req.user._id, status: 'confirmed' },
    {
      $set: {
        status: 'cancelled',
        'payment.status': demoPaid ? (refundable ? 'demo_refunded' : 'demo_paid') : 'cancelled',
        cancellation: { cancelledAt: new Date(), reason: str(req.body?.reason, 300), refundStatus },
      },
    },
    { new: true },
  );
  if (!updated) throw new ApiError(409, 'This booking was already cancelled.');

  const nights = Math.round((booking.checkOut - booking.checkIn) / 86_400_000);
  await releaseRooms(booking.hotel, booking.roomTypeId, nightDates(booking.checkIn, nights), booking.rooms);
  res.json({ booking: updated });
});

/** Public: reveals only what a front desk needs to confirm a reservation exists. */
export const verifyBooking = asyncHandler(async (req, res) => {
  const code = str(req.params.code, 64);
  if (!/^[a-f0-9]{32}$/.test(code)) throw new ApiError(404, 'Booking not found.');
  const booking = await Booking.findOne({ verificationCode: code });
  if (!booking) throw new ApiError(404, 'Booking not found.');
  const [first, ...rest] = booking.guest.fullName.split(' ');
  res.json({
    valid: booking.status === 'confirmed',
    reference: booking.reference,
    status: booking.displayStatus,
    hotelName: booking.snapshot.hotelName,
    city: booking.snapshot.city,
    country: booking.snapshot.country,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestName: rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first,
    isDemo: true,
  });
});
