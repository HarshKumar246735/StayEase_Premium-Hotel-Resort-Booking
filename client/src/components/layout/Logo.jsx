import { Link } from 'react-router-dom';
import { House } from 'lucide-react';
import './Logo.css';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="StayEase home">
      <span className="logo-mark">
        <House size={20} strokeWidth={2} />
      </span>
      <span className="logo-text">
        <strong>StayEase</strong>
        <small>Stay More, Worry Less</small>
      </span>
    </Link>
  );
}
