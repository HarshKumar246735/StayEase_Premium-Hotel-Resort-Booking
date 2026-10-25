import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../utils/format.js';
import './Navbar.css';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/hotels', label: 'Explore Hotels' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/offers', label: 'Offers' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Logo />

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          <div className="nav-auth-mobile">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-gold btn-block">Dashboard</Link>
                <button className="btn btn-ghost btn-block" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-block">Login</Link>
                <Link to="/register" className="btn btn-gold btn-block">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="profile-menu" ref={menuRef}>
              <button className="profile-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                <span className="avatar">{initials(user.name)}</span>
                <span className="profile-name">{user.name.split(' ')[0]}</span>
                <ChevronDown size={16} />
              </button>
              {menu && (
                <div className="profile-dropdown card" role="menu">
                  <Link to="/dashboard" role="menuitem"><LayoutDashboard size={16} /> Dashboard</Link>
                  <Link to="/dashboard/bookings" role="menuitem">My Bookings</Link>
                  <Link to="/dashboard/wishlist" role="menuitem">Wishlist</Link>
                  <button onClick={handleLogout} role="menuitem"><LogOut size={16} /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-desktop">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
