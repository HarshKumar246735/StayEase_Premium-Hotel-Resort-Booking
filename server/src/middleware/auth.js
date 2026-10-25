import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  // Vercel (client) and Render (API) are different sites in production, so the cookie must be SameSite=None.
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: '7d' });
}

export function setAuthCookie(res, userId) {
  res.cookie(env.cookieName, signToken(userId), cookieOptions);
}

export function clearAuthCookie(res) {
  const { maxAge, ...opts } = cookieOptions;
  res.clearCookie(env.cookieName, opts);
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[env.cookieName];
  if (!token) throw new ApiError(401, 'Please log in to continue.');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'Account not found. Please log in again.');
  req.user = user;
  next();
});

/** CSRF defence for cookie auth: state-changing requests must carry a custom header,
 *  which browsers only allow after a successful CORS preflight against our allow-listed origins. */
export function csrfGuard(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'StayEase') {
    return next(new ApiError(403, 'Blocked request (missing CSRF header).'));
  }
  next();
}
