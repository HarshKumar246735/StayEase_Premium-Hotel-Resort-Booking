import { User } from '../models/User.js';
import { ApiError, asyncHandler, isEmail, str } from '../utils/http.js';
import { clearAuthCookie, setAuthCookie } from '../middleware/auth.js';

const strongPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 72 && /[A-Za-z]/.test(p) && /\d/.test(p);
const PASSWORD_RULE = 'Password must be 8–72 characters and include at least one letter and one number.';

export const register = asyncHandler(async (req, res) => {
  const name = str(req.body.name, 60);
  const email = str(req.body.email, 120).toLowerCase();
  const { password } = req.body;
  if (name.length < 2) throw new ApiError(400, 'Please enter your full name.');
  if (!isEmail(email)) throw new ApiError(400, 'Please enter a valid email address.');
  if (!strongPassword(password)) throw new ApiError(400, PASSWORD_RULE);
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists. Try logging in.');

  const user = await User.create({ name, email, password });
  setAuthCookie(res, user._id);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase();
  const { password } = req.body;
  if (!isEmail(email) || typeof password !== 'string' || !password) {
    throw new ApiError(400, 'Please enter your email and password.');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Incorrect email or password.');
  setAuthCookie(res, user._id);
  res.json({ user });
});

export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out.' });
};

export const me = (req, res) => res.json({ user: req.user });

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || !currentPassword) throw new ApiError(400, 'Enter your current password.');
  if (!strongPassword(newPassword)) throw new ApiError(400, PASSWORD_RULE);
  if (newPassword === currentPassword) throw new ApiError(400, 'Your new password must be different.');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new ApiError(401, 'Current password is incorrect.');
  user.password = newPassword;
  await user.save();
  setAuthCookie(res, user._id);
  res.json({ message: 'Password updated.' });
});
