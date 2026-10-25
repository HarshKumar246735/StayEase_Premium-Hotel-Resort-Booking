import { Link } from 'react-router-dom';
import { CalendarDays, Download, MapPin, Star, Users, BedDouble } from 'lucide-react';
import HotelImage from '../common/HotelImage.jsx';
import { formatDate, formatMoney } from '../../utils/format.js';
import './BookingCard.css';

const STATUS_BADGE = { confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-error' };
const PAYMENT_LABEL = {
  demo_paid: 'Demo paid',
  pay_at_property: 'Pay at property',
  demo_refunded: 'Demo refunded',
  cancelled: 'Cancelled',
};

export default function BookingCard({ booking, onCancel, onReview, onDownload }) {
  const s = booking.snapshot;
  const status = booking.displayStatus;
  const canCancel = status === 'confirmed' && new Date(booking.checkIn) >= new Date(new Date().toISOString().slice(0, 10));
  const canReview = status === 'completed' && !booking.review;

  return (
    <article className="bk-card card">
      <div className="bkc-img"><HotelImage src={s.image} alt={s.hotelName} /></div>
      <div className="bkc-body">
        <header className="bkc-head">
          <div>
            <h3><Link to={`/hotels/${s.hotelSlug}`}>{s.hotelName}</Link></h3>
            <p className="muted"><MapPin size={14} /> {s.city}, {s.country}</p>
          </div>
          <div className="bkc-badges">
            <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
            <span className="badge">{PAYMENT_LABEL[booking.payment.status]}</span>
          </div>
        </header>

        <dl className="bkc-meta">
          <div><dt>Reference</dt><dd className="gold">{booking.reference}</dd></div>
          <div><dt><CalendarDays size={13} /> Dates</dt><dd>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</dd></div>
          <div><dt><BedDouble size={13} /> Room</dt><dd>{s.roomTypeName} × {booking.rooms}</dd></div>
          <div><dt><Users size={13} /> Guests</dt><dd>{booking.adults + booking.children}</dd></div>
          <div><dt>Total</dt><dd><strong>{formatMoney(booking.pricing.total, booking.pricing.currency)}</strong></dd></div>
        </dl>

        <div className="bkc-actions">
          <Link to={`/booking/confirmation/${booking._id}`} className="btn btn-outline btn-sm">View Details</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => onDownload(booking)}><Download size={14} /> Download Confirmation</button>
          {canReview && <button className="btn btn-gold btn-sm" onClick={() => onReview(booking)}><Star size={14} /> Write a review</button>}
          {canCancel && <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking)}>Cancel Booking</button>}
        </div>
      </div>
    </article>
  );
}
