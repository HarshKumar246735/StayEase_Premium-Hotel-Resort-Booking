import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Star } from 'lucide-react';
import ReviewModal from '../../components/booking/ReviewModal.jsx';
import HotelImage from '../../components/common/HotelImage.jsx';
import Stars from '../../components/common/Stars.jsx';
import { api, errMsg } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';
import './MyReviews.css';

export default function MyReviews() {
  const [data, setData] = useState({ loading: true, reviews: [], pending: [], error: '' });
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    Promise.all([api.get('/reviews/mine'), api.get('/bookings/my-bookings', { params: { tab: 'completed' } })])
      .then(([r, b]) => setData({ loading: false, reviews: r.data.reviews, pending: b.data.bookings.filter((x) => !x.review), error: '' }))
      .catch((e) => setData({ loading: false, reviews: [], pending: [], error: errMsg(e) }));
  }, []);
  useEffect(load, [load]);

  return (
    <div className="mr">
      <header className="mr-head">
        <h1>My Reviews</h1>
        <p className="muted">Share your experience after a completed stay.</p>
      </header>

      {data.error && <div className="form-error">{data.error}</div>}

      {data.pending.length > 0 && (
        <section className="mr-section">
          <h2>Waiting for your review</h2>
          <div className="mr-list">
            {data.pending.map((b) => (
              <div key={b._id} className="mr-item card">
                <div className="mr-img"><HotelImage src={b.snapshot.image} alt="" /></div>
                <div className="mr-info">
                  <strong>{b.snapshot.hotelName}</strong>
                  <small className="muted">Stayed {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</small>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => setModal({ booking: b })}><Star size={14} /> Write review</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mr-section">
        <h2>Your reviews</h2>
        {data.loading ? (
          <div className="skeleton mr-sk" />
        ) : data.reviews.length === 0 ? (
          <div className="state-box">
            <Star size={30} />
            <h3>No reviews yet</h3>
            <p>Once you’ve completed a stay, you can review it here. Only guests with a completed booking can review a hotel.</p>
            <Link to="/hotels" className="btn btn-gold">Explore hotels</Link>
          </div>
        ) : (
          <div className="mr-list">
            {data.reviews.map((r) => (
              <article key={r._id} className="mr-item mr-review card">
                <div className="mr-img"><HotelImage src={r.hotel?.images?.[0]} alt="" /></div>
                <div className="mr-info">
                  <strong><Link to={`/hotels/${r.hotel?.slug}`}>{r.hotel?.name}</Link></strong>
                  <div className="mr-meta"><Stars value={r.rating} size={14} /> <time className="muted">{formatDate(r.createdAt)}</time></div>
                  {r.title && <h4>{r.title}</h4>}
                  <p className="muted">{r.comment}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal({ review: r })}><Pencil size={14} /> Edit</button>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <ReviewModal
          hotelName={modal.booking?.snapshot.hotelName || modal.review?.hotel?.name}
          hotelId={modal.booking?.hotel}
          bookingId={modal.booking?._id}
          review={modal.review}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
