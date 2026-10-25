import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarCheck, Headphones, Heart, Home as HomeIcon, MapPin, Percent, ShieldCheck, Sparkles, Tag, Users, Wallet } from 'lucide-react';
import SearchPanel from '../../components/hotels/SearchPanel.jsx';
import HotelCard, { HotelCardSkeleton } from '../../components/hotels/HotelCard.jsx';
import HotelImage from '../../components/common/HotelImage.jsx';
import { api } from '../../services/api.js';
import { HERO_IMAGE, formatMoney } from '../../utils/format.js';
import './Home.css';

const POPULAR = ['Bali', 'Paris', 'Dubai', 'New York', 'Santorini', 'London', 'Tokyo', 'Singapore', 'Maldives', 'Jaipur', 'Goa', 'Manali', 'Mumbai', 'Delhi', 'Udaipur'];

const OFFER_META = {
  weekend: { title: 'Weekend Getaways', text: 'Friday or Saturday arrivals at selected stays.', icon: CalendarCheck },
  luxury: { title: 'Luxury Resort Deals', text: 'Five-star resort escapes at special rates.', icon: Sparkles },
  family: { title: 'Family Vacations', text: 'Spacious stays that work for the whole family.', icon: Users },
  honeymoon: { title: 'Honeymoon Packages', text: 'Romantic villas, boutiques and heritage stays.', icon: Heart },
  longstay: { title: 'Long-stay Discounts', text: 'Stay five nights or more and save.', icon: Wallet },
};

const WHY = [
  { icon: CalendarCheck, title: 'Easy booking', text: 'Pick a room, choose dates and confirm in a few clicks.' },
  { icon: ShieldCheck, title: 'Secure authentication', text: 'Passwords are hashed and sessions use httpOnly cookies.' },
  { icon: Percent, title: 'Transparent pricing', text: 'Nightly rate, discounts and taxes shown before you book.' },
  { icon: BadgeCheck, title: 'Flexible cancellation info', text: 'Every listing states its cancellation policy up front.' },
  { icon: HomeIcon, title: 'Clear hotel information', text: 'Amenities, room types and check-in times in one place.' },
  { icon: Headphones, title: 'Support interface', text: 'Help centre and FAQs available from your dashboard.' },
];

const TESTIMONIALS = [
  { name: 'Aanya K.', place: 'Stayed in Goa', text: 'Booking was effortless and the price breakdown was clear from the start.' },
  { name: 'Marcus L.', place: 'Stayed in Dubai', text: 'Loved being able to compare room types and see the cancellation rules before paying.' },
  { name: 'Hiro T.', place: 'Stayed in Kyoto', text: 'Saving favourites to my wishlist made planning our trip so much easier.' },
];

const TRUST = [
  { icon: Percent, title: 'Transparent Pricing', text: 'See taxes up front' },
  { icon: ShieldCheck, title: 'Secure Login', text: 'Your data stays safe' },
  { icon: Headphones, title: 'Help Centre', text: 'FAQs in your dashboard' },
  { icon: CalendarCheck, title: 'Easy Booking', text: 'Book in just a few clicks' },
];

