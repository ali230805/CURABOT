const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const HEALTH_ASSISTANT_PROMPT = [
    'You are CURABOT, a supportive health information assistant.',
    'Answer the user clearly and calmly in plain language.',
    'Do not claim to diagnose, prescribe, or replace a clinician.',
    'Encourage urgent medical care for severe or emergency symptoms.',
    'Keep responses practical, structured, and concise.'
].join(' ');

const extractGeminiText = (data) => {
    const parts = data?.candidates?.[0]?.content?.parts;

    if (!Array.isArray(parts)) {
        return '';
    }

    return parts
        .map((part) => part?.text || '')
        .join('\n')
        .trim();
};

const generateChatResponse = async (question) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        const error = new Error('Gemini API key is not configured.');
        error.statusCode = 500;
        throw error;
    }

    try {
        const response = await axios.post(
            GEMINI_API_URL,
            {
                systemInstruction: {
                    parts: [{ text: HEALTH_ASSISTANT_PROMPT }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: question }]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 600
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                timeout: 20000
            }
        );

        const answer = extractGeminiText(response.data);

        if (!answer) {
            const error = new Error('Gemini returned an empty response.');
            error.statusCode = 502;
            throw error;
        }

        return answer;
    } catch (error) {
        if (error.response) {
            const apiError = new Error(
                error.response.data?.error?.message || 'Gemini API request failed.'
            );
            apiError.statusCode = error.response.status >= 400 && error.response.status < 500 ? 502 : 503;
            throw apiError;
        }

        if (error.code === 'ECONNABORTED') {
            const timeoutError = new Error('Gemini API request timed out.');
            timeoutError.statusCode = 504;
            throw timeoutError;
        }

        throw error;
    }
};

module.exports = {
    generateChatResponse
};
