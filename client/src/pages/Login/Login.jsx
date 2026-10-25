import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HotelImage from '../../components/common/HotelImage.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { errMsg } from '../../services/api.js';
import { AUTH_IMAGE } from '../../utils/format.js';
import '../../css/auth.css';
import './Login.css';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Enter your password.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <HotelImage src={AUTH_IMAGE} alt="" eager />
        <div className="auth-art-copy">
          <h2>Welcome back to <span className="gold">StayEase</span></h2>
          <p>Pick up where you left off — your bookings and saved hotels are waiting.</p>
        </div>
      </div>
      <div className="auth-panel">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Log in</h1>
          <p className="sub">Enter your details to access your account.</p>
          {formError && <div className="form-error" role="alert">{formError}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className={`input ${errors.email ? 'invalid' : ''}`} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput id="password" invalid={!!errors.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <button className="btn btn-gold btn-block" disabled={busy}>{busy ? <span className="spinner" /> : 'Log in'}</button>
          <p className="auth-alt">New to StayEase? <Link to="/register" state={location.state}>Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}
