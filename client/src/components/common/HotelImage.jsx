import { useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from '../../utils/format.js';
import './HotelImage.css';

/** Lazy-loaded cover image that swaps to a branded fallback if the URL fails. */
export default function HotelImage({ src, alt = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  return (
    <img
      className={`hotel-img ${className}`}
      src={failed ? FALLBACK_IMAGE : src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
