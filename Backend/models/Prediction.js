// models/Prediction.js
const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    reportedSymptoms: [{
        symptom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Symptom',
            required: true
        },
        symptomName: String,
        severity: {
            type: Number,
            min: 1,
            max: 10
        },
        duration: String,
        notes: String
    }],
    rawUserInput: String,
    processedSymptoms: [String],
    results: [{
        condition: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Condition'
        },
        conditionName: String,
        confidenceScore: {
            type: Number,
            min: 0,
            max: 100
        },
        description: String,
        recommendedActions: [String],
        homeRemedies: [String],
        severity: String
    }],
    modelVersion: String,
    processingTime: Number,
    userFeedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        correctCondition: String,
        comments: String
    },
    isSaved: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
PredictionSchema.index({ user: 1, createdAt: -1 });
PredictionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Prediction', PredictionSchema);