import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Search, Users, BedDouble } from 'lucide-react';
import { api } from '../../services/api.js';
import { addDaysISO, todayISO } from '../../utils/format.js';
import './SearchPanel.css';

export default function SearchPanel() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({ q: '', checkIn: '', checkOut: '', guests: 2, rooms: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/hotels/destinations').then((r) => setCities(r.data.destinations.map((d) => d.city))).catch(() => {});
  }, []);

  const set = (k) => (e) => {
    const value = e.target.value;
    setError('');
    setForm((f) => {
      const next = { ...f, [k]: value };
      if (k === 'checkIn' && next.checkOut && next.checkOut <= value) next.checkOut = addDaysISO(value, 1);
      return next;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if ((form.checkIn && !form.checkOut) || (!form.checkIn && form.checkOut)) {
      setError('Please choose both check-in and check-out dates.');
      return;
    }
    const params = new URLSearchParams();
    if (form.q.trim()) params.set('q', form.q.trim());
    if (form.checkIn) params.set('checkIn', form.checkIn);
    if (form.checkOut) params.set('checkOut', form.checkOut);
    params.set('guests', form.guests);
    params.set('rooms', form.rooms);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form className="search-panel" onSubmit={submit} role="search" aria-label="Search hotels">
      <div className="sp-field sp-wide">
        <MapPin size={18} />
        <div>
          <label htmlFor="sp-dest">Where are you going?</label>
          <input id="sp-dest" list="sp-cities" placeholder="Search destination or hotel…" value={form.q} onChange={set('q')} autoComplete="off" />
          <datalist id="sp-cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
      <div className="sp-field">
        <CalendarDays size={18} />
        <div>
          <label htmlFor="sp-in">Check-in</label>
          <input id="sp-in" type="date" min={todayISO()} value={form.checkIn} onChange={set('checkIn')} />
        </div>
      </div>
      <div className="sp-field">
        <CalendarDays size={18} />
        <div>
          <label htmlFor="sp-out">Check-out</label>
          <input id="sp-out" type="date" min={form.checkIn ? addDaysISO(form.checkIn, 1) : todayISO()} value={form.checkOut} onChange={set('checkOut')} />
        </div>
      </div>
      <div className="sp-field sp-small">
        <Users size={18} />
        <div>
          <label htmlFor="sp-guests">Guests</label>
          <select id="sp-guests" value={form.guests} onChange={set('guests')}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
          </select>
        </div>
      </div>
      <div className="sp-field sp-small">
        <BedDouble size={18} />
        <div>
          <label htmlFor="sp-rooms">Rooms</label>
          <select id="sp-rooms" value={form.rooms} onChange={set('rooms')}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>)}
          </select>
        </div>
      </div>
      <button className="btn btn-gold sp-submit" type="submit"><Search size={18} /> Search Hotels</button>
      {error && <p className="sp-error" role="alert">{error}</p>}
    </form>
  );
}
