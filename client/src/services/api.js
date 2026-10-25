
import axios from 'axios';

// Supports an empty URL, a server URL, or a URL ending in /api.
const configuredBase = (import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '');

// Remove /api if it is already present to prevent duplicate prefixes.
const serverBase = configuredBase.replace(/\/api$/i, '');

export const api = axios.create({
  baseURL: `${serverBase}/api`,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'StayEase',
  },
});

export function errMsg(err) {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Please check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}

