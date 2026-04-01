const ChatHistory = require('../models/ChatHistory');
const { isDatabaseConnected } = require('../config/runtime');

const getChatHistory = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            res.json({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0
                }
            });
            return;
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            ChatHistory.find({ user: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ChatHistory.countDocuments({ user: req.user.id })
        ]);

        res.json({
            success: true,
            data: history,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Unable to load chat history.'
        });
    }
};

module.exports = {
    getChatHistory
};
