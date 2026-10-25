import { Star } from 'lucide-react';
import './Stars.css';

export default function Stars({ value = 0, size = 14 }) {
  return (
    <span className="stars" aria-label={`${value} star rating`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} className={i < Math.round(value) ? 'on' : 'off'} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}
