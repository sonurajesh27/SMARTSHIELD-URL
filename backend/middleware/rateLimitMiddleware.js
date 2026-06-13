const rateLimit = require('express-rate-limit');

/**
 * Shared handler for rate-limit responses — keeps the cybersecurity theme
 * consistent and returns JSON instead of the default HTML body.
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    message: 'Too many requests. Please slow down and try again later.',
    retryAfter: Math.ceil(res.getHeader('Retry-After') || 60)
  });
};

/**
 * Auth limiter — tight window for login / signup to mitigate brute-force attacks.
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable X-RateLimit-* legacy headers
  handler: rateLimitHandler,
  skipSuccessfulRequests: false
});

/**
 * URL creation limiter — prevents abuse of the shortening endpoint.
 * 30 requests per 10 minutes per IP.
 */
const urlCreateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * General API limiter — broad protection across all API routes.
 * 200 requests per 15 minutes per IP.
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

/**
 * Redirect limiter — prevents bots from hammering the redirect endpoint.
 * 60 redirects per minute per IP.
 */
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

module.exports = {
  authLimiter,
  urlCreateLimiter,
  generalApiLimiter,
  redirectLimiter
};
