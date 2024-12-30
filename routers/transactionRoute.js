const express = require('express');
const { addts, getallts,editts,delts } = require('../controllers/transaction_controller');

const router = express.Router()
router.post('/addts',addts)
router.post('/getts',getallts)
router.post('/editts',editts)
router.post('/delts',delts)
module.exports = router;
