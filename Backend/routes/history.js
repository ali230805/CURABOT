const express = require('express');
const { protect } = require('../middleware/auth');
const { getChatHistory } = require('../controllers/historyController');

const router = express.Router();

router.get('/', protect, getChatHistory);

module.exports = router;
