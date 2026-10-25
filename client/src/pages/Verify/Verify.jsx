import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, XCircle } from 'lucide-react';
import { api, errMsg } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';
import './Verify.css';

export default function Verify() {
  const { code } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    let alive = true;
    api
      .get(`/bookings/verify/${code}`)
      .then((r) => alive && setState({ loading: false, data: r.data, error: '' }))
      .catch((e) => alive && setState({ loading: false, data: null, error: errMsg(e) }));
    return () => {
      alive = false;
    };
  }, [code]);

  const { loading, data, error } = state;
  return (
    <div className="page container verify">
      <div className="card vf-card">
        {loading && <span className="spinner" />}
        {error && (
          <>
            <XCircle size={44} className="vf-bad" />
            <h1>Booking not found</h1>
            <p className="muted">{error}</p>
          </>
        )}
        {data && (
          <>
            {data.valid ? <BadgeCheck size={44} className="vf-ok" /> : <XCircle size={44} className="vf-bad" />}
            <h1>{data.valid ? 'Valid booking' : `Booking ${data.status}`}</h1>
            <p className="muted">Reference <strong className="gold">{data.reference}</strong></p>
            <dl>
              <div><dt>Hotel</dt><dd>{data.hotelName}</dd></div>
              <div><dt>Location</dt><dd>{data.city}, {data.country}</dd></div>
              <div><dt>Stay</dt><dd>{formatDate(data.checkIn)} → {formatDate(data.checkOut)}</dd></div>
              <div><dt>Guest</dt><dd>{data.guestName}</dd></div>
            </dl>
            <span className="badge badge-gold">Demo booking</span>
          </>
        )}
        <Link to="/" className="btn btn-ghost">Back to StayEase</Link>
      </div>
    </div>
  );
}
