const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const User = require('../models/user');
const { isDatabaseConnected } = require('../config/runtime');

const fallbackStorePath = path.resolve(__dirname, '../data/fallback-auth-store.json');

const ensureFallbackStore = async () => {
    await fs.mkdir(path.dirname(fallbackStorePath), { recursive: true });

    try {
        await fs.access(fallbackStorePath);
    } catch (error) {
        await fs.writeFile(fallbackStorePath, JSON.stringify({ users: [] }, null, 2), 'utf8');
    }
};

const readFallbackStore = async () => {
    await ensureFallbackStore();
    const fileContents = await fs.readFile(fallbackStorePath, 'utf8');

    try {
        return JSON.parse(fileContents);
    } catch (error) {
        return { users: [] };
    }
};

const writeFallbackStore = async (store) => {
    await ensureFallbackStore();
    await fs.writeFile(fallbackStorePath, JSON.stringify(store, null, 2), 'utf8');
};

const normalizeUser = (user, { includePassword = false } = {}) => {
    if (!user) {
        return null;
    }

    const normalizedUser = {
        ...user,
        _id: String(user._id || user.id),
        id: String(user._id || user.id),
        predictionHistory: Array.isArray(user.predictionHistory) ? user.predictionHistory : []
    };

    if (!includePassword) {
        delete normalizedUser.password;
    }

    return normalizedUser;
};

const findUserByEmail = async (email, { includePassword = false } = {}) => {
    if (isDatabaseConnected()) {
        const query = User.findOne({ email });

        if (includePassword) {
            query.select('+password');
        }

        const user = await query.lean();
        return normalizeUser(user, { includePassword });
    }

    const store = await readFallbackStore();
    const fallbackUser = store.users.find((user) => user.email === email);
    return normalizeUser(fallbackUser, { includePassword });
};

const findUserById = async (userId, { includePassword = false } = {}) => {
    if (isDatabaseConnected()) {
        const query = User.findById(userId);

        if (includePassword) {
            query.select('+password');
        }

        const user = await query.lean();
        return normalizeUser(user, { includePassword });
    }

    const store = await readFallbackStore();
    const fallbackUser = store.users.find((user) => String(user._id) === String(userId));
    return normalizeUser(fallbackUser, { includePassword });
};

const createUser = async ({ name, email, password, age, biologicalSex }) => {
    if (isDatabaseConnected()) {
        const createdUser = await User.create({
            name,
            email,
            password,
            age,
            biologicalSex
        });

        return normalizeUser(createdUser.toObject());
    }

    const store = await readFallbackStore();
    const existingUser = store.users.find((user) => user.email === email);

    if (existingUser) {
        const duplicateError = new Error('User already exists');
        duplicateError.code = 11000;
        throw duplicateError;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fallbackUser = {
        _id: crypto.randomUUID(),
        name,
        email,
        password: passwordHash,
        age,
        biologicalSex,
        role: 'user',
        tokenVersion: 0,
        predictionHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    store.users.push(fallbackUser);
    await writeFallbackStore(store);

    return normalizeUser(fallbackUser);
};

const verifyPassword = async (user, enteredPassword) => {
    if (!user?.password) {
        return false;
    }

    return bcrypt.compare(enteredPassword, user.password);
};

const incrementTokenVersion = async (userId) => {
    if (isDatabaseConnected()) {
        await User.findByIdAndUpdate(userId, {
            $inc: { tokenVersion: 1 }
        });
        return;
    }

    const store = await readFallbackStore();
    const targetUser = store.users.find((user) => String(user._id) === String(userId));

    if (!targetUser) {
        return;
    }

    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    targetUser.updatedAt = new Date().toISOString();
    await writeFallbackStore(store);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    incrementTokenVersion,
    verifyPassword
};
