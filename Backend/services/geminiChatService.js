const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const DEFAULT_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 1400);
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 45000);
const MAX_CONTINUATION_PASSES = 2;

const HEALTH_ASSISTANT_PROMPT = [
    'You are CURABOT, a supportive health information assistant.',
    'Answer the user clearly and calmly in plain language.',
    'Do not claim to diagnose, prescribe, or replace a clinician.',
    'Encourage urgent medical care for severe or emergency symptoms.',
    'Keep responses practical, structured, and complete.',
    'When the user asks for solutions, steps, remedies, or guidance, provide a full answer with useful detail.',
    'Prefer short sections or bullets when that makes the answer easier to follow.',
    'Do not cut off in the middle of a sentence.',
    'If space is limited, finish the answer cleanly rather than stopping abruptly.'
].join(' ');

const LIMITED_MODE_RESPONSE = [
    'CURABOT chat is running in limited mode right now.',
    'The AI response service is not configured yet, so I cannot generate a full personalized answer.',
    'If your symptoms are severe, worsening, or urgent, please contact a medical professional or emergency service immediately.',
    'For full AI chat responses on the deployed site, set GEMINI_API_KEY in the Render backend environment variables and redeploy.'
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

const getCandidate = (data) => data?.candidates?.[0] || null;

const getFinishReason = (data) => getCandidate(data)?.finishReason || '';

const createContents = (question, partialAnswer = '') => {
    if (!partialAnswer) {
        return [
            {
                role: 'user',
                parts: [{ text: question }]
            }
        ];
    }

    return [
        {
            role: 'user',
            parts: [{ text: question }]
        },
        {
            role: 'model',
            parts: [{ text: partialAnswer }]
        },
        {
            role: 'user',
            parts: [
                {
                    text: 'Continue the previous answer from exactly where you stopped. Do not restart, summarize, or repeat earlier text. Finish the remaining guidance in complete sentences.'
                }
            ]
        }
    ];
};

const mergeAnswerParts = (baseText, continuationText) => {
    const trimmedBase = (baseText || '').trim();
    const trimmedContinuation = (continuationText || '').trim();

    if (!trimmedBase) {
        return trimmedContinuation;
    }

    if (!trimmedContinuation) {
        return trimmedBase;
    }

    const normalizedBase = trimmedBase.replace(/\s+/g, ' ');
    const normalizedContinuation = trimmedContinuation.replace(/\s+/g, ' ');

    if (normalizedBase.includes(normalizedContinuation)) {
        return trimmedBase;
    }

    if (normalizedContinuation.startsWith(normalizedBase)) {
        return trimmedContinuation;
    }

    const maxOverlap = Math.min(trimmedBase.length, trimmedContinuation.length, 240);
    let overlapLength = 0;

    for (let index = maxOverlap; index >= 24; index -= 1) {
        const baseSlice = trimmedBase.slice(-index).replace(/\s+/g, ' ').trim();
        const continuationSlice = trimmedContinuation.slice(0, index).replace(/\s+/g, ' ').trim();

        if (baseSlice && baseSlice === continuationSlice) {
            overlapLength = index;
            break;
        }
    }

    if (overlapLength > 0) {
        return `${trimmedBase}${trimmedContinuation.slice(overlapLength)}`.trim();
    }

    return `${trimmedBase}\n\n${trimmedContinuation}`.trim();
};

const requestGeminiResponse = async (apiKey, question, partialAnswer = '') => {
    const response = await axios.post(
        GEMINI_API_URL,
        {
            systemInstruction: {
                parts: [{ text: HEALTH_ASSISTANT_PROMPT }]
            },
            contents: createContents(question, partialAnswer),
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            timeout: DEFAULT_TIMEOUT_MS
        }
    );

    return {
        answer: extractGeminiText(response.data),
        finishReason: getFinishReason(response.data)
    };
};

const generateChatResponse = async (question) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return LIMITED_MODE_RESPONSE;
    }

    try {
        const initialResponse = await requestGeminiResponse(apiKey, question);
        let answer = initialResponse.answer;
        let finishReason = initialResponse.finishReason;

        for (
            let continuationPass = 0;
            continuationPass < MAX_CONTINUATION_PASSES && finishReason === 'MAX_TOKENS';
            continuationPass += 1
        ) {
            const continuationResponse = await requestGeminiResponse(apiKey, question, answer);
            answer = mergeAnswerParts(answer, continuationResponse.answer);
            finishReason = continuationResponse.finishReason;
        }

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
