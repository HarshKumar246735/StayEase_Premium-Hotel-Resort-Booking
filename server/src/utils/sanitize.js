// Removes MongoDB operator injection vectors ($-prefixed keys and dotted keys) from user input.
function clean(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(clean);
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      obj[key] = clean(obj[key]);
    }
  }
  return obj;
}

export function sanitizeInput(req, _res, next) {
  clean(req.body);
  clean(req.params);
  // req.query is a getter in some Express setups; mutate in place.
  clean(req.query);
  next();
}
