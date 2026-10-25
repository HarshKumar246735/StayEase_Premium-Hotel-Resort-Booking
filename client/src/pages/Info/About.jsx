import { Link } from 'react-router-dom';
import './Info.css';

export default function About() {
  return (
    <div className="page container info-narrow">
      <header className="info-head">
        <h1>About <span className="gold">StayEase</span></h1>
        <p className="muted">Stay More, Worry Less.</p>
      </header>
      <div className="info-prose card">
        <p>StayEase is a demonstration hotel and resort booking platform. It shows how a modern travel product can feel: fast search, clear pricing, and a calm booking flow.</p>
        <p><strong>Everything here is sample data.</strong> The hotels are fictional, the reviews marked “Demo” are placeholders, and payments are simulated, so no real money is ever charged and no real reservation is created.</p>
        <p>What is real is the engineering: server-side filtering and sorting, price calculation on the server, atomic room inventory that prevents overbooking, cookie-based authentication, PDF confirmations and QR verification.</p>
        <Link to="/hotels" className="btn btn-gold">Explore hotels</Link>
      </div>
    </div>
  );
}
