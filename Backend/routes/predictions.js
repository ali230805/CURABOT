// routes/predictions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createPrediction,
    getUserPredictions,
    getPrediction,
    addFeedback
} = require('../controllers/predictionController');

router.route('/')
    .post(protect, createPrediction)
    .get(protect, getUserPredictions);

router.route('/:id')
    .get(protect, getPrediction);

router.post('/:id/feedback', protect, addFeedback);

module.exports = router;