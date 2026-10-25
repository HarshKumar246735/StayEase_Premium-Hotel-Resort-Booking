import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { api, errMsg } from '../../services/api.js';
import { initials } from '../../utils/format.js';
import '../../css/auth.css';
import './Profile.css';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    favouriteDestination: user.preferences?.favouriteDestination || '',
    defaultGuests: user.preferences?.defaultGuests || 2,
    newsletter: user.preferences?.newsletter ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/users/me', {
        name: form.name,
        phone: form.phone,
        preferences: { favouriteDestination: form.favouriteDestination, defaultGuests: Number(form.defaultGuests), newsletter: form.newsletter },
      });
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pw.newPassword !== pw.confirm) return setPwError('New passwords do not match.');
    setPwBusy(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(errMsg(err));
    } finally {
      setPwBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="pf">
      <header className="pf-head">
        <span className="avatar-lg pf-avatar">{initials(user.name)}</span>
        <div>
          <h1>Profile &amp; Settings</h1>
          <p className="muted">{user.email}</p>
        </div>
      </header>

      <form className="pf-card card" onSubmit={save}>
        <h2>Personal details</h2>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="pf-grid">
          <div className="field">
            <label htmlFor="pf-name">Full name</label>
            <input id="pf-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pf-phone">Phone number</label>
            <input id="pf-phone" type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label htmlFor="pf-dest">Favourite destination</label>
            <input id="pf-dest" className="input" value={form.favouriteDestination} onChange={(e) => setForm({ ...form, favouriteDestination: e.target.value })} placeholder="e.g. Goa" />
          </div>
          <div className="field">
            <label htmlFor="pf-guests">Usual number of guests</label>
            <select id="pf-guests" className="select" value={form.defaultGuests} onChange={(e) => setForm({ ...form, defaultGuests: e.target.value })}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <label className="pf-check">
          <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} />
          Send me travel deals and offers (preference saved only; no emails are sent in this demo)
        </label>
        <div><button className="btn btn-gold" disabled={saving}>{saving ? <span className="spinner" /> : 'Save changes'}</button></div>
      </form>

      <form className="pf-card card" onSubmit={changePassword}>
        <h2>Change password</h2>
        {pwError && <div className="form-error" role="alert">{pwError}</div>}
        <div className="pf-grid">
          <div className="field pf-wide">
            <label htmlFor="pw-cur">Current password</label>
            <PasswordInput id="pw-cur" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pw-new">New password</label>
            <PasswordInput id="pw-new" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="pw-conf">Confirm new password</label>
            <PasswordInput id="pw-conf" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <p className="muted pf-hint">8+ characters with at least one letter and one number.</p>
        <div><button className="btn btn-outline" disabled={pwBusy || !pw.currentPassword || !pw.newPassword}>{pwBusy ? <span className="spinner" /> : 'Update password'}</button></div>
      </form>

      <div className="pf-card card pf-logout">
        <div><h2>Log out</h2><p className="muted">Sign out of StayEase on this device.</p></div>
        <button className="btn btn-danger" onClick={handleLogout}><LogOut size={16} /> Log out</button>
      </div>
    </div>
  );
}
