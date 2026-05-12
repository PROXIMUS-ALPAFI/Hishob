const { verifyAuthToken } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication is required.' });
    }

    const token = authorization.slice('Bearer '.length).trim();

    try {
        const payload = verifyAuthToken(token);
        req.user = {
            userId: payload.sub,
            email: payload.email,
            name: payload.name,
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Your session is invalid or has expired.' });
    }
};

module.exports = authMiddleware;
