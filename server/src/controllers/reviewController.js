import { Review } from '../models/Review.js';
import { Booking, startOfTodayUTC } from '../models/Booking.js';
import { Hotel } from '../models/Hotel.js';
import { ApiError, asyncHandler, clampInt, requireId, str } from '../utils/http.js';

function readReviewBody(body) {
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be a whole number from 1 to 5.');
  const comment = str(body.comment, 1500);
  if (comment.length < 10) throw new ApiError(400, 'Please write at least 10 characters about your stay.');
  return { rating, comment, title: str(body.title, 100) };
}

const displayName = (name) => {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
};

// guestRating = running average. Computed inside Mongo from the stored values so concurrent reviews don't clobber each other.
const addToRating = (rating) => [
  {
    $set: {
      guestRating: {
        $round: [{ $divide: [{ $add: [{ $multiply: ['$guestRating', '$reviewCount'] }, rating] }, { $add: ['$reviewCount', 1] }] }, 2],
      },
      reviewCount: { $add: ['$reviewCount', 1] },
    },
  },
];
const shiftRating = (delta) => [
  {
    $set: {
      guestRating: {
        $min: [5, { $max: [1, { $round: [{ $divide: [{ $add: [{ $multiply: ['$guestRating', '$reviewCount'] }, delta] }, '$reviewCount'] }, 2] }] }],
      },
    },
  },
];

export const listReviews = asyncHandler(async (req, res) => {
  requireId(req.params.hotelId, 'hotel id');
  const page = clampInt(req.query.page, 1, 500, 1);
  const limit = clampInt(req.query.limit, 1, 20, 6);
  const filter = { hotel: req.params.hotelId };
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-user -booking').lean(),
    Review.countDocuments(filter),
  ]);
  res.json({ reviews, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

export const createReview = asyncHandler(async (req, res) => {
  requireId(req.params.hotelId, 'hotel id');
  requireId(req.body.bookingId, 'booking id');
  const data = readReviewBody(req.body);

  const booking = await Booking.findOne({ _id: req.body.bookingId, user: req.user._id, hotel: req.params.hotelId });
  if (!booking) throw new ApiError(403, 'You can only review hotels you have booked.');
  if (booking.status !== 'confirmed') throw new ApiError(403, 'Cancelled bookings can’t be reviewed.');
  if (booking.checkOut >= startOfTodayUTC()) throw new ApiError(403, 'You can write a review once your stay is complete.');
  if (booking.review) throw new ApiError(409, 'You have already reviewed this stay.');

  const review = await Review.create({
    ...data,
    hotel: booking.hotel,
    user: req.user._id,
    booking: booking._id,
    authorName: displayName(req.user.name),
  });
  await Booking.updateOne({ _id: booking._id }, { review: review._id });
  await Hotel.updateOne({ _id: booking.hotel }, addToRating(data.rating));
  res.status(201).json({ review });
});

export const updateReview = asyncHandler(async (req, res) => {
  requireId(req.params.reviewId, 'review id');
  const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
  if (!review) throw new ApiError(404, 'Review not found.');
  const data = readReviewBody({ rating: req.body.rating ?? review.rating, comment: req.body.comment ?? review.comment, title: req.body.title ?? review.title });
  const delta = data.rating - review.rating;
  Object.assign(review, data);
  await review.save();
  if (delta !== 0) await Hotel.updateOne({ _id: review.hotel }, shiftRating(delta));
  res.json({ review });
});

export const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('hotel', 'name slug city country images').lean();
  res.json({ reviews });
});
