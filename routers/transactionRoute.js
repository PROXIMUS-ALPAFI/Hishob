const express = require('express');
const { addts, getallts, editts, delts, exportts, importts } = require('../controllers/transaction_controller');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiters');

const router = express.Router()
router.use(authMiddleware, apiLimiter)
router.post('/addts',addts)
router.post('/getts',getallts)
router.post('/editts',editts)
router.post('/delts',delts)
router.post('/export',exportts)
router.post('/import',importts)
module.exports = router;
