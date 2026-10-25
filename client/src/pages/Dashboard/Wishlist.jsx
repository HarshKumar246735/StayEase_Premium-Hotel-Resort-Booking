import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import HotelCard from '../../components/hotels/HotelCard.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import './Wishlist.css';

export default function Wishlist() {
  const { hotels, loaded } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="wl">
      <header className="wl-head">
        <h1>Wishlist</h1>
        <p className="muted">Hotels you’ve saved for later.</p>
      </header>

      {!loaded ? (
        <div className="skeleton wl-sk" />
      ) : hotels.length === 0 ? (
        <div className="state-box">
          <Heart size={32} />
          <h3>No saved hotels yet</h3>
          <p>Tap the heart on any hotel to save it here.</p>
          <Link to="/hotels" className="btn btn-gold">Explore hotels</Link>
        </div>
      ) : (
        <div className="wl-grid">
          {hotels.map((h) => (
            <div key={h._id} className="wl-item">
              <HotelCard hotel={h} />
              <button className="btn btn-gold btn-block" onClick={() => navigate(`/hotels/${h.slug}#book`)}>Book this hotel</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
