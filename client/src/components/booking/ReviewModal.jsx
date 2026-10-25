import { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal.jsx';
import { api, errMsg } from '../../services/api.js';
import './ReviewModal.css';

/** Creates a review for a completed booking, or edits an existing review when `review` is given. */
export default function ReviewModal({ hotelName, hotelId, bookingId, review, onClose, onDone }) {
  const [rating, setRating] = useState(review?.rating || 0);
  const [title, setTitle] = useState(review?.title || '');
  const [comment, setComment] = useState(review?.comment || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!rating) return setError('Please choose a star rating.');
    if (comment.trim().length < 10) return setError('Please write at least 10 characters.');
    setBusy(true);
    setError('');
    try {
      if (review) await api.patch(`/reviews/${review._id}`, { rating, title, comment });
      else await api.post(`/hotels/${hotelId}/reviews`, { bookingId, rating, title, comment });
      toast.success(review ? 'Review updated' : 'Thanks for your review!');
      onDone();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={review ? 'Edit your review' : `Review ${hotelName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-gold" onClick={submit} disabled={busy}>{busy ? <span className="spinner" /> : review ? 'Save changes' : 'Submit review'}</button>
        </>
      }
    >
      <div className="field">
        <span className="label">Your rating</span>
        <div className="rv-stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>
              <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="rv-title">Title (optional)</label>
        <input id="rv-title" className="input" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="rv-comment">Your review</label>
        <textarea id="rv-comment" className="textarea" maxLength={1500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell other travelers about your stay…" />
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
    </Modal>
  );
}
