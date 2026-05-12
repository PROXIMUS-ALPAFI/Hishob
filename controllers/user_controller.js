const usermodel = require('../models/usermod');
const { comparePassword, hashPassword, isPasswordHash, signAuthToken } = require('../config/auth');

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const logincontroller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await usermodel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        let isMatch = false;

        if (isPasswordHash(user.password)) {
            isMatch = await comparePassword(password, user.password);
        } else if (user.password === password) {
            isMatch = true;
            user.password = await hashPassword(password);
            await user.save();
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const token = signAuthToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to log in right now.',
        });
    }
};

const registercontroller = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.',
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long.',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.',
            });
        }

        if (password.trim().length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await usermodel.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const newuser = await usermodel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await hashPassword(password.trim()),
        });

        const token = signAuthToken(newuser);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user: sanitizeUser(newuser),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to register right now.',
        });
    }
};

module.exports = { logincontroller, registercontroller };
