// routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword
} = require('../controllers/authController');

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    body('biologicalSex')
        .optional()
        .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
        .withMessage('Invalid biological sex value')
];

const loginValidation = [
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
