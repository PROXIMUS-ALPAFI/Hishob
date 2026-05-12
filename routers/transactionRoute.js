const express = require('express');
const { addts, getallts,editts,delts } = require('../controllers/transaction_controller');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiters');

const router = express.Router()
router.use(authMiddleware, apiLimiter)
router.post('/addts',addts)
router.post('/getts',getallts)
router.post('/editts',editts)
router.post('/delts',delts)
module.exports = router;
