import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page container">
      <div className="state-box">
        <Compass size={36} />
        <h3>We couldn’t find that page</h3>
        <p>The link may be broken or the page may have moved.</p>
        <Link to="/" className="btn btn-gold">Back to home</Link>
      </div>
    </div>
  );
}
