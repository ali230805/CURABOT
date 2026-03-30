// controllers/adminController.js
const User = require('../models/user');
const Symptom = require('../models/symptom');
const Condition = require('../models/condition');
const Prediction = require('../models/Prediction');

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPredictions = await Prediction.countDocuments();
        const totalSymptoms = await Symptom.countDocuments();
        const totalConditions = await Condition.countDocuments();

        // Get daily predictions for last 7 days
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const dailyPredictions = await Prediction.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most common symptoms
        const commonSymptoms = await Prediction.aggregate([
            { $unwind: '$reportedSymptoms' },
            {
                $group: {
                    _id: '$reportedSymptoms.symptomName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get most predicted conditions
        const topConditions = await Prediction.aggregate([
            { $unwind: '$results' },
            {
                $group: {
                    _id: '$results.conditionName',
                    avgConfidence: { $avg: '$results.confidenceScore' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalPredictions,
                    totalSymptoms,
                    totalConditions
                },
                dailyPredictions,
                commonSymptoms,
                topConditions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new symptom
// @route   POST /api/admin/symptoms
// @access  Private/Admin
const createSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.create(req.body);
        res.status(201).json({
            success: true,
            data: symptom
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update symptom
// @route   PUT /api/admin/symptoms/:id
// @access  Private/Admin
const updateSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!symptom) {
            return res.status(404).json({
                success: false,
                message: 'Symptom not found'
            });
        }

        res.json({
            success: true,
            data: symptom
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete symptom
// @route   DELETE /api/admin/symptoms/:id
// @access  Private/Admin
const deleteSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findById(req.params.id);

        if (!symptom) {
            return res.status(404).json({
                success: false,
                message: 'Symptom not found'
            });
        }

        await symptom.remove();

        res.json({
            success: true,
            message: 'Symptom deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new condition
// @route   POST /api/admin/conditions
// @access  Private/Admin
const createCondition = async (req, res) => {
    try {
        const condition = await Condition.create(req.body);
        res.status(201).json({
            success: true,
            data: condition
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update condition
// @route   PUT /api/admin/conditions/:id
// @access  Private/Admin
const updateCondition = async (req, res) => {
    try {
        const condition = await Condition.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!condition) {
            return res.status(404).json({
                success: false,
                message: 'Condition not found'
            });
        }

        res.json({
            success: true,
            data: condition
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAnalytics,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    createCondition,
    updateCondition
};
