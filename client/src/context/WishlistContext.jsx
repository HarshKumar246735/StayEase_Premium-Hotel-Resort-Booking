import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, errMsg } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get('/wishlist');
      setHotels(data.hotels);
    } catch {
      /* non-critical */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) reload();
    else {
      setHotels([]);
      setLoaded(false);
    }
  }, [user, reload]);

  const ids = useMemo(() => new Set(hotels.map((h) => h._id)), [hotels]);

  const toggle = useCallback(
    async (hotel) => {
      if (!user) {
        toast('Log in to save hotels to your wishlist.');
        navigate('/login', { state: { from: location.pathname + location.search } });
        return;
      }
      const saved = ids.has(hotel._id);
      // Optimistic update, rolled back on failure.
      setHotels((prev) => (saved ? prev.filter((h) => h._id !== hotel._id) : [...prev, hotel]));
      try {
        if (saved) await api.delete(`/wishlist/${hotel._id}`);
        else await api.post(`/wishlist/${hotel._id}`);
        toast.success(saved ? 'Removed from wishlist' : 'Saved to wishlist');
      } catch (err) {
        setHotels((prev) => (saved ? [...prev, hotel] : prev.filter((h) => h._id !== hotel._id)));
        toast.error(errMsg(err));
      }
    },
    [user, ids, navigate, location],
  );

  const value = useMemo(() => ({ hotels, ids, toggle, reload, loaded }), [hotels, ids, toggle, reload, loaded]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
