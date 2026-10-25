import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HotelImage from '../../components/common/HotelImage.jsx';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { errMsg } from '../../services/api.js';
import { AUTH_IMAGE } from '../../utils/format.js';
import '../../css/auth.css';
import './Register.css';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const rules = [
    ['8+ characters', form.password.length >= 8],
    ['A letter', /[A-Za-z]/.test(form.password)],
    ['A number', /\d/.test(form.password)],
  ];

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!rules.every(([, ok]) => ok)) errs.password = 'Password must be 8+ characters with a letter and a number.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success('Account created. Welcome to StayEase!');
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
          <h2>Start your journey with <span className="gold">StayEase</span></h2>
          <p>Create a free account to save hotels, book stays and manage every trip in one place.</p>
        </div>
      </div>
      <div className="auth-panel">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>Create account</h1>
          <p className="sub">It only takes a minute.</p>
          {formError && <div className="form-error" role="alert">{formError}</div>}
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" className={`input ${errors.name ? 'invalid' : ''}`} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className={`input ${errors.email ? 'invalid' : ''}`} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput id="password" autoComplete="new-password" invalid={!!errors.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <ul className="pw-rules" aria-label="Password requirements">
              {rules.map(([label, ok]) => <li key={label} className={ok ? 'ok' : ''}>{label}</li>)}
            </ul>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <PasswordInput id="confirm" autoComplete="new-password" invalid={!!errors.confirm} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>
          <button className="btn btn-gold btn-block" disabled={busy}>{busy ? <span className="spinner" /> : 'Create account'}</button>
          <p className="auth-alt">Already have an account? <Link to="/login" state={location.state}>Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
