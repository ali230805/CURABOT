const crypto = require('crypto');
const mongoose = require('mongoose');

const fallbackJwtSecret = crypto.randomBytes(48).toString('hex');
let hasWarnedAboutJwtFallback = false;

const getMissingCriticalEnvVars = () =>
    ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'].filter(
        (key) => !String(process.env[key] || '').trim()
    );

const getJwtSecret = () => {
    const configuredSecret = String(process.env.JWT_SECRET || '').trim();

    if (configuredSecret) {
        return configuredSecret;
    }

    if (!hasWarnedAboutJwtFallback) {
        console.warn(
            'JWT_SECRET is not configured. Using an in-memory fallback secret; auth sessions will reset after restart.'
        );
        hasWarnedAboutJwtFallback = true;
    }

    return fallbackJwtSecret;
};

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const getDatabaseUnavailableMessage = () =>
    'Database is not connected. Set MONGODB_URI in your Render backend environment variables and redeploy to enable login and saved data.';

module.exports = {
    getJwtSecret,
    getMissingCriticalEnvVars,
    isDatabaseConnected,
    getDatabaseUnavailableMessage
};
