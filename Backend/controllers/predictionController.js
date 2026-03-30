// controllers/predictionController.js
const Prediction = require('../models/Prediction');
const Symptom = require('../models/Symptom');
const Condition = require('../models/Condition');
const User = require('../models/User');
const axios = require('axios');

// @desc    Create new prediction
// @route   POST /api/predictions
// @access  Private
const createPrediction = async (req, res) => {
    try {
        const { symptoms, rawUserInput } = req.body;
        const sessionId = req.headers['x-session-id'] || Date.now().toString();

        // Process symptoms with ML service
        const mlResponse = await axios.post(
            `${process.env.ML_API_URL}/analyze`,
            {
                text: rawUserInput,
                symptoms: symptoms
            }
        );

        const { processedSymptoms, predictions, modelVersion } = mlResponse.data;

        // Get condition details from database
        const predictionResults = await Promise.all(
            predictions.map(async (pred) => {
                const condition = await Condition.findOne({
                    name: { $regex: new RegExp(pred.condition, 'i') }
                });

                return {
                    condition: condition?._id || null,
                    conditionName: pred.condition,
                    confidenceScore: pred.confidence,
                    description: condition?.description || 'Description not available',
                    recommendedActions: condition?.recommendedActions || [],
                    homeRemedies: condition?.homeRemedies || [],
                    severity: condition?.severity || 'Low'
                };
            })
        );

        // Save prediction to database
        const prediction = await Prediction.create({
            user: req.user.id,
            sessionId,
            reportedSymptoms: symptoms.map(s => ({
                symptom: s.symptomId,
                symptomName: s.name,
                severity: s.severity,
                duration: s.duration,
                notes: s.notes
            })),
            rawUserInput,
            processedSymptoms,
            results: predictionResults,
            modelVersion,
            processingTime: mlResponse.data.processingTime
        });

        // Add prediction to user's history
        await User.findByIdAndUpdate(req.user.id, {
            $push: { predictionHistory: prediction._id }
        });

        res.status(201).json({
            success: true,
            data: prediction
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's predictions
// @route   GET /api/predictions
// @access  Private
const getUserPredictions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const predictions = await Prediction.find({ user: req.user.id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('reportedSymptoms.symptom', 'name category')
            .populate('results.condition', 'name severity');

        const total = await Prediction.countDocuments({ user: req.user.id });

        res.json({
            success: true,
            data: predictions,
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
            message: error.message
        });
    }
};

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Private
const getPrediction = async (req, res) => {
    try {
        const prediction = await Prediction.findById(req.params.id)
            .populate('reportedSymptoms.symptom')
            .populate('results.condition');

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        // Check if prediction belongs to user or user is admin
        if (prediction.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this prediction'
            });
        }

        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add feedback to prediction
// @route   POST /api/predictions/:id/feedback
// @access  Private
const addFeedback = async (req, res) => {
    try {
        const { rating, correctCondition, comments } = req.body;
        
        const prediction = await Prediction.findById(req.params.id);

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found'
            });
        }

        if (prediction.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to provide feedback for this prediction'
            });
        }

        prediction.userFeedback = {
            rating,
            correctCondition,
            comments
        };

        await prediction.save();

        res.json({
            success: true,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPrediction,
    getUserPredictions,
    getPrediction,
    addFeedback
};