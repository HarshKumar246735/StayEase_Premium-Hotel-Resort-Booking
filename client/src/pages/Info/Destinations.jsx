import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import HotelImage from '../../components/common/HotelImage.jsx';
import { api, errMsg } from '../../services/api.js';
import { formatMoney } from '../../utils/format.js';
import './Info.css';

export default function Destinations() {
  const [state, setState] = useState({ loading: true, list: [], error: '' });
  useEffect(() => {
    api
      .get('/hotels/destinations')
      .then((r) => setState({ loading: false, list: r.data.destinations, error: '' }))
      .catch((e) => setState({ loading: false, list: [], error: errMsg(e) }));
  }, []);

  return (
    <div className="page container">
      <header className="info-head">
        <h1>Destinations</h1>
        <p className="muted">Browse every destination with sample stays on StayEase.</p>
      </header>
      {state.error && <div className="form-error">{state.error}</div>}
      <div className="dest-list">
        {state.loading
          ? Array.from({ length: 10 }, (_, i) => <div key={i} className="skeleton dest-sk" />)
          : state.list.map((d) => (
              <Link key={d.city} to={`/hotels?city=${encodeURIComponent(d.city)}`} className="dest-tile">
                <HotelImage src={d.image} alt={d.city} />
                <div>
                  <strong><MapPin size={14} /> {d.city}</strong>
                  <small>{d.country} · {d.hotels} stays · from {formatMoney(d.fromPrice)}</small>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
