import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import HotelCard, { HotelCardSkeleton } from '../../components/hotels/HotelCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { api, errMsg } from '../../services/api.js';
import { AMENITY_OPTIONS, PROPERTY_TYPES, formatMoney } from '../../utils/format.js';
import './ExploreHotels.css';

const SORTS = [
  ['recommended', 'Recommended'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['rating', 'Highest rated'],
  ['reviews', 'Most reviewed'],
];
const TOGGLES = [
  ['breakfast', 'Breakfast included'],
  ['freeCancellation', 'Free cancellation'],
  ['pool', 'Swimming pool'],
  ['family', 'Family-friendly'],
  ['pet', 'Pet-friendly'],
];
const OFFER_LABELS = { weekend: 'Weekend getaways', luxury: 'Luxury resort deals', family: 'Family vacations', honeymoon: 'Honeymoon packages', longstay: 'Long-stay discounts' };

export default function ExploreHotels() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('grid');
  const [drawer, setDrawer] = useState(false);
  const [text, setText] = useState({ q: params.get('q') || '', minPrice: params.get('minPrice') || '', maxPrice: params.get('maxPrice') || '' });

  const query = params.toString();

  // Keep draft text inputs in sync when the URL changes elsewhere (chips, clear all, navigation).
  useEffect(() => {
    setText({ q: params.get('q') || '', minPrice: params.get('minPrice') || '', maxPrice: params.get('maxPrice') || '' });
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get('/hotels', { params: Object.fromEntries(params) })
      .then((r) => alive && setData(r.data))
      .catch((e) => alive && setError(errMsg(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const toggleList = (key, value) => {
    const cur = (params.get(key) || '').split(',').filter(Boolean);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    update({ [key]: next.join(',') });
  };
  const inList = (key, value) => (params.get(key) || '').split(',').includes(value);

  const chips = useMemo(() => {
    const out = [];
    const add = (key, label, clear = { [key]: '' }) => out.push({ key: `${key}-${label}`, label, clear });
    if (params.get('q')) add('q', `“${params.get('q')}”`);
    if (params.get('city')) add('city', params.get('city'));
    if (params.get('minPrice')) add('minPrice', `Min ${formatMoney(Number(params.get('minPrice')))}`);
    if (params.get('maxPrice')) add('maxPrice', `Max ${formatMoney(Number(params.get('maxPrice')))}`);
    if (params.get('stars')) add('stars', `${params.get('stars')}★ & up`);
    if (params.get('rating')) add('rating', `${params.get('rating')}+ guest rating`);
    if (params.get('offer')) add('offer', OFFER_LABELS[params.get('offer')] || 'Offer');
    if (params.get('guests')) add('guests', `${params.get('guests')} guests`, { guests: '', rooms: '' });
    if (params.get('checkIn') && params.get('checkOut')) add('checkIn', `${params.get('checkIn')} → ${params.get('checkOut')}`, { checkIn: '', checkOut: '' });
    (params.get('types') || '').split(',').filter(Boolean).forEach((t) => out.push({ key: `t-${t}`, label: t, clear: { types: (params.get('types') || '').split(',').filter((x) => x && x !== t).join(',') } }));
    (params.get('amenities') || '').split(',').filter(Boolean).forEach((a) => out.push({ key: `a-${a}`, label: a, clear: { amenities: (params.get('amenities') || '').split(',').filter((x) => x && x !== a).join(',') } }));
    TOGGLES.forEach(([k, label]) => params.get(k) === 'true' && add(k, label));
    return out;
  }, [params]);

  const applyText = (e) => {
    e?.preventDefault();
    update({ q: text.q.trim(), minPrice: text.minPrice, maxPrice: text.maxPrice });
  };
  const clearAll = () => {
    const keep = new URLSearchParams();
    if (params.get('sort')) keep.set('sort', params.get('sort'));
    setParams(keep);
  };

  const filters = (
    <form className="ex-filters" onSubmit={applyText}>
      <div className="ex-filter-head">
        <h2>Filters</h2>
        {chips.length > 0 && <button type="button" className="ex-clear" onClick={clearAll}>Clear all</button>}
      </div>

      <div className="ex-group">
        <label className="label" htmlFor="ex-q">Destination or hotel</label>
        <div className="ex-search">
          <Search size={16} />
          <input id="ex-q" className="input" placeholder="e.g. Goa, Paris…" value={text.q} onChange={(e) => setText({ ...text, q: e.target.value })} />
        </div>
      </div>

      <div className="ex-group">
        <span className="label">Price per night (₹)</span>
        <div className="ex-price">
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={text.minPrice} onChange={(e) => setText({ ...text, minPrice: e.target.value })} />
          <span>–</span>
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={text.maxPrice} onChange={(e) => setText({ ...text, maxPrice: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-ghost btn-sm">Apply</button>
      </div>

      <div className="ex-group">
        <label className="label" htmlFor="ex-stars">Star rating</label>
        <select id="ex-stars" className="select" value={params.get('stars') || ''} onChange={(e) => update({ stars: e.target.value })}>
          <option value="">Any</option>
          {[5, 4, 3].map((s) => <option key={s} value={s}>{s} stars &amp; up</option>)}
        </select>
      </div>

      <div className="ex-group">
        <label className="label" htmlFor="ex-rating">Guest rating</label>
        <select id="ex-rating" className="select" value={params.get('rating') || ''} onChange={(e) => update({ rating: e.target.value })}>
          <option value="">Any</option>
          {[4.5, 4, 3.5].map((s) => <option key={s} value={s}>{s}+ rating</option>)}
        </select>
      </div>

      <fieldset className="ex-group">
        <legend className="label">Property type</legend>
        <div className="ex-checks">
          {PROPERTY_TYPES.map((t) => (
            <label key={t} className="ex-check"><input type="checkbox" checked={inList('types', t)} onChange={() => toggleList('types', t)} /> {t}</label>
          ))}
        </div>
      </fieldset>

      <fieldset className="ex-group">
        <legend className="label">Popular filters</legend>
        <div className="ex-checks">
          {TOGGLES.map(([k, label]) => (
            <label key={k} className="ex-check"><input type="checkbox" checked={params.get(k) === 'true'} onChange={(e) => update({ [k]: e.target.checked ? 'true' : '' })} /> {label}</label>
          ))}
        </div>
      </fieldset>

      <fieldset className="ex-group">
        <legend className="label">Amenities</legend>
        <div className="ex-checks">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="ex-check"><input type="checkbox" checked={inList('amenities', a)} onChange={() => toggleList('amenities', a)} /> {a}</label>
          ))}
        </div>
      </fieldset>
    </form>
  );

  const results = data?.hotels || [];

  return (
    <div className="page explore">
      <div className="container">
        <div className="ex-title">
          <h1>Explore Hotels</h1>
          <p className="muted">Search, filter and compare sample stays from around the world.</p>
        </div>

        <div className="ex-layout">
          <aside className="ex-side card">{filters}</aside>

          <section className="ex-main">
            <div className="ex-toolbar">
              <button className="btn btn-ghost btn-sm ex-filter-btn" onClick={() => setDrawer(true)}>
                <SlidersHorizontal size={16} /> Filters{chips.length ? ` (${chips.length})` : ''}
              </button>
              <p className="ex-count" aria-live="polite">
                {loading ? 'Searching…' : error ? '' : <><strong>{data.total}</strong> {data.total === 1 ? 'stay' : 'stays'} found</>}
              </p>
              <div className="ex-tools">
                <label className="sr-only" htmlFor="ex-sort">Sort by</label>
                <select id="ex-sort" className="select ex-sort" value={params.get('sort') || 'recommended'} onChange={(e) => update({ sort: e.target.value === 'recommended' ? '' : e.target.value })}>
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <div className="ex-views" role="group" aria-label="Layout">
                  <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={18} /></button>
                  <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={18} /></button>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="ex-chips">
                {chips.map((c) => (
                  <button key={c.key} className="ex-chip" onClick={() => update(c.clear)}>{c.label} <X size={13} /></button>
                ))}
                <button className="ex-chip clear" onClick={clearAll}>Clear all</button>
              </div>
            )}

            {error ? (
              <div className="state-box">
                <AlertTriangle size={32} />
                <h3>We couldn’t load hotels</h3>
                <p>{error}</p>
                <button className="btn btn-gold" onClick={() => setParams(new URLSearchParams(params))}>Try again</button>
              </div>
            ) : loading ? (
              <div className={`ex-results ${view}`}>{Array.from({ length: 6 }, (_, i) => <HotelCardSkeleton key={i} layout={view} />)}</div>
            ) : results.length === 0 ? (
              <div className="state-box">
                <Search size={32} />
                <h3>No hotels match your search</h3>
                <p>Try removing a few filters or searching a different destination.</p>
                <button className="btn btn-gold" onClick={clearAll}>Clear all filters</button>
              </div>
            ) : (
              <>
                <div className={`ex-results ${view}`}>{results.map((h) => <HotelCard key={h._id} hotel={h} layout={view} />)}</div>
                <Pagination page={data.page} pages={data.pages} onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
          </section>
        </div>
      </div>

      {drawer && (
        <div className="ex-drawer-wrap" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="ex-drawer" role="dialog" aria-modal="true" aria-label="Filters">
            <button className="ex-drawer-close" onClick={() => setDrawer(false)} aria-label="Close filters"><X size={20} /></button>
            {filters}
            <button className="btn btn-gold btn-block ex-drawer-done" onClick={() => { applyText(); setDrawer(false); }}>
              Show {data ? data.total : ''} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
