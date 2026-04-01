const { validationResult } = require('express-validator');
const { generateChatResponse } = require('../services/geminiChatService');
const ChatHistory = require('../models/ChatHistory');
const { isDatabaseConnected } = require('../config/runtime');

const createChatResponse = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    try {
        const question = req.body.question.trim();
        const answer = await generateChatResponse(question);

        if (req.user?.id && isDatabaseConnected()) {
            await ChatHistory.create({
                user: req.user.id,
                question,
                answer
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                question,
                answer
            }
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Unable to process chat request right now.'
        });
    }
};

module.exports = {
    createChatResponse
};
