const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        answer: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

ChatHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
