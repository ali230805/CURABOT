const express = require('express');
const { body } = require('express-validator');
const { createChatResponse } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
    '/',
    protect,
    [
        body('question')
            .trim()
            .notEmpty()
            .withMessage('Question is required')
            .isLength({ max: 2000 })
            .withMessage('Question must be 2000 characters or fewer')
    ],
    createChatResponse
);

module.exports = router;
