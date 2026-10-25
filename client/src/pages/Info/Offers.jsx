import { useEffect, useState } from 'react';
import HotelCard, { HotelCardSkeleton } from '../../components/hotels/HotelCard.jsx';
import { api, errMsg } from '../../services/api.js';
import './Info.css';

const TITLES = { weekend: 'Weekend getaways', luxury: 'Luxury resort deals', family: 'Family vacations', honeymoon: 'Honeymoon packages', longstay: 'Long-stay discounts' };

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [kind, setKind] = useState('');
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/hotels/offers').then((r) => {
      setOffers(r.data.offers);
      if (r.data.offers[0]) setKind(r.data.offers[0].kind);
      else setHotels([]);
    }).catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(() => {
    if (!kind) return;
    setHotels(null);
    api.get('/hotels', { params: { offer: kind, limit: 24, sort: 'rating' } }).then((r) => setHotels(r.data.hotels)).catch((e) => setError(errMsg(e)));
  }, [kind]);

  return (
    <div className="page container">
      <header className="info-head">
        <h1>Special Offers</h1>
        <p className="muted">Discounts apply automatically at checkout when your stay qualifies.</p>
      </header>
      {error && <div className="form-error">{error}</div>}
      <div className="offer-tabs" role="tablist">
        {offers.map((o) => (
          <button key={o.kind} role="tab" aria-selected={kind === o.kind} className={kind === o.kind ? 'on' : ''} onClick={() => setKind(o.kind)}>
            {TITLES[o.kind]} · up to {o.maxDiscount}%
          </button>
        ))}
      </div>
      <div className="offer-hotels">
        {hotels === null ? Array.from({ length: 4 }, (_, i) => <HotelCardSkeleton key={i} />) : hotels.map((h) => <HotelCard key={h._id} hotel={h} />)}
      </div>
      {hotels && hotels.length === 0 && !error && <p className="muted">No offers are available right now.</p>}
    </div>
  );
}
