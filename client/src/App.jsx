import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Home from './pages/Home/Home.jsx';
import ExploreHotels from './pages/ExploreHotels/ExploreHotels.jsx';
import HotelDetails from './pages/HotelDetails/HotelDetails.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Verify from './pages/Verify/Verify.jsx';
import Destinations from './pages/Info/Destinations.jsx';
import Offers from './pages/Info/Offers.jsx';
import About from './pages/Info/About.jsx';
import Policy from './pages/Info/Policy.jsx';
import NotFound from './pages/Info/NotFound.jsx';

// Heavier, login-only screens (jsPDF / QR code) are split into separate chunks.
const Booking = lazy(() => import('./pages/Booking/Booking.jsx'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation/BookingConfirmation.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const Overview = lazy(() => import('./pages/Dashboard/Overview.jsx'));
const MyBookings = lazy(() => import('./pages/Dashboard/MyBookings.jsx'));
const Wishlist = lazy(() => import('./pages/Dashboard/Wishlist.jsx'));
const MyReviews = lazy(() => import('./pages/Dashboard/MyReviews.jsx'));
const Profile = lazy(() => import('./pages/Dashboard/Profile.jsx'));
const Help = lazy(() => import('./pages/Dashboard/Help.jsx'));

const Loading = () => (
  <div className="route-loading"><span className="spinner" /></div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="hotels" element={<ExploreHotels />} />
          <Route path="hotels/:slug" element={<HotelDetails />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="offers" element={<Offers />} />
          <Route path="about" element={<About />} />
          <Route path="policy/:type" element={<Policy />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify/:code" element={<Verify />} />
          <Route path="book/:slug" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="booking/confirmation/:id" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Dashboard has its own sidebar shell */}
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
