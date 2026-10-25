import { Hotel } from '../models/Hotel.js';
import { ApiError, asyncHandler, clampInt, escapeRegex, requireId, str } from '../utils/http.js';
import { computePricing, MAX_ROOMS, remainingByRoomType, validateStay } from '../services/bookingService.js';
import { destinationImages } from '../seed/imageConfig.js';

const LIST_FIELDS = '-roomTypes -description -location -cancellationPolicy -checkInTime -checkOutTime';
const SORTS = {
  recommended: { featured: -1, guestRating: -1, reviewCount: -1 },
  'price-asc': { pricePerNight: 1, guestRating: -1 },
  'price-desc': { pricePerNight: -1, guestRating: -1 },
  rating: { guestRating: -1, reviewCount: -1 },
  reviews: { reviewCount: -1, guestRating: -1 },
};

export const listHotels = asyncHandler(async (req, res) => {
  const q = req.query;
  const filter = { isActive: true };
  const and = [];

  const search = str(q.q, 80);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    and.push({ $or: [{ name: rx }, { city: rx }, { country: rx }] });
  }
  const city = str(q.city, 60);
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');

  const minPrice = Number(q.minPrice);
  const maxPrice = Number(q.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter.pricePerNight = {};
    if (q.minPrice !== undefined && q.minPrice !== '' && Number.isFinite(minPrice)) filter.pricePerNight.$gte = minPrice;
    if (q.maxPrice !== undefined && q.maxPrice !== '' && Number.isFinite(maxPrice)) filter.pricePerNight.$lte = maxPrice;
    if (!Object.keys(filter.pricePerNight).length) delete filter.pricePerNight;
  }
  const stars = clampInt(q.stars, 1, 5, 0);
  if (stars) filter.starRating = { $gte: stars };
  const rating = Number(q.rating);
  if (Number.isFinite(rating) && rating > 0) filter.guestRating = { $gte: Math.min(5, rating) };

  const types = str(q.types, 200).split(',').map((s) => s.trim()).filter(Boolean);
  if (types.length) filter.propertyType = { $in: types };

  const amenities = str(q.amenities, 400).split(',').map((s) => s.trim()).filter(Boolean);
  if (q.pool === 'true') amenities.push('Swimming Pool');
  if (amenities.length) filter.amenities = { $all: [...new Set(amenities)] };

  if (q.breakfast === 'true') filter.breakfastIncluded = true;
  if (q.freeCancellation === 'true') filter.freeCancellation = true;
  if (q.family === 'true') filter.familyFriendly = true;
  if (q.pet === 'true') filter.petFriendly = true;

  const offer = str(q.offer, 20);
  if (offer) filter['offer.kind'] = offer;

  const guests = clampInt(q.guests, 1, 40, 0);
  const rooms = clampInt(q.rooms, 1, MAX_ROOMS, 1);
  if (guests) {
    and.push({ roomTypes: { $elemMatch: { capacity: { $gte: Math.ceil(guests / rooms) }, totalRooms: { $gte: rooms } } } });
  }
  if (and.length) filter.$and = and;

  const page = clampInt(q.page, 1, 1000, 1);
  const limit = clampInt(q.limit, 1, 24, 12);
  const sort = SORTS[q.sort] || SORTS.recommended;

  const [hotels, total] = await Promise.all([
    Hotel.find(filter).select(LIST_FIELDS).sort({ ...sort, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Hotel.countDocuments(filter),
  ]);
  res.json({ hotels, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit });
});

export const featuredHotels = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find({ isActive: true, featured: true })
    .select(LIST_FIELDS)
    .sort({ guestRating: -1, reviewCount: -1 })
    .limit(8)
    .lean();
  res.json({ hotels });
});

export const destinations = asyncHandler(async (_req, res) => {
  const rows = await Hotel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$city', country: { $first: '$country' }, hotels: { $sum: 1 }, fromPrice: { $min: '$pricePerNight' } } },
    { $sort: { hotels: -1, _id: 1 } },
  ]);
  res.json({
    destinations: rows.map((r) => ({
      city: r._id,
      country: r.country,
      hotels: r.hotels,
      fromPrice: r.fromPrice,
      image: destinationImages[r._id] || null,
    })),
  });
});

export const offers = asyncHandler(async (_req, res) => {
  const rows = await Hotel.aggregate([
    { $match: { isActive: true, 'offer.kind': { $ne: null } } },
    { $sort: { 'offer.discountPercent': -1, guestRating: -1 } },
    {
      $group: {
        _id: '$offer.kind',
        hotels: { $sum: 1 },
        maxDiscount: { $max: '$offer.discountPercent' },
        minNights: { $min: '$offer.minNights' },
        sampleImage: { $first: { $arrayElemAt: ['$images', 0] } },
        sampleCity: { $first: '$city' },
      },
    },
  ]);
  res.json({ offers: rows.map(({ _id, ...rest }) => ({ kind: _id, ...rest })) });
});

export const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({ slug: str(req.params.slug, 120).toLowerCase(), isActive: true }).lean();
  if (!hotel) throw new ApiError(404, 'We could not find that hotel.');
  const similar = await Hotel.find({
    isActive: true,
    _id: { $ne: hotel._id },
    $or: [{ city: hotel.city }, { country: hotel.country, propertyType: hotel.propertyType }],
  })
    .select(LIST_FIELDS)
    .sort({ guestRating: -1 })
    .limit(4)
    .lean();
  res.json({ hotel, similar });
});

/** Availability + authoritative price quote for each room type on the requested dates. */
export const availability = asyncHandler(async (req, res) => {
  requireId(req.params.id, 'hotel id');
  const hotel = await Hotel.findOne({ _id: req.params.id, isActive: true });
  if (!hotel) throw new ApiError(404, 'We could not find that hotel.');
  const { checkIn, checkOut, nights } = validateStay(req.query.checkIn, req.query.checkOut);
  const adults = clampInt(req.query.adults, 1, 40, 2);
  const children = clampInt(req.query.children, 0, 40, 0);
  const rooms = clampInt(req.query.rooms, 1, MAX_ROOMS, 1);

  const remaining = await remainingByRoomType(hotel, checkIn, nights);
  const result = hotel.roomTypes.map((rt) => {
    const available = remaining.get(String(rt._id));
    const fitsGuests = adults + children <= rt.capacity * rooms;
    return {
      roomTypeId: rt._id,
      name: rt.name,
      capacity: rt.capacity,
      available,
      fitsGuests,
      canBook: fitsGuests && available >= rooms,
      pricing: computePricing(hotel, rt, nights, rooms, checkIn),
    };
  });
  res.json({ checkIn, checkOut, nights, rooms, adults, children, roomTypes: result });
});
