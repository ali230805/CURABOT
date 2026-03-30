const express = require('express');
const { body } = require('express-validator');
const { createChatResponse } = require('../controllers/chatController');

const router = express.Router();

router.post(
    '/',
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
