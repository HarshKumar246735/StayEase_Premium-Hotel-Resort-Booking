# StayEase — Premium Hotel & Resort Booking (MERN, demo)

Dark-navy and gold luxury-travel booking platform. **Customers only: there is no admin panel, admin login or admin route.**
All hotels are fictional sample listings and all payments are simulated.

## Stack
- **Client:** React 18 + Vite, React Router, Axios, lucide-react, react-hot-toast, jsPDF, qrcode. Plain CSS, one CSS file per page/component, tokens in `client/src/css/global.css`. Native date inputs are used instead of a date-picker library.
- **Server:** Node 18+, Express, Mongoose, JWT in an httpOnly cookie, bcryptjs, Helmet, CORS, rate limiting.

## Local setup
```bash
# 1. API
cd server
cp .env.example .env        # fill MONGODB_URI and JWT_SECRET
npm install
npm run seed:hotels         # 108 hotels + 324 demo reviews, safe to re-run
npm run dev                 # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```
Database: create a free MongoDB Atlas cluster, add a database user, allow your IP, and paste the connection string into `MONGODB_URI`.

## Seeding
`npm run seed:hotels` upserts hotels by slug and demo reviews by key. It never touches users, bookings, wishlists or inventory. `guestRating` and `reviewCount` are only written on first insert, so real reviews survive a re-seed. Data lives in `server/src/seed/hotelData.js`; images are configured in `server/src/seed/imageConfig.js` (change an ID there to change images everywhere). Images are Unsplash photo IDs and **were not link-checked**; the client swaps in a branded fallback for any URL that fails.

## Environment variables
| Server | Meaning |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | 16+ random characters (required) |
| `CLIENT_URL` | Allowed origin(s), comma-separated, e.g. `https://stayease.vercel.app` |
| `NODE_ENV` | `production` on Render |
| `PORT` | Render sets this |
| `COOKIE_NAME` | optional, default `stayease_token` |

Client: `VITE_API_URL` — the Render URL (no trailing slash). Leave empty in development.

## Deploy
- **Render (API):** Web service, root `server`, build `npm install`, start `npm start`, add the env vars above, then run `npm run seed:hotels` once from the Render shell or locally against the Atlas URI.
- **Vercel (client):** root `client`, build `npm run build`, output `dist`, set `VITE_API_URL`. `vercel.json` rewrites all routes to `index.html`.
- Production cookies are `Secure` + `SameSite=None` (Vercel and Render are different sites), so both must be served over HTTPS and `CLIENT_URL` must exactly match the Vercel origin.

## How the important parts work
- **No overbooking:** one `Inventory` document per hotel + room type + night. Booking atomically increments `booked` with a conditional `findOneAndUpdate` per night and rolls back if any night is full. A stay occupies nights `[check-in, check-out)`, so a guest checking out on the 10th does not block one checking in on the 10th. Cancelling releases the nights.
- **Server-side pricing:** totals, discounts and taxes are only calculated in `bookingService.computePricing`; the client never sends prices. The booking stores a price and hotel snapshot.
- **No duplicate bookings:** each checkout carries an idempotency key (unique per user); repeats return the original booking.
- **Demo payments:** Demo UPI / Demo card / Pay at property. No card data is collected; transactions are labelled `DEMO-…`.
- **QR & PDF:** the QR contains only `/verify/<random code>`; the public endpoint returns hotel, dates, first name + initial and status.
- **Reviews:** only for your own confirmed bookings after check-out, one per booking; ratings are recomputed inside MongoDB.
- **Security:** Helmet, credentialed CORS allow-list, auth rate limiting, hashed passwords, ownership checks on every user route, and a CSRF guard (state-changing requests must send `X-Requested-With: StayEase`, which forces a CORS preflight).

## API
`/api/auth/{register,login,logout,me,change-password}` · `/api/users/me` · `/api/hotels` (`?q&city&minPrice&maxPrice&stars&rating&types&amenities&breakfast&freeCancellation&pool&family&pet&offer&guests&rooms&sort&page&limit`) · `/api/hotels/{featured,destinations,offers,:slug,:id/availability,:hotelId/reviews}` · `/api/bookings` (`POST`, `my-bookings`, `verify/:code`, `:id`, `:id/cancel`, `:id/confirmation`) · `/api/wishlist` · `/api/reviews/{mine,:reviewId}`.

## Troubleshooting
- **401 right after login in production:** `CLIENT_URL` mismatch, or the API is not on HTTPS.
- **CORS error:** add the exact client origin (no trailing slash) to `CLIENT_URL`.
- **Empty hotel list:** run `npm run seed:hotels`.
- **`Missing CSRF header`:** custom API callers must send `X-Requested-With: StayEase`.

## Status
Written and syntax-checked, but **not yet installed, built or run** (package registry access was blocked while this was authored). Run `npm install` in both folders, then work through the checklist: register/login/refresh, filters and sorting, wishlist, booking, a second booking on the same dates after the room count is exhausted, cancel, PDF/QR, review after a past stay, mobile widths.
