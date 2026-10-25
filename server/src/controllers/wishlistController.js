import { Wishlist } from '../models/Wishlist.js';
import { Hotel } from '../models/Hotel.js';
import { ApiError, asyncHandler, requireId } from '../utils/http.js';

const CARD_FIELDS = '-roomTypes -description -location -cancellationPolicy';

export const getWishlist = asyncHandler(async (req, res) => {
  const list = await Wishlist.findOne({ user: req.user._id }).populate({ path: 'hotels', match: { isActive: true }, select: CARD_FIELDS });
  res.json({ hotels: list?.hotels ?? [] });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  requireId(req.params.hotelId, 'hotel id');
  if (!(await Hotel.exists({ _id: req.params.hotelId, isActive: true }))) throw new ApiError(404, 'We could not find that hotel.');
  await Wishlist.updateOne({ user: req.user._id }, { $addToSet: { hotels: req.params.hotelId } }, { upsert: true });
  res.status(201).json({ message: 'Saved to your wishlist.' });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  requireId(req.params.hotelId, 'hotel id');
  await Wishlist.updateOne({ user: req.user._id }, { $pull: { hotels: req.params.hotelId } });
  res.json({ message: 'Removed from your wishlist.' });
});
