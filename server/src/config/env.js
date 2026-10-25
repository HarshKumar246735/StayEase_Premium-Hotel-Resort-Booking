
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  isProd,

  port: Number(process.env.PORT) || 5000,

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/stayease',

  jwtSecret:
    process.env.JWT_SECRET ||
    (isProd ? '' : 'dev-only-secret-change-me'),

  clientUrls: (
    process.env.CLIENT_URL || 'http://localhost:5173'
  )
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),

  cookieName: process.env.COOKIE_NAME || 'stayease_token',
};

if (!env.jwtSecret || env.jwtSecret.length < 16) {
  throw new Error(
    'JWT_SECRET must be set (at least 16 characters).'
  );
}

