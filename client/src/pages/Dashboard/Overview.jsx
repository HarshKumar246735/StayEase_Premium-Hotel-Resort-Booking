import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CheckCircle2, Compass, Heart, History, Search, Star, Wallet } from 'lucide-react';
import HotelCard from '../../components/hotels/HotelCard.jsx';
import HotelImage from '../../components/common/HotelImage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatMoney, recentlyViewed } from '../../utils/format.js';
import './Overview.css';

export default function Overview() {
  const { user } = useAuth();
  const { hotels: saved } = useWishlist();
  const [bookings, setBookings] = useState(null);
  const [recs, setRecs] = useState({ hotels: [], dests: [] });
  const recent = useMemo(() => recentlyViewed(), []);

  useEffect(() => {
    let alive = true;
    api.get('/bookings/my-bookings').then((r) => alive && setBookings(r.data.bookings)).catch(() => alive && setBookings([]));
    const fav = user.preferences?.favouriteDestination;
    Promise.all([
      api.get('/hotels', { params: { limit: 4, sort: 'rating', ...(fav ? { q: fav } : {}) } }),
      api.get('/hotels/destinations'),
    ])
      .then(async ([h, d]) => {
        let hotels = h.data.hotels;
        if (hotels.length < 4) hotels = (await api.get('/hotels', { params: { limit: 4, sort: 'rating' } })).data.hotels;
        if (alive) setRecs({ hotels, dests: d.data.destinations.slice(0, 6) });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const list = bookings || [];
    const active = list.filter((b) => b.status !== 'cancelled');
    return {
      total: list.length,
      upcoming: list.filter((b) => b.displayStatus === 'confirmed'),
      completed: list.filter((b) => b.displayStatus === 'completed').length,
      spend: active.reduce((sum, b) => sum + b.pricing.total, 0),
    };
  }, [bookings]);

  const cards = [
    { icon: CalendarCheck, label: 'Total bookings', value: stats.total },
    { icon: Compass, label: 'Upcoming stays', value: stats.upcoming.length },
    { icon: CheckCircle2, label: 'Completed stays', value: stats.completed },
    { icon: Heart, label: 'Saved hotels', value: saved.length },
    { icon: Wallet, label: 'Total spending', value: formatMoney(stats.spend), note: 'Excludes cancelled bookings' },
  ];

  const firstTime = bookings && bookings.length === 0;

  return (
    <div className="ov">
      <header className="ov-head">
        <div>
          <h1>Welcome back, <span className="gold">{user.name.split(' ')[0]}</span> 👋</h1>
          <p className="muted">Here’s what’s happening with your trips.</p>
        </div>
        <Link to="/hotels" className="btn btn-gold"><Search size={16} /> Explore hotels</Link>
      </header>

      <div className="ov-stats">
        {cards.map(({ icon: Icon, label, value, note }) => (
          <div className="ov-stat card" key={label}>
            <span className="ov-stat-icon"><Icon size={20} /></span>
            <div>
              <small>{label}</small>
              <strong>{bookings === null ? '—' : value}</strong>
              {note && <em>{note}</em>}
            </div>
          </div>
        ))}
      </div>

      {firstTime ? (
        <div className="state-box ov-empty">
          <Compass size={36} />
          <h3>Your first adventure awaits</h3>
          <p>You haven’t booked a stay yet. Browse sample hotels and resorts and try the full booking flow.</p>
          <Link to="/hotels" className="btn btn-gold">Explore hotels</Link>
        </div>
      ) : (
        <section className="ov-section">
          <div className="section-head">
            <h2>Upcoming bookings</h2>
            <Link to="/dashboard/bookings" className="link-more">All bookings <ArrowRight size={15} /></Link>
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="muted">No upcoming stays. <Link className="gold" to="/hotels">Plan one →</Link></p>
          ) : (
            <div className="ov-list">
              {stats.upcoming.slice(0, 3).map((b) => (
                <Link key={b._id} to={`/booking/confirmation/${b._id}`} className="ov-booking card">
                  <div className="ov-thumb"><HotelImage src={b.snapshot.image} alt="" /></div>
                  <div>
                    <strong>{b.snapshot.hotelName}</strong>
                    <small className="muted">{b.snapshot.city} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</small>
                  </div>
                  <span className="badge badge-gold">{b.reference}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="ov-section">
        <div className="section-head"><h2>Quick actions</h2></div>
        <div className="ov-actions">
          <Link to="/hotels" className="ov-action card"><Search size={20} /> Find a stay</Link>
          <Link to="/dashboard/bookings" className="ov-action card"><CalendarCheck size={20} /> Manage bookings</Link>
          <Link to="/dashboard/wishlist" className="ov-action card"><Heart size={20} /> View wishlist</Link>
          <Link to="/dashboard/reviews" className="ov-action card"><Star size={20} /> Write a review</Link>
        </div>
      </section>

      {bookings && bookings.length > 0 && (
        <section className="ov-section">
          <div className="section-head"><h2>Recent booking activity</h2></div>
          <ul className="ov-activity card">
            {[...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((b) => (
              <li key={b._id}>
                <History size={16} />
                <span>
                  {b.status === 'cancelled' ? 'Cancelled' : 'Booked'} <strong>{b.snapshot.hotelName}</strong> ({b.reference})
                </span>
                <time className="muted" dateTime={b.createdAt}>{formatDate(b.cancellation?.cancelledAt || b.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section className="ov-section">
          <div className="section-head"><h2>Recently viewed</h2></div>
          <div className="ov-recent">
            {recent.slice(0, 4).map((h) => (
              <Link key={h.slug} to={`/hotels/${h.slug}`} className="ov-recent-card card">
                <div className="ov-recent-img"><HotelImage src={h.image} alt={h.name} /></div>
                <div><strong>{h.name}</strong><small className="muted">{h.city} · {formatMoney(h.pricePerNight)}/night</small></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recs.dests.length > 0 && (
        <section className="ov-section">
          <div className="section-head"><h2>Recommended destinations</h2></div>
          <div className="ov-dests">
            {recs.dests.map((d) => (
              <Link key={d.city} to={`/hotels?city=${encodeURIComponent(d.city)}`} className="ov-dest">
                <HotelImage src={d.image} alt={d.city} />
                <span>{d.city}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recs.hotels.length > 0 && (
        <section className="ov-section">
          <div className="section-head"><h2>Recommended hotels</h2></div>
          <div className="ov-hotels">{recs.hotels.map((h) => <HotelCard key={h._id} hotel={h} />)}</div>
        </section>
      )}
    </div>
  );
}
