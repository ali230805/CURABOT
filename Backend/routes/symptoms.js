// routes/symptoms.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Symptom = require('../models/symptom');

// @desc    Get all symptoms
// @route   GET /api/symptoms
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const symptoms = await Symptom.find(query)
            .select('name description category severityLevel')
            .sort('name');

        res.json({
            success: true,
            count: symptoms.length,
            data: symptoms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get symptom by ID
// @route   GET /api/symptoms/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const symptom = await Symptom.findById(req.params.id)
            .populate('relatedSymptoms', 'name');

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
});

module.exports = router;
