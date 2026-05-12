const rateLimit = require('express-rate-limit');

const standardHeaders = 'draft-7';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
});

module.exports = { authLimiter, apiLimiter };
