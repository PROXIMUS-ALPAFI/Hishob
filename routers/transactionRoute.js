const express = require('express');
const { addts, getallts } = require('../controllers/transaction_controller');

const router = express.Router()
router.post('/addts',addts)
router.post('/getts',getallts)
module.exports = router;
