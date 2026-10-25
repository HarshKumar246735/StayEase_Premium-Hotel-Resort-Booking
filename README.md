# StayEase — Premium Hotel & Resort Booking Platform
LIVE DEMO-- https://stay-ease-premium-hotel-resort-book.vercel.app/
<img width="1888" height="912" alt="image" src="https://github.com/user-attachments/assets/b0cf8f3c-bfa2-4670-b9b5-dd7f1c719051" />


StayEase is a full-stack MERN hotel booking platform where customers can explore hotels, compare prices, check room availability, book accommodations, and manage their reservations. It features a premium dark navy and gold luxury-travel design.

All hotels are fictional demo listings, and all payments are simulated. There is no admin panel, admin login, or admin route.

## Technology Stack

**Frontend**

* React 18 + Vite
* React Router
* Axios
* Lucide React
* React Hot Toast
* jsPDF
* QR Code
* Plain CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* HTTP-only cookies
* bcryptjs
* Helmet
* CORS
* Rate limiting

## Project Workflow

```text
                 STAYEASE
                    |
                    v
               Home Page
                    |
                    v
             Search for Hotels
                    |
                    v
             Browse Hotel List
                    |
                    v
              Hotel Details
                    |
                    v
             Login / Register
                    |
                    v
             Select Room & Dates
                    |
                    v
             Check Availability
                    |
                    v
              Booking Checkout
                    |
                    v
              Demo Payment
                    |
                    v
            Booking Confirmation
                    |
             +------+------+
             |             |
             v             v
          QR Code       PDF Ticket
             |
             v
         My Bookings
             |
       +-----+------+
       |            |
       v            v
    Wishlist     My Profile
                    |
                    v
                My Reviews
```

## Main Pages and Functionalities

### 1. Home Page

* Premium luxury-themed landing page.
* Hotel search section.
* Featured hotels.
* Popular destinations.
* Special offers.
* Responsive navigation.

### 2. Explore Hotels
<img width="1891" height="912" alt="image" src="https://github.com/user-attachments/assets/f2af5057-739a-4235-bf11-000f358c83b4" />


* Search hotels by city or destination.
* Filter by price, rating, stars, and amenities.
* Sort hotels by price and popularity.
* Filter by breakfast, pool, family-friendly facilities, and pet-friendly policies.
* View hotel images and basic information.

### 3. Hotel Details
<img width="1885" height="912" alt="image" src="https://github.com/user-attachments/assets/fe66e5a0-8977-4859-8c53-b73bf8f956bf" />


* Hotel description and images.
* Available room types.
* Room prices and facilities.
* Guest ratings and reviews.
* Check-in and check-out date selection.
* Room availability checking.

### 4. Customer Authentication

* Customer registration.
* Customer login and logout.
* Secure password hashing.
* JWT authentication using HTTP-only cookies.
* Session restoration after refreshing the browser.
* Change-password functionality.

### 5. Booking System

* Select a hotel and room type.
* Choose check-in and check-out dates.
* Select the number of guests and rooms.
* Verify availability for every night.
* Calculate the final price on the server.
* Prevent duplicate bookings using idempotency keys.
* Prevent overbooking through atomic inventory updates.
* Cancel eligible bookings and release reserved inventory.

### 6. Demo Payment System

Customers can choose:

* Demo UPI.
* Demo card.
* Pay at property.

Payments are simulated. The platform does not collect actual card details or process real transactions.

### 7. Booking Confirmation

* Booking reference number.
* Hotel and room information.
* Guest details.
* Check-in and check-out dates.
* Total price and booking status.
* QR code for booking verification.
* Downloadable PDF confirmation.

### 8. My Bookings

* View upcoming reservations.
* View previous bookings.
* Open booking details.
* Cancel eligible bookings.
* Access booking confirmations.

### 9. Wishlist

* Add hotels to favourites.
* View saved hotels.
* Remove hotels from the wishlist.

### 10. Customer Profile

* View personal information.
* Update name, phone number, and preferences.
* Change password.
* Manage newsletter preferences.

### 11. Reviews and Ratings

* View hotel reviews.
* Submit reviews for eligible completed stays.
* Allow one review per booking.
* Recalculate hotel ratings from stored reviews.

## Sample Hotel Data

The project includes 108 fictional sample hotels and 324 demo reviews.

The hotel seeding script can be rerun safely. It updates hotel records by slug and demo reviews by their keys without intentionally replacing customer accounts, bookings, wishlists, or inventory.

## System Architecture

```text
+--------------------------------+
|       React Frontend           |
|                                |
| Home, Hotels, Booking, Profile  |
+---------------+----------------+
                |
                | HTTP / REST API
                v
+--------------------------------+
|       Express Backend          |
|                                |
| Authentication                 |
| Hotel Search                   |
| Booking Management             |
| Pricing and Inventory          |
| Reviews and Wishlists          |
+---------------+----------------+
                |
                | Mongoose
                v
+--------------------------------+
|          MongoDB               |
|                                |
| Users                          |
| Hotels                         |
| Bookings                       |
| Inventory                      |
| Reviews                        |
| Wishlists                      |
+--------------------------------+
```

## Local Setup

### Start the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/stayease
JWT_SECRET=replace-with-a-long-random-secret
COOKIE_NAME=stayease_token
```

If you use MongoDB Atlas, replace the local MongoDB URI with your Atlas connection string.

Seed the demo hotels:

```bash
npm run seed:hotels
```

Start the backend:

```bash
npm run dev
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=
```

Start the frontend:

```bash
npm run dev
```

Open the application at:

http://localhost:5173

The frontend development server should proxy `/api` requests to the backend running on port 5000.

## Deployment

### Backend — Render

* Root directory: `server`
* Build command: `npm install`
* Start command: `npm start`
* Configure `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV`.
* Run the hotel seeding script against the production database.

### Frontend — Vercel

* Root directory: `client`
* Build command: `npm run build`
* Output directory: `dist`
* Set `VITE_API_URL` to the deployed backend URL, including `/api` only if required by the client's API configuration.

For production authentication, use HTTPS and configure credentialed CORS and secure cookies correctly.

## Security Features

* Hashed passwords.
* HTTP-only authentication cookies.
* JWT validation.
* Authentication rate limiting.
* CORS origin allow-list.
* Helmet security headers.
* CSRF protection for state-changing requests.
* Customer ownership checks.
* Server-side pricing calculations.
* Atomic inventory updates.
* Duplicate-booking protection.

## Important Notes

* All hotels and reviews are fictional demonstration data.
* Payments are simulated and do not transfer real money.
* The platform has no admin panel or admin login.
* Production deployment and all functionality must be tested before the project is considered complete.
