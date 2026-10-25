import { Link } from 'react-router-dom';
import { Coffee, Heart, MapPin, PawPrint, Star, Tag, Waves, Wifi } from 'lucide-react';
import HotelImage from '../common/HotelImage.jsx';
import Stars from '../common/Stars.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { formatMoney } from '../../utils/format.js';
import './HotelCard.css';

const AMENITY_ICONS = { 'Wi-Fi': Wifi, 'Swimming Pool': Waves, 'Breakfast Included': Coffee, 'Pet Friendly': PawPrint };

export default function HotelCard({ hotel, layout = 'grid' }) {
  const { ids, toggle } = useWishlist();
  const saved = ids.has(hotel._id);
  const shown = hotel.amenities.slice(0, 3);
  const offer = hotel.offer?.kind ? hotel.offer : null;

  return (
    <article className={`hotel-card card ${layout}`}>
      <div className="hc-media">
        <Link to={`/hotels/${hotel.slug}`} aria-label={`View ${hotel.name}`}>
          <HotelImage src={hotel.images[0]} alt={hotel.name} />
        </Link>
        <button className={`hc-heart ${saved ? 'saved' : ''}`} onClick={() => toggle(hotel)} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}>
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {offer && (
          <span className="hc-offer">
            <Tag size={12} /> {offer.discountPercent}% off · {offer.label}
          </span>
        )}
      </div>

      <div className="hc-body">
        <div className="hc-top">
          <h3 className="hc-name"><Link to={`/hotels/${hotel.slug}`}>{hotel.name}</Link></h3>
          <p className="hc-loc"><MapPin size={14} /> {hotel.city}, {hotel.country}</p>
        </div>

        <div className="hc-rating">
          <Stars value={hotel.starRating} />
          <span className="hc-score"><Star size={12} fill="currentColor" /> {hotel.guestRating.toFixed(1)}</span>
          <span className="muted hc-reviews">({hotel.reviewCount.toLocaleString('en-IN')} reviews)</span>
        </div>

        <ul className="hc-amenities">
          <li className="hc-type">{hotel.propertyType}</li>
          {shown.map((a) => {
            const Icon = AMENITY_ICONS[a];
            return <li key={a}>{Icon && <Icon size={12} />} {a}</li>;
          })}
        </ul>

        <div className="hc-foot">
          <div className="hc-price">
            <strong>{formatMoney(hotel.pricePerNight, hotel.currency)}</strong>
            <span>/ night</span>
          </div>
          <Link to={`/hotels/${hotel.slug}`} className="btn btn-outline btn-sm">View Details</Link>
        </div>
      </div>
    </article>
  );
}

export function HotelCardSkeleton({ layout = 'grid' }) {
  return (
    <div className={`hotel-card card ${layout}`} aria-hidden="true">
      <div className="hc-media skeleton" />
      <div className="hc-body">
        <div className="skeleton hc-sk-line wide" />
        <div className="skeleton hc-sk-line" />
        <div className="skeleton hc-sk-line short" />
      </div>
    </div>
  );
}
