import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Download, FlaskConical, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, errMsg } from '../../services/api.js';
import { formatDate, formatMoney } from '../../utils/format.js';
import { downloadConfirmationPdf, qrDataUrl, verifyUrlFor } from '../../utils/pdf.js';
import './BookingConfirmation.css';

export const PAYMENT_LABEL = {
  demo_paid: 'Demo payment (simulated)',
  pay_at_property: 'Pay at property',
  demo_refunded: 'Demo refund (simulated)',
  cancelled: 'Cancelled',
};

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get(`/bookings/${id}/confirmation`)
      .then(async (r) => {
        const b = r.data.booking;
        const code = await qrDataUrl(verifyUrlFor(b));
        if (!alive) return;
        setBooking(b);
        setQr(code);
      })
      .catch((e) => alive && setError(errMsg(e)));
    return () => {
      alive = false;
    };
  }, [id]);

  const download = async () => {
    setBusy(true);
    try {
      await downloadConfirmationPdf(booking);
    } catch {
      toast.error('Could not generate the PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="page container">
        <div className="state-box"><AlertTriangle size={32} /><h3>Booking not found</h3><p>{error}</p><Link to="/dashboard/bookings" className="btn btn-gold">My bookings</Link></div>
      </div>
    );
  }
  if (!booking) return <div className="page container"><div className="skeleton bc-sk" /></div>;

  const s = booking.snapshot;
  const p = booking.pricing;
  const cancelled = booking.status === 'cancelled';

  return (
    <div className="page confirm">
      <div className="container bc-wrap">
        <div className="bc-hero">
          <CheckCircle2 size={44} className={cancelled ? 'bc-bad' : 'bc-ok'} />
          <h1>{cancelled ? 'Booking cancelled' : 'Booking confirmed'}</h1>
          <p className="muted">Reference <strong className="gold">{booking.reference}</strong></p>
          <span className="badge badge-gold"><FlaskConical size={12} /> Demo booking — no real payment</span>
        </div>

        <div className="bc-card card">
          <div className="bc-main">
            <h2>{s.hotelName}</h2>
            <p className="muted bc-loc"><MapPin size={15} /> {s.address}, {s.city}, {s.country}</p>

            <dl className="bc-grid">
              <div><dt>Check-in</dt><dd>{formatDate(booking.checkIn)}<small>from {s.checkInTime}</small></dd></div>
              <div><dt>Check-out</dt><dd>{formatDate(booking.checkOut)}<small>until {s.checkOutTime}</small></dd></div>
              <div><dt>Room</dt><dd>{s.roomTypeName}<small>× {booking.rooms} room{booking.rooms > 1 ? 's' : ''}</small></dd></div>
              <div><dt>Guests</dt><dd>{booking.adults} adult{booking.adults > 1 ? 's' : ''}{booking.children ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}` : ''}</dd></div>
              <div><dt>Lead guest</dt><dd>{booking.guest.fullName}</dd></div>
              <div><dt>Payment</dt><dd>{PAYMENT_LABEL[booking.payment.status]}{booking.payment.demoTransactionId && <small>{booking.payment.demoTransactionId}</small>}</dd></div>
            </dl>

            <div className="bc-price">
              <div><span>{formatMoney(p.pricePerNight, p.currency)} × {p.nights} night{p.nights > 1 ? 's' : ''} × {booking.rooms}</span><span>{formatMoney(p.subtotal, p.currency)}</span></div>
              {p.discount > 0 && <div className="good"><span>{p.discountLabel}</span><span>− {formatMoney(p.discount, p.currency)}</span></div>}
              <div><span>Taxes ({p.taxRatePercent}%)</span><span>{formatMoney(p.taxes, p.currency)}</span></div>
              <div className="total"><span>Total</span><span>{formatMoney(p.total, p.currency)}</span></div>
            </div>
            <p className="muted bc-policy">{s.cancellationPolicy}</p>
          </div>

          <div className="bc-qr">
            {qr && <img src={qr} alt={`QR code to verify booking ${booking.reference}`} width="180" height="180" />}
            <small className="muted">Scan to verify this booking</small>
            <button className="btn btn-gold btn-block" onClick={download} disabled={busy}>
              {busy ? <span className="spinner" /> : <><Download size={16} /> Download PDF</>}
            </button>
            <Link to="/dashboard/bookings" className="btn btn-ghost btn-block">View my bookings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
