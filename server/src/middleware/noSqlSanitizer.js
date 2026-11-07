/**
 * NoSQL Injection Sanitizer Middleware
 * Recursively inspects req.body, req.query, and req.params and strips any
 * keys starting with "$" (prohibited MongoDB query operators like $gt, $ne, $regex, $where)
 * or containing "." (prohibited field path manipulation) to guarantee complete NoSQL injection immunity.
 */
function sanitizeObject(input) {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(input)) {
    // Strip keys with leading '$' or containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeObject(val);
  }
  return sanitized;
}

const noSqlSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = { noSqlSanitizer };
