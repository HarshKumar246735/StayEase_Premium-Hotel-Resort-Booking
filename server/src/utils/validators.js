import { ApiError } from './ApiError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{7,20}$/;

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function str(value, { field, min = 0, max = 500, required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ApiError(400, `${field} is required`);
    return '';
  }
  if (typeof value !== 'string') throw new ApiError(400, `${field} must be text`);
  const v = value.trim();
  if (required && v.length < Math.max(min, 1)) throw new ApiError(400, `${field} must be at least ${Math.max(min, 1)} characters`);
  if (v.length < min) throw new ApiError(400, `${field} must be at least ${min} characters`);
  if (v.length > max) throw new ApiError(400, `${field} must be at most ${max} characters`);
  return v;
}

export function email(value) {
  const v = str(value, { field: 'Email', max: 120 }).toLowerCase();
  if (!EMAIL_RE.test(v)) throw new ApiError(400, 'Please enter a valid email address');
  return v;
}

export function phone(value, required = false) {
  const v = str(value, { field: 'Phone number', max: 20, required });
  if (v && !PHONE_RE.test(v)) throw new ApiError(400, 'Please enter a valid phone number');
  return v;
}

export function password(value, field = 'Password') {
  if (typeof value !== 'string') throw new ApiError(400, `${field} is required`);
  if (value.length < 8) throw new ApiError(400, `${field} must be at least 8 characters`);
  if (value.length > 72) throw new ApiError(400, `${field} must be at most 72 characters`);
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    throw new ApiError(400, `${field} must contain at least one letter and one number`);
  }
  return value;
}

export function int(value, { field, min, max, def } = {}) {
  if (value === undefined || value === null || value === '') {
    if (def !== undefined) return def;
    throw new ApiError(400, `${field} is required`);
  }
  const n = Number(value);
  if (!Number.isInteger(n)) throw new ApiError(400, `${field} must be a whole number`);
  if (min !== undefined && n < min) throw new ApiError(400, `${field} must be at least ${min}`);
  if (max !== undefined && n > max) throw new ApiError(400, `${field} must be at most ${max}`);
  return n;
}

export function oneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw new ApiError(400, `${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

export function objectId(value, field = 'id') {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) throw new ApiError(400, `Invalid ${field}`);
  return value;
}

/** Clamp pagination so clients cannot request unbounded result sets. */
export function pagination(query, { defLimit = 12, maxLimit = 24 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defLimit));
  return { page, limit, skip: (page - 1) * limit };
}
