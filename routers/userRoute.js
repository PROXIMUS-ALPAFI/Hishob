const express = require('express')
const {
    logincontroller,
    registercontroller
} = require('../controllers/user_controller');
const { authLimiter } = require('../middleware/rateLimiters');
const router = express.Router()
//routes
//1.post|login
router.post('/login', authLimiter, logincontroller)
//2.post|register user
router.post('/register', authLimiter, registercontroller)
module.exports = router;
