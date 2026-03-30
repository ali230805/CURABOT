// controllers/authController.js
const { validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_me';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

const buildUserPayload = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    biologicalSex: user.biologicalSex,
    role: user.role
});

const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        });
        return true;
    }

    return false;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) {
            return;
        }

        const { name, password, age, biologicalSex } = req.body;
        const email = req.body.email.trim().toLowerCase();

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            age,
            biologicalSex
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: buildUserPayload(user)
        });
    } catch (error) {
        const statusCode = error.code === 11000 ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode === 400 ? 'User already exists' : error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) {
            return;
        }

        const { password } = req.body;
        const email = req.body.email.trim().toLowerCase();

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: buildUserPayload(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('predictionHistory');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send email (implement your email service)
        // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword
};
