import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as hotels from '../controllers/hotelController.js';
import * as bookings from '../controllers/bookingController.js';
import * as wishlist from '../controllers/wishlistController.js';
import * as reviews from '../controllers/reviewController.js';

const api = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

// Auth
api.post('/auth/register', authLimiter, auth.register);
api.post('/auth/login', authLimiter, auth.login);
api.post('/auth/logout', auth.logout);
api.get('/auth/me', protect, auth.me);
api.patch('/auth/change-password', authLimiter, protect, auth.changePassword);

// Profile
api.get('/users/me', protect, users.getMe);
api.patch('/users/me', protect, users.updateMe);

// Hotels (static paths first so they are not read as a slug)
api.get('/hotels', hotels.listHotels);
api.get('/hotels/featured', hotels.featuredHotels);
api.get('/hotels/destinations', hotels.destinations);
api.get('/hotels/offers', hotels.offers);
api.get('/hotels/:id/availability', hotels.availability);
api.get('/hotels/:hotelId/reviews', reviews.listReviews);
api.post('/hotels/:hotelId/reviews', protect, reviews.createReview);
api.get('/hotels/:slug', hotels.getHotel);

// Bookings
api.post('/bookings', protect, bookings.createBooking);
api.get('/bookings/my-bookings', protect, bookings.myBookings);
api.get('/bookings/verify/:code', bookings.verifyBooking); // public, minimal data
api.get('/bookings/:id', protect, bookings.getBooking);
api.post('/bookings/:id/cancel', protect, bookings.cancelBooking);
api.get('/bookings/:id/confirmation', protect, bookings.confirmation);

// Wishlist
api.get('/wishlist', protect, wishlist.getWishlist);
api.post('/wishlist/:hotelId', protect, wishlist.addToWishlist);
api.delete('/wishlist/:hotelId', protect, wishlist.removeFromWishlist);

// Reviews
api.get('/reviews/mine', protect, reviews.myReviews);
api.patch('/reviews/:reviewId', protect, reviews.updateReview);

export default api;
