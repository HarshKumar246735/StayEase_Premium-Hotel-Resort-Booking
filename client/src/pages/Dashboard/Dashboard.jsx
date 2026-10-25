import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarCheck, HelpCircle, Heart, LayoutDashboard, LogOut, Menu, Star, UserCog, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../../components/layout/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../utils/format.js';
import './Dashboard.css';

const ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/dashboard/reviews', label: 'My Reviews', icon: Star },
  { to: '/dashboard/profile', label: 'Profile & Settings', icon: UserCog },
  { to: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  return (
    <div className="dash">
      <button className="dash-toggle btn btn-ghost btn-sm" onClick={() => setOpen(true)} aria-label="Open dashboard menu">
        <Menu size={18} /> Menu
      </button>

      <aside className={`dash-side ${open ? 'open' : ''}`}>
        <div className="dash-side-top">
          <Logo />
          <button className="dash-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <div className="dash-user">
          <span className="avatar-lg">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <nav className="dash-nav" aria-label="Dashboard">
          {ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `dash-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="dash-link logout" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </nav>
      </aside>
      {open && <div className="dash-scrim" onClick={() => setOpen(false)} />}

      <section className="dash-main">
        <Outlet />
      </section>
    </div>
  );
}
