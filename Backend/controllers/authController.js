// controllers/authController.js
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getJwtSecret } = require('../config/runtime');
const {
    createUser,
    findUserByEmail,
    findUserById,
    incrementTokenVersion,
    verifyPassword
} = require('../services/authStore');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id || user.id, tokenVersion: user.tokenVersion || 0 }, getJwtSecret(), {
        expiresIn: '30d'
    });
};

const buildUserPayload = (user) => ({
    id: user._id || user.id,
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
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await createUser({
            name,
            email,
            password,
            age,
            biologicalSex
        });

        // Generate token
        const token = generateToken(user);

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
        const user = await findUserByEmail(email, { includePassword: true });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await verifyPassword(user, password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user);

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
        const user = await findUserById(req.user.id);

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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        await incrementTokenVersion(req.user.id);

        res.json({
            success: true,
            message: 'Logged out successfully'
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
        const normalizedEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(normalizedEmail, { includePassword: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        // Send email (implement your email service)
        // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

        res.json({
            success: true,
            message: 'Password reset flow is not configured in this deployment yet.'
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
    logoutUser,
    forgotPassword
};
