import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import './Footer.css';

const DESTS = ['Bali', 'Paris', 'Dubai', 'Goa', 'Jaipur', 'Maldives'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>StayEase is a demo hotel and resort booking platform. Browse sample listings, save favourites and try the full booking flow with simulated payments.</p>
          <div className="socials">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#top" aria-label="Social link (demo)" onClick={(e) => e.preventDefault()}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/hotels">Explore Hotels</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/offers">Offers</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div>
          <h4>Popular Destinations</h4>
          <ul>
            {DESTS.map((d) => (
              <li key={d}><Link to={`/hotels?city=${encodeURIComponent(d)}`}>{d}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/policy/terms">Terms &amp; Conditions</Link></li>
            <li><Link to="/policy/privacy">Privacy Policy</Link></li>
            <li><Link to="/policy/cancellation">Cancellation Policy</Link></li>
            <li><Link to="/dashboard/help">Help Center</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p><Mail size={15} /> support@stayease.example</p>
          <p><Phone size={15} /> +91 00000 00000</p>
          <p><MapPin size={15} /> Sample Street, Demo City</p>
          <small className="muted">Sample contact details for the demo.</small>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} StayEase. Demo project — hotels are fictional and payments are simulated.</span>
        <span>Made with <span className="heart">♥</span> for travelers</span>
      </div>
    </footer>
  );
}
