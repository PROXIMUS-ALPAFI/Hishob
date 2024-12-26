const express = require('express')
const {
    logincontroller,
    registercontroller
} = require('../controllers/user_controller');
const router = express.Router()
//routes
//1.post|login
router.post('/login', logincontroller)
//2.post|register user
router.post('/register', registercontroller)
module.exports = router;
