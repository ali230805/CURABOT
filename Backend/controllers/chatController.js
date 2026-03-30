const { validationResult } = require('express-validator');
const { generateChatResponse } = require('../services/geminiChatService');

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