export default function Home() {
  const [dests, setDests] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/hotels/destinations'), api.get('/hotels/featured'), api.get('/hotels/offers')])
      .then(([d, f, o]) => {
        if (!alive) return;
        setDests(d.data.destinations);
        setFeatured(f.data.hotels);
        setOffers(o.data.offers);
      })
      .catch(() => alive && setError('We could not load listings right now. Please make sure the API is running and try again.'));
    return () => {
      alive = false;
    };
  }, []);

  const popular = POPULAR.map((c) => dests.find((d) => d.city === c)).filter(Boolean);
  const maxDiscount = offers.reduce((m, o) => Math.max(m, o.maxDiscount || 0), 0);
  const bannerImage = offers[0]?.sampleImage;

  return (
    <div className="home">
      <section className="hero">
        <HotelImage src={HERO_IMAGE} alt="" eager className="hero-bg" />
        <div className="hero-overlay" />
        <div className="container hero-inner">
          <h1>
            Find Your Perfect <br />
            <span className="gold">Stay</span> Anywhere.
          </h1>
          <p>Discover extraordinary hotels, beautiful resorts, and unforgettable destinations around the world.</p>
          <SearchPanel />
        </div>
      </section>

      <section className="trust container">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <div className="trust-item" key={title}>
            <span className="trust-icon"><Icon size={20} /></span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="container section">
          <div className="state-box"><h3>Listings unavailable</h3><p>{error}</p></div>
        </div>
      )}

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Popular Destinations</h2>
            <p>Explore top destinations and find the perfect place for your next getaway.</p>
          </div>
          <Link to="/destinations" className="link-more">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="dest-grid">
          {(popular.length ? popular : Array.from({ length: 10 })).map((d, i) =>
            d ? (
              <Link key={d.city} to={`/hotels?city=${encodeURIComponent(d.city)}`} className="dest-card">
                <HotelImage src={d.image} alt={d.city} />
                <div className="dest-info">
                  <strong><MapPin size={14} /> {d.city}</strong>
                  <small>{d.country} · {d.hotels} stays</small>
                </div>
              </Link>
            ) : (
              <div key={i} className="dest-card skeleton" />
            ),
          )}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Featured Hotels &amp; Resorts</h2>
            <p>Handpicked demo stays for an unforgettable experience.</p>
          </div>
          <Link to="/hotels" className="link-more">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="hotel-grid">
          {featured ? featured.map((h) => <HotelCard key={h._id} hotel={h} />) : Array.from({ length: 4 }, (_, i) => <HotelCardSkeleton key={i} />)}
        </div>
      </section>

      <section className="container">
        <div className="deal-banner">
          {bannerImage && <HotelImage src={bannerImage} alt="" />}
          <div className="deal-shade" />
          <div className="deal-copy">
            <span className="badge badge-gold"><Tag size={12} /> Exclusive deals</span>
            <h2>{maxDiscount ? <>Save Up to {maxDiscount}% on Your <span className="gold">Next Stay</span></> : <>Find Your <span className="gold">Next Stay</span></>}</h2>
            <p>Limited-time offers on selected demo hotels and resorts.</p>
            <Link to="/offers" className="btn btn-gold">Explore Deals <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div>
              <h2>Special Offers</h2>
              <p>Discounts shown here come directly from the listings that offer them.</p>
            </div>
          </div>
          <div className="offer-grid">
            {offers.map((o) => {
              const meta = OFFER_META[o.kind];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <Link key={o.kind} to={`/hotels?offer=${o.kind}`} className="offer-card card">
                  <span className="offer-icon"><Icon size={22} /></span>
                  <h3>{meta.title}</h3>
                  <p>{meta.text}</p>
                  <div className="offer-foot">
                    <span className="badge badge-gold">Up to {o.maxDiscount}% off</span>
                    <small className="muted">{o.hotels} stays{o.minNights > 1 ? ` · ${o.minNights}+ nights` : ''}</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>Why StayEase?</h2>
            <p>A simple, transparent way to plan your stay.</p>
          </div>
        </div>
        <div className="why-grid">
          {WHY.map(({ icon: Icon, title, text }) => (
            <div className="why-card card" key={title}>
              <span className="why-icon"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <h2>What Travelers Say</h2>
            <p>Demo testimonials — sample content for illustration only.</p>
          </div>
          <span className="badge">Demo content</span>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <figure className="testi card" key={t.name}>
              <blockquote>“{t.text}”</blockquote>
              <figcaption>
                <strong>{t.name}</strong>
                <small>{t.place}</small>
              </figcaption>
            </figure>
          ))}
        </div>
        {featured?.[0] && (
          <p className="home-note muted">Prices shown in {featured[0].currency}, e.g. {formatMoney(featured[0].pricePerNight, featured[0].currency)} per night at {featured[0].name}.</p>
        )}
      </section>
    </div>
  );
}
