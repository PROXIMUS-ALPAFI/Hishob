const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '7d';

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is required.');
    }

    return secret;
};

const isPasswordHash = (value = '') => value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const signAuthToken = (user) => jwt.sign(
    {
        sub: String(user._id),
        email: user.email,
        name: user.name,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_TTL }
);

const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
    comparePassword,
    hashPassword,
    isPasswordHash,
    signAuthToken,
    verifyAuthToken,
};
