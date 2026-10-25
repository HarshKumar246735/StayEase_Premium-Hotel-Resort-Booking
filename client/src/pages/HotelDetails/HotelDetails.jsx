import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, BedDouble, Check, Clock, Heart, MapPin, ShieldCheck, Star, Tag, Users } from 'lucide-react';
import HotelImage from '../../components/common/HotelImage.jsx';
import Stars from '../../components/common/Stars.jsx';
import HotelCard from '../../components/hotels/HotelCard.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { api, errMsg } from '../../services/api.js';
import { addDaysISO, formatDate, formatMoney, nightsBetween, todayISO, trackViewed } from '../../utils/format.js';
import './HotelDetails.css';

export default function HotelDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { ids, toggle } = useWishlist();
  const [state, setState] = useState({ loading: true, hotel: null, similar: [], error: '' });
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState({ list: [], page: 0, pages: 1, total: 0, loading: false });

  const [trip, setTrip] = useState({ checkIn: addDaysISO(todayISO(), 7), checkOut: addDaysISO(todayISO(), 9), adults: 2, children: 0, rooms: 1 });
  const [roomId, setRoomId] = useState('');
  const [quote, setQuote] = useState({ loading: false, error: '', data: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, hotel: null, similar: [], error: '' });
    setActive(0);
    api
      .get(`/hotels/${slug}`)
      .then((r) => {
        if (!alive) return;
        setState({ loading: false, hotel: r.data.hotel, similar: r.data.similar, error: '' });
        setRoomId(r.data.hotel.roomTypes[0]._id);
        trackViewed(r.data.hotel);
      })
      .catch((e) => alive && setState({ loading: false, hotel: null, similar: [], error: errMsg(e) }));
    return () => {
      alive = false;
    };
  }, [slug]);

  const hotel = state.hotel;

  useEffect(() => {
    if (hotel && window.location.hash === '#book') document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [hotel]);

  const loadReviews = (page = 1) => {
    if (!hotel) return;
    setReviews((r) => ({ ...r, loading: true }));
    api
      .get(`/hotels/${hotel._id}/reviews`, { params: { page, limit: 4 } })
      .then((r) =>
        setReviews((prev) => ({ list: page === 1 ? r.data.reviews : [...prev.list, ...r.data.reviews], page, pages: r.data.pages, total: r.data.total, loading: false })),
      )
      .catch(() => setReviews((r) => ({ ...r, loading: false })));
  };
  useEffect(() => {
    if (hotel) loadReviews(1);
  }, [hotel?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nights = nightsBetween(trip.checkIn, trip.checkOut);

  // Server-calculated availability and price quote for the chosen dates and party.
  useEffect(() => {
    if (!hotel) return undefined;
    if (nights < 1) {
      setQuote({ loading: false, error: 'Check-out must be after check-in.', data: null });
      return undefined;
    }
    let alive = true;
    setQuote((q) => ({ ...q, loading: true, error: '' }));
    const t = setTimeout(() => {
      api
        .get(`/hotels/${hotel._id}/availability`, { params: trip })
        .then((r) => alive && setQuote({ loading: false, error: '', data: r.data }))
        .catch((e) => alive && setQuote({ loading: false, error: errMsg(e), data: null }));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [hotel, trip, nights]);

  const quoteFor = (id) => quote.data?.roomTypes.find((r) => r.roomTypeId === id);
  const selected = quoteFor(roomId);

  const setTripField = (k) => (e) => {
    const v = e.target.value;
    setTrip((t) => {
      const next = { ...t, [k]: ['adults', 'children', 'rooms'].includes(k) ? Number(v) : v };
      if (k === 'checkIn' && next.checkOut <= v) next.checkOut = addDaysISO(v, 1);
      return next;
    });
  };

  const bookHref = useMemo(() => {
    const p = new URLSearchParams({ room: roomId, ...Object.fromEntries(Object.entries(trip).map(([k, v]) => [k, String(v)])) });
    return `/book/${slug}?${p.toString()}`;
  }, [roomId, trip, slug]);

  if (state.loading) {
    return (
      <div className="page container">
        <div className="skeleton hd-sk-hero" />
        <div className="skeleton hd-sk-line" />
      </div>
    );
  }
  if (state.error || !hotel) {
    return (
      <div className="page container">
        <div className="state-box">
          <AlertTriangle size={32} />
          <h3>Hotel not found</h3>
          <p>{state.error || 'This hotel is not available.'}</p>
          <Link to="/hotels" className="btn btn-gold">Browse hotels</Link>
        </div>
      </div>
    );
  }

  const saved = ids.has(hotel._id);
  const maxCapacity = Math.max(...hotel.roomTypes.map((r) => r.capacity));

  return (
    <div className="page details">
      <div className="container">
        <nav className="hd-crumbs muted" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to="/hotels">Hotels</Link> / <Link to={`/hotels?city=${encodeURIComponent(hotel.city)}`}>{hotel.city}</Link>
        </nav>

        <div className="hd-head">
          <div>
            <h1>{hotel.name}</h1>
            <p className="hd-loc"><MapPin size={16} /> {hotel.address}, {hotel.city}, {hotel.country}</p>
            <div className="hd-rate">
              <Stars value={hotel.starRating} size={16} />
              <span className="hd-score"><Star size={13} fill="currentColor" /> {hotel.guestRating.toFixed(1)}</span>
              <span className="muted">{hotel.reviewCount.toLocaleString('en-IN')} reviews</span>
              <span className="badge badge-gold">{hotel.propertyType}</span>
              <span className="badge">Demo listing</span>
            </div>
          </div>
          <button className={`btn ${saved ? 'btn-gold' : 'btn-outline'}`} onClick={() => toggle(hotel)} aria-pressed={saved}>
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="hd-gallery">
          <div className="hd-main"><HotelImage src={hotel.images[active]} alt={`${hotel.name} photo ${active + 1}`} eager /></div>
          <div className="hd-thumbs">
            {hotel.images.map((src, i) => (
              <button key={src + i} className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}>
                <HotelImage src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="hd-layout">
          <div className="hd-content">
            <section className="hd-block">
              <h2>About this property</h2>
              <p className="muted">{hotel.description}</p>
              <div className="hd-facts">
                <span><Clock size={16} /> Check-in from {hotel.checkInTime}</span>
                <span><Clock size={16} /> Check-out by {hotel.checkOutTime}</span>
                <span><Users size={16} /> Up to {maxCapacity} guests per room</span>
              </div>
              {hotel.offer?.kind && (
                <p className="hd-offer"><Tag size={16} /> {hotel.offer.label}: {hotel.offer.discountPercent}% off{hotel.offer.minNights > 1 ? ` for stays of ${hotel.offer.minNights}+ nights` : ''}{hotel.offer.kind === 'weekend' ? ' (Friday or Saturday arrival)' : ''}.</p>
              )}
            </section>

            <section className="hd-block">
              <h2>Amenities</h2>
              <ul className="hd-amenities">
                {hotel.amenities.map((a) => <li key={a}><Check size={15} /> {a}</li>)}
              </ul>
            </section>

            <section className="hd-block">
              <h2>Choose your room</h2>
              <div className="hd-rooms">
                {hotel.roomTypes.map((r) => {
                  const q = quoteFor(r._id);
                  return (
                    <label key={r._id} className={`hd-room ${roomId === r._id ? 'on' : ''} ${q && !q.canBook ? 'unavailable' : ''}`}>
                      <input type="radio" name="room" value={r._id} checked={roomId === r._id} onChange={() => setRoomId(r._id)} />
                      <div className="hd-room-info">
                        <strong>{r.name}</strong>
                        <p className="muted">{r.description}</p>
                        <div className="hd-room-meta">
                          <span><Users size={14} /> Sleeps {r.capacity}</span>
                          <span><BedDouble size={14} /> {r.bedType}</span>
                          {q && (
                            <span className={q.canBook ? 'ok' : 'bad'}>
                              {!q.fitsGuests ? 'Too small for your party' : q.available >= trip.rooms ? `${q.available} left for your dates` : q.available === 0 ? 'Sold out for your dates' : `Only ${q.available} left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="hd-room-price">
                        <strong>{formatMoney(r.pricePerNight, hotel.currency)}</strong>
                        <small>per night</small>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="hd-block">
              <h2>Cancellation policy</h2>
              <p className="hd-policy"><ShieldCheck size={18} /> {hotel.cancellationPolicy}</p>
            </section>

            <section className="hd-block">
              <h2>Guest reviews <span className="muted hd-rev-count">({reviews.total})</span></h2>
              {reviews.list.length === 0 && !reviews.loading && <p className="muted">No reviews yet.</p>}
              <div className="hd-reviews">
                {reviews.list.map((r) => (
                  <article key={r._id} className="hd-review card">
                    <header>
                      <strong>{r.authorName}</strong>
                      <Stars value={r.rating} size={13} />
                      {r.isDemo && <span className="badge">Demo review</span>}
                      <time className="muted" dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                    </header>
                    {r.title && <h4>{r.title}</h4>}
                    <p className="muted">{r.comment}</p>
                  </article>
                ))}
              </div>
              {reviews.page < reviews.pages && (
                <button className="btn btn-ghost" disabled={reviews.loading} onClick={() => loadReviews(reviews.page + 1)}>
                  {reviews.loading ? <span className="spinner" /> : 'Show more reviews'}
                </button>
              )}
            </section>
          </div>

          <aside id="book" className="hd-booking card">
            <div className="hb-price">
              <strong>{formatMoney(selected?.pricing.pricePerNight ?? hotel.pricePerNight, hotel.currency)}</strong> <span className="muted">/ night</span>
            </div>

            <div className="hb-grid">
              <div className="field">
                <label htmlFor="hb-in">Check-in</label>
                <input id="hb-in" className="input" type="date" min={todayISO()} value={trip.checkIn} onChange={setTripField('checkIn')} />
              </div>
              <div className="field">
                <label htmlFor="hb-out">Check-out</label>
                <input id="hb-out" className="input" type="date" min={addDaysISO(trip.checkIn, 1)} value={trip.checkOut} onChange={setTripField('checkOut')} />
              </div>
              <div className="field">
                <label htmlFor="hb-adults">Adults</label>
                <select id="hb-adults" className="select" value={trip.adults} onChange={setTripField('adults')}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="hb-children">Children</label>
                <select id="hb-children" className="select" value={trip.children} onChange={setTripField('children')}>
                  {Array.from({ length: 9 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field hb-wide">
                <label htmlFor="hb-rooms">Rooms</label>
                <select id="hb-rooms" className="select" value={trip.rooms} onChange={setTripField('rooms')}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'room' : 'rooms'}</option>)}
                </select>
              </div>
            </div>

            <div className="hb-summary" aria-live="polite">
              {quote.loading && <p className="muted"><span className="spinner" /> Checking availability…</p>}
              {quote.error && <p className="form-error">{quote.error}</p>}
              {!quote.loading && selected && (
                <>
                  <div className="hb-row"><span>{formatMoney(selected.pricing.pricePerNight, hotel.currency)} × {selected.pricing.nights} night{selected.pricing.nights > 1 ? 's' : ''} × {trip.rooms} room{trip.rooms > 1 ? 's' : ''}</span><span>{formatMoney(selected.pricing.subtotal, hotel.currency)}</span></div>
                  {selected.pricing.discount > 0 && <div className="hb-row good"><span>{selected.pricing.discountLabel}</span><span>− {formatMoney(selected.pricing.discount, hotel.currency)}</span></div>}
                  <div className="hb-row"><span>Taxes ({selected.pricing.taxRatePercent}%)</span><span>{formatMoney(selected.pricing.taxes, hotel.currency)}</span></div>
                  <div className="hb-row total"><span>Estimated total</span><span>{formatMoney(selected.pricing.total, hotel.currency)}</span></div>
                  {!selected.canBook && (
                    <p className="form-error">{!selected.fitsGuests ? 'This room type can’t fit your party. Add rooms or pick a larger room.' : 'Not enough rooms left for these dates. Try other dates or another room.'}</p>
                  )}
                </>
              )}
              <small className="muted">Final price is confirmed by our server when you book.</small>
            </div>

            <button className="btn btn-gold btn-block" disabled={!selected?.canBook || quote.loading} onClick={() => navigate(bookHref)}>
              Book now
            </button>
          </aside>
        </div>

        {state.similar.length > 0 && (
          <section className="section">
            <div className="section-head"><h2>Similar hotels</h2></div>
            <div className="hd-similar">{state.similar.map((h) => <HotelCard key={h._id} hotel={h} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
