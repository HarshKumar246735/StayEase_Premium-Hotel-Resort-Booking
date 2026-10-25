import { Link, useParams } from 'react-router-dom';
import './Info.css';

const POLICIES = {
  terms: {
    title: 'Terms & Conditions',
    body: [
      'StayEase is a demo project. Nothing on this site constitutes a real offer, booking or contract.',
      'Hotels, prices, reviews and availability are sample data. Payments are simulated and no funds are transferred.',
      'You are responsible for keeping your account password confidential.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'We store the account details you provide (name, email, optional phone) and your demo bookings, wishlist and reviews.',
      'Passwords are hashed before storage. Sessions use an httpOnly cookie. We never collect card numbers.',
      'Booking QR codes contain only a random verification link, never personal or payment data.',
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    body: [
      'Each hotel lists its own policy on its page and in your booking confirmation.',
      'Free-cancellation listings refund a prepaid demo payment when cancelled at least 48 hours before check-in.',
      'Non-refundable listings, and cancellations inside 48 hours, receive no refund. Cancelled rooms are released for other guests immediately.',
    ],
  },
};

export default function Policy() {
  const { type } = useParams();
  const p = POLICIES[type];
  return (
    <div className="page container info-narrow">
      {p ? (
        <>
          <header className="info-head"><h1>{p.title}</h1><p className="muted">Demo policy for the StayEase sample project.</p></header>
          <div className="info-prose card">{p.body.map((t) => <p key={t}>{t}</p>)}</div>
        </>
      ) : (
        <div className="state-box"><h3>Page not found</h3><Link to="/" className="btn btn-gold">Go home</Link></div>
      )}
    </div>
  );
}
