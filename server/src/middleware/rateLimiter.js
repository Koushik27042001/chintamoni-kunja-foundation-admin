/**
 * In-memory brute force lockout store for authentication attempts
 * Protects administrative login endpoints against automated credential stuffing & brute-force attacks
 */
const loginAttempts = new Map(); // ip -> { count: number, lockUntil: number, firstAttempt: number }

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes window

const authRateLimiter = (req, res, next) => {
  const clientIp =
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const now = Date.now();

  const record = loginAttempts.get(clientIp);

  if (record) {
    // Check if IP is currently locked out
    if (record.lockUntil && now < record.lockUntil) {
      const remainingMinutes = Math.ceil((record.lockUntil - now) / 60000);
      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        message: `Too many failed login attempts from this IP. For security reasons, access is temporarily locked. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
      });
    }

    // Reset window if expired
    if (now - record.firstAttempt > WINDOW_DURATION_MS) {
      loginAttempts.delete(clientIp);
    }
  }

  // Intercept the response to track failed logins
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode === 401 || (data && data.success === false && res.statusCode >= 400)) {
      const current = loginAttempts.get(clientIp) || { count: 0, firstAttempt: now, lockUntil: 0 };
      current.count += 1;

      if (current.count >= MAX_ATTEMPTS) {
        current.lockUntil = now + LOCKOUT_DURATION_MS;
      }
      loginAttempts.set(clientIp, current);
    } else if (res.statusCode === 200 && data && data.success) {
      // Clear failed count on successful authentication
      loginAttempts.delete(clientIp);
    }
    return originalJson(data);
  };

  next();
};

module.exports = { authRateLimiter };
