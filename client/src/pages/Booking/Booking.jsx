import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Banknote, Check, CreditCard, FlaskConical, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import HotelImage from '../../components/common/HotelImage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api, errMsg } from '../../services/api.js';
import { formatDate, formatMoney } from '../../utils/format.js';
import './Booking.css';

const STEPS = ['Guest details', 'Payment', 'Review & confirm'];
const METHODS = [
  { id: 'demo_upi', icon: Smartphone, title: 'Demo UPI', text: 'Simulated UPI payment. No real money moves.' },
  { id: 'demo_card', icon: CreditCard, title: 'Demo card', text: 'Simulated card payment. We never ask for card numbers.' },
  { id: 'pay_at_property', icon: Banknote, title: 'Pay at property', text: 'Reserve now and settle at check-in.' },
];

export default function Booking() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const trip = {
    checkIn: sp.get('checkIn') || '',
    checkOut: sp.get('checkOut') || '',
    adults: Number(sp.get('adults')) || 2,
    children: Number(sp.get('children')) || 0,
    rooms: Number(sp.get('rooms')) || 1,
  };
  const roomTypeId = sp.get('room') || '';

  const [hotel, setHotel] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState(0);
  const [guest, setGuest] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', specialRequests: '' });
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState('demo_upi');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  // One key per checkout attempt: repeated clicks or retries can never create two bookings.
  const idemKey = useRef(crypto.randomUUID());

  useEffect(() => {
    let alive = true;
    api
      .get(`/hotels/${slug}`)
      .then(async (r) => {
        const h = r.data.hotel;
        const q = await api.get(`/hotels/${h._id}/availability`, { params: trip });
        if (!alive) return;
        setHotel(h);
        setQuote(q.data);
      })
      .catch((e) => alive && setLoadError(errMsg(e)));
    return () => {
      alive = false;
    };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadError) {
    return (
      <div className="page container">
        <div className="state-box"><AlertTriangle size={32} /><h3>We couldn’t start your booking</h3><p>{loadError}</p><Link to={`/hotels/${slug}`} className="btn btn-gold">Back to hotel</Link></div>
      </div>
    );
  }
  if (!hotel || !quote) {
    return <div className="page container"><div className="skeleton bk-sk" /></div>;
  }

  const room = hotel.roomTypes.find((r) => r._id === roomTypeId);
  const rq = quote.roomTypes.find((r) => r.roomTypeId === roomTypeId);
  if (!room || !rq) {
    return (
      <div className="page container">
        <div className="state-box"><AlertTriangle size={32} /><h3>Choose a room first</h3><p>Please pick a room type and dates on the hotel page.</p><Link to={`/hotels/${slug}`} className="btn btn-gold">Back to hotel</Link></div>
      </div>
    );
  }
  const p = rq.pricing;

  const validateGuest = () => {
    const e = {};
    if (guest.fullName.trim().length < 2) e.fullName = 'Enter the lead guest’s full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guest.email)) e.email = 'Enter a valid email address.';
    if (!/^[+\d][\d\s()-]{6,18}$/.test(guest.phone)) e.phone = 'Enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateGuest()) return;
    setStep((s) => s + 1);
  };

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setSubmitError('');
    try {
      // Simulated processing delay for the demo payment methods (nothing is charged).
      if (method !== 'pay_at_property') await new Promise((r) => setTimeout(r, 1200));
      const { data } = await api.post('/bookings', {
        hotelId: hotel._id,
        roomTypeId,
        ...trip,
        guest,
        paymentMethod: method,
        idempotencyKey: idemKey.current,
      });
      toast.success('Booking confirmed!');
      navigate(`/booking/confirmation/${data.booking._id}`, { replace: true });
    } catch (err) {
      setSubmitError(errMsg(err));
      setBusy(false);
    }
  };

  const nights = p.nights;

  return (
    <div className="page booking">
      <div className="container">
        <Link to={`/hotels/${slug}`} className="bk-back muted"><ArrowLeft size={16} /> Back to hotel</Link>
        <h1>Complete your booking</h1>

        <ol className="bk-steps" aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li key={s} className={`${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}>
              <span>{i < step ? <Check size={14} /> : i + 1}</span> {s}
            </li>
          ))}
        </ol>

        <div className="bk-layout">
          <div className="bk-main card">
            <div className="bk-demo"><FlaskConical size={16} /> Demo checkout — no real payment is taken and no card details are collected.</div>

            {step === 0 && (
              <section>
                <h2>Guest details</h2>
                <div className="bk-form">
                  <div className="field">
                    <label htmlFor="g-name">Lead guest full name</label>
                    <input id="g-name" className={`input ${errors.fullName ? 'invalid' : ''}`} value={guest.fullName} onChange={(e) => setGuest({ ...guest, fullName: e.target.value })} autoComplete="name" />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="g-email">Email</label>
                    <input id="g-email" type="email" className={`input ${errors.email ? 'invalid' : ''}`} value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} autoComplete="email" />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="g-phone">Phone</label>
                    <input id="g-phone" type="tel" className={`input ${errors.phone ? 'invalid' : ''}`} value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} autoComplete="tel" placeholder="+91 98765 43210" />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  <div className="field bk-wide">
                    <label htmlFor="g-req">Special requests (optional)</label>
                    <textarea id="g-req" className="textarea" maxLength={400} value={guest.specialRequests} onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })} />
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section>
                <h2>Choose a demo payment method</h2>
                <div className="bk-methods" role="radiogroup" aria-label="Payment method">
                  {METHODS.map(({ id, icon: Icon, title, text }) => (
                    <label key={id} className={`bk-method ${method === id ? 'on' : ''}`}>
                      <input type="radio" name="method" checked={method === id} onChange={() => setMethod(id)} />
                      <Icon size={22} />
                      <div><strong>{title}</strong><small>{text}</small></div>
                      {id !== 'pay_at_property' && <span className="badge badge-gold">DEMO</span>}
                    </label>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2>Review &amp; confirm</h2>
                <dl className="bk-review">
                  <div><dt>Guest</dt><dd>{guest.fullName}<br /><span className="muted">{guest.email} · {guest.phone}</span></dd></div>
                  <div><dt>Payment</dt><dd>{METHODS.find((m) => m.id === method).title}{method !== 'pay_at_property' && <span className="badge badge-gold bk-inline">Simulated</span>}</dd></div>
                  <div><dt>Cancellation</dt><dd className="muted">{hotel.cancellationPolicy}</dd></div>
                </dl>
                <label className="bk-agree">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  I understand this is a demo booking and agree to the cancellation policy.
                </label>
                {submitError && <div className="form-error" role="alert">{submitError} <Link to={`/hotels/${slug}`}>Choose different dates or room</Link></div>}
              </section>
            )}

            <div className="bk-actions">
              {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)} disabled={busy}>Back</button>}
              {step < 2 ? (
                <button className="btn btn-gold" onClick={next}>Continue</button>
              ) : (
                <button className="btn btn-gold" onClick={confirm} disabled={!agree || busy}>
                  {busy ? <><span className="spinner" /> {method === 'pay_at_property' ? 'Confirming…' : 'Processing demo payment…'}</> : `Confirm booking · ${formatMoney(p.total, p.currency)}`}
                </button>
              )}
            </div>
          </div>

          <aside className="bk-summary card">
            <div className="bk-hotel">
              <div className="bk-thumb"><HotelImage src={hotel.images[0]} alt="" /></div>
              <div><strong>{hotel.name}</strong><small className="muted">{hotel.city}, {hotel.country}</small></div>
            </div>
            <dl className="bk-facts">
              <div><dt>Room</dt><dd>{room.name} × {trip.rooms}</dd></div>
              <div><dt>Check-in</dt><dd>{formatDate(quote.checkIn)}</dd></div>
              <div><dt>Check-out</dt><dd>{formatDate(quote.checkOut)}</dd></div>
              <div><dt>Guests</dt><dd>{trip.adults} adult{trip.adults > 1 ? 's' : ''}{trip.children ? `, ${trip.children} child${trip.children > 1 ? 'ren' : ''}` : ''}</dd></div>
            </dl>
            <div className="bk-price">
              <div><span>{formatMoney(p.pricePerNight, p.currency)} × {nights} night{nights > 1 ? 's' : ''} × {trip.rooms}</span><span>{formatMoney(p.subtotal, p.currency)}</span></div>
              {p.discount > 0 && <div className="good"><span>{p.discountLabel}</span><span>− {formatMoney(p.discount, p.currency)}</span></div>}
              <div><span>Taxes ({p.taxRatePercent}%)</span><span>{formatMoney(p.taxes, p.currency)}</span></div>
              <div className="total"><span>Total</span><span>{formatMoney(p.total, p.currency)}</span></div>
            </div>
            {!rq.canBook && <div className="form-error">This selection is no longer available. Please go back and choose again.</div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
