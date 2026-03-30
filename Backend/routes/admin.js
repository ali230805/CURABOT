// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getAnalytics,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    createCondition,
    updateCondition
} = require('../controllers/adminController');

// Apply admin middleware to all routes
router.use(protect, admin);

// Analytics
router.get('/analytics', getAnalytics);

// Symptom management
router.post('/symptoms', createSymptom);
router.put('/symptoms/:id', updateSymptom);
router.delete('/symptoms/:id', deleteSymptom);

// Condition management
router.post('/conditions', createCondition);
router.put('/conditions/:id', updateCondition);

// User management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort('-createdAt');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await user.remove();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;