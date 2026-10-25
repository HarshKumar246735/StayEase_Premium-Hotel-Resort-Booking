import { ApiError, asyncHandler, clampInt, str } from '../utils/http.js';

export const getMe = (req, res) => res.json({ user: req.user });

export const updateMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, phone, preferences } = req.body;

  if (name !== undefined) {
    const n = str(name, 60);
    if (n.length < 2) throw new ApiError(400, 'Please enter your full name.');
    user.name = n;
  }
  if (phone !== undefined) {
    const p = str(phone, 20);
    if (p && !/^[+\d][\d\s()-]{6,18}$/.test(p)) throw new ApiError(400, 'Please enter a valid phone number.');
    user.phone = p;
  }
  if (preferences && typeof preferences === 'object') {
    if (preferences.newsletter !== undefined) user.preferences.newsletter = Boolean(preferences.newsletter);
    if (preferences.favouriteDestination !== undefined) user.preferences.favouriteDestination = str(preferences.favouriteDestination, 60);
    if (preferences.defaultGuests !== undefined) user.preferences.defaultGuests = clampInt(preferences.defaultGuests, 1, 10, 2);
  }
  await user.save();
  res.json({ user });
});
