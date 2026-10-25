import { LifeBuoy, Mail, Phone } from 'lucide-react';
import './Help.css';

const FAQ = [
  ['Is this a real booking service?', 'No. StayEase is a demo project. Hotels are fictional sample listings and payments are simulated, so no money is ever taken and no real reservation is made.'],
  ['How does cancellation work?', 'You can cancel any upcoming booking from My Bookings. If the hotel offers free cancellation and you cancel at least 48 hours before check-in, a prepaid demo payment is marked as refunded. Otherwise no refund is issued.'],
  ['How do I download my confirmation?', 'Open My Bookings and choose “Download Confirmation”, or open a booking’s details page. The PDF includes a QR code that links to a public verification page.'],
  ['Who can write a review?', 'Only guests with a completed (non-cancelled) stay can review that hotel, once per booking. You can edit your review afterwards.'],
  ['How do I change my password?', 'Go to Profile & Settings and use the Change password form. You’ll need your current password.'],
];

export default function Help() {
  return (
    <div className="hp">
      <header className="hp-head">
        <h1>Help &amp; Support</h1>
        <p className="muted">Answers to common questions about using StayEase.</p>
      </header>

      <div className="hp-contact">
        <div className="card hp-box"><LifeBuoy size={22} /><div><strong>Help centre</strong><small className="muted">Browse the FAQs below</small></div></div>
        <div className="card hp-box"><Mail size={22} /><div><strong>support@stayease.example</strong><small className="muted">Sample address (demo)</small></div></div>
        <div className="card hp-box"><Phone size={22} /><div><strong>+91 00000 00000</strong><small className="muted">Sample number (demo)</small></div></div>
      </div>

      <div className="hp-faq">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card">
            <summary>{q}</summary>
            <p className="muted">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
