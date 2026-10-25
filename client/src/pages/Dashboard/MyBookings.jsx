import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarX } from 'lucide-react';
import toast from 'react-hot-toast';
import BookingCard from '../../components/booking/BookingCard.jsx';
import ReviewModal from '../../components/booking/ReviewModal.jsx';
import Modal from '../../components/common/Modal.jsx';
import { api, errMsg } from '../../services/api.js';
import { downloadConfirmationPdf } from '../../utils/pdf.js';
import { formatDate } from '../../utils/format.js';
import './MyBookings.css';

const TABS = [['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled']];

export default function MyBookings() {
  const [tab, setTab] = useState('upcoming');
  const [state, setState] = useState({ loading: true, list: [], error: '' });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api
      .get('/bookings/my-bookings', { params: { tab } })
      .then((r) => setState({ loading: false, list: r.data.bookings, error: '' }))
      .catch((e) => setState({ loading: false, list: [], error: errMsg(e) }));
  }, [tab]);

  useEffect(load, [load]);

  const download = async (b) => {
    try {
      await downloadConfirmationPdf(b);
    } catch {
      toast.error('Could not generate the PDF.');
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await api.post(`/bookings/${cancelTarget._id}/cancel`, { reason });
      toast.success('Booking cancelled');
      setCancelTarget(null);
      setReason('');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const refundNote = (b) => {
    if (b.payment.status !== 'demo_paid') return 'This booking was not prepaid, so there is nothing to refund.';
    const hours = (new Date(b.checkIn).getTime() - Date.now()) / 3_600_000;
    return b.snapshot.freeCancellation && hours >= 48
      ? 'You are within the free-cancellation window: the demo payment will be marked as refunded.'
      : 'This booking is past its free-cancellation window (or non-refundable), so no refund will be issued.';
  };

  return (
    <div className="mb">
      <header className="mb-head">
        <h1>My Bookings</h1>
        <p className="muted">View, download or cancel your reservations.</p>
      </header>

      <div className="mb-tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {state.error ? (
        <div className="state-box"><AlertTriangle size={30} /><h3>Couldn’t load bookings</h3><p>{state.error}</p><button className="btn btn-gold" onClick={load}>Try again</button></div>
      ) : state.loading ? (
        <div className="mb-list">{[0, 1].map((i) => <div key={i} className="skeleton mb-sk" />)}</div>
      ) : state.list.length === 0 ? (
        <div className="state-box">
          <CalendarX size={32} />
          <h3>No {tab} bookings</h3>
          <p>{tab === 'upcoming' ? 'When you book a stay it will show up here.' : `You don’t have any ${tab} bookings.`}</p>
          {tab === 'upcoming' && <Link to="/hotels" className="btn btn-gold">Explore hotels</Link>}
        </div>
      ) : (
        <div className="mb-list">
          {state.list.map((b) => <BookingCard key={b._id} booking={b} onCancel={setCancelTarget} onReview={setReviewTarget} onDownload={download} />)}
        </div>
      )}

      {cancelTarget && (
        <Modal
          title="Cancel this booking?"
          onClose={() => !busy && setCancelTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setCancelTarget(null)} disabled={busy}>Keep booking</button>
              <button className="btn btn-danger" onClick={cancel} disabled={busy}>{busy ? <span className="spinner" /> : 'Yes, cancel'}</button>
            </>
          }
        >
          <p><strong>{cancelTarget.snapshot.hotelName}</strong> · {formatDate(cancelTarget.checkIn)} → {formatDate(cancelTarget.checkOut)}</p>
          <p className="muted">{refundNote(cancelTarget)}</p>
          <div className="field">
            <label htmlFor="cancel-reason">Reason (optional)</label>
            <textarea id="cancel-reason" className="textarea" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </Modal>
      )}

      {reviewTarget && (
        <ReviewModal
          hotelName={reviewTarget.snapshot.hotelName}
          hotelId={reviewTarget.hotel}
          bookingId={reviewTarget._id}
          onClose={() => setReviewTarget(null)}
          onDone={() => {
            setReviewTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}
