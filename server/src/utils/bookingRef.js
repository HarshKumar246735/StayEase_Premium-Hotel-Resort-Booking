import crypto from 'crypto';

// Crockford-style alphabet without easily confused characters
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

export function generateBookingReference() {
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `SE-${out}`;
}

export const generateVerifyToken = () => crypto.randomBytes(18).toString('hex');
export const generateDemoTransactionId = () => `DEMO-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
