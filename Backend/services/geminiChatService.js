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

const FALLBACK_GUIDES = [
    {
        label: 'headache',
        keywords: ['headache', 'migraine', 'head pain'],
        why: [
            'Tension, dehydration, lack of sleep, eye strain, viral illness, or migraine can all cause headaches.',
            'If it is one-sided, throbbing, or comes with nausea or light sensitivity, migraine is one possible pattern.'
        ],
        precautions: [
            'Rest in a quiet place and drink enough water.',
            'Try to sleep and reduce screen time for a while.',
            'If you normally tolerate them, basic pain relievers may help when used exactly as directed on the label.'
        ],
        avoid: [
            'Avoid skipping meals, alcohol, dehydration, and too much screen exposure.',
            'Avoid taking repeated pain medicine too often, because that can worsen headaches over time.'
        ],
        seekHelp: [
            'Get urgent medical help if the headache is sudden and severe, follows a head injury, or comes with weakness, confusion, fainting, seizure, or trouble speaking.',
            'See a doctor soon if headaches are getting more frequent, lasting longer, or becoming much worse than usual.'
        ]
    },
    {
        label: 'fever',
        keywords: ['fever', 'temperature', 'chills'],
        why: [
            'Fever often happens when your body is reacting to an infection such as a viral illness, throat infection, or another inflammatory trigger.',
            'It matters whether the fever is mild and short-lived or high and persistent.'
        ],
        precautions: [
            'Drink fluids often and rest as much as possible.',
            'Wear light clothing and monitor your temperature.',
            'Use fever-reducing medicine only if you normally tolerate it and follow the package instructions carefully.'
        ],
        avoid: [
            'Avoid dehydration, heavy exercise, and alcohol.',
            'Avoid ignoring fever that continues for days or comes with worsening symptoms.'
        ],
        seekHelp: [
            'Get urgent help if fever comes with breathing trouble, chest pain, severe confusion, seizure, dehydration, stiff neck, or a rapidly worsening condition.',
            'See a clinician if the fever is high, keeps returning, or lasts longer than expected.'
        ]
    },
    {
        label: 'cough or cold symptoms',
        keywords: ['cough', 'cold', 'runny nose', 'congestion', 'sneezing'],
        why: [
            'A cough or cold pattern is often caused by viral infection, throat irritation, allergies, or post-nasal drip.',
            'A dry cough and sore throat often fit a viral or irritation pattern, while mucus and fever can suggest infection.'
        ],
        precautions: [
            'Drink warm fluids, rest, and keep the air comfortably humid if possible.',
            'Use simple soothing measures such as honey in warm water if appropriate for you.',
            'Monitor whether you are improving over the next few days.'
        ],
        avoid: [
            'Avoid smoking, vaping, dust exposure, and strong irritants.',
            'Avoid pushing through heavy activity if symptoms are getting worse.'
        ],
        seekHelp: [
            'Get urgent help if you have shortness of breath, chest pain, bluish lips, severe weakness, or confusion.',
            'See a doctor if the cough is lasting a long time, producing blood, or paired with high fever or worsening breathing.'
        ]
    },
    {
        label: 'sore throat',
        keywords: ['sore throat', 'throat pain', 'painful swallowing'],
        why: [
            'Sore throat is often linked to viral infection, irritation, dry air, allergy, or sometimes bacterial infection.',
            'The chance of something more serious rises if there is high fever, pus on the tonsils, or trouble swallowing.'
        ],
        precautions: [
            'Drink warm fluids and rest your voice if it feels irritated.',
            'Gargling warm salt water may help some people.',
            'Watch for fever, worsening pain, or swelling.'
        ],
        avoid: [
            'Avoid smoking, vaping, very spicy food, and dehydration.',
            'Avoid sharing cups or utensils if infection is possible.'
        ],
        seekHelp: [
            'Get urgent help if there is trouble breathing, drooling, or you cannot swallow fluids.',
            'See a clinician if symptoms are severe, one-sided, or not improving.'
        ]
    },
    {
        label: 'stomach upset',
        keywords: ['stomach', 'abdominal', 'abdomen', 'vomit', 'vomiting', 'nausea', 'diarrhea'],
        why: [
            'Stomach pain, nausea, vomiting, or diarrhea can happen with infection, food irritation, indigestion, dehydration, or other abdominal conditions.',
            'The location of pain and whether there is fever, blood, or repeated vomiting matter a lot.'
        ],
        precautions: [
            'Sip fluids slowly and often to prevent dehydration.',
            'Choose bland foods only when you feel ready to eat.',
            'Rest and monitor whether symptoms are settling or becoming sharper and more localized.'
        ],
        avoid: [
            'Avoid greasy foods, alcohol, and large heavy meals.',
            'Avoid ignoring signs of dehydration such as very dark urine, dizziness, or inability to keep fluids down.'
        ],
        seekHelp: [
            'Get urgent help if there is severe abdominal pain, blood in vomit or stool, persistent vomiting, fainting, or signs of dehydration.',
            'See a clinician if pain is worsening, especially on one side, or if symptoms last longer than expected.'
        ]
    },
    {
        label: 'dizziness',
        keywords: ['dizzy', 'dizziness', 'lightheaded', 'lightheadedness', 'vertigo'],
        why: [
            'Dizziness can happen because of dehydration, low blood pressure, low blood sugar, inner-ear issues, anxiety, infection, or medication effects.',
            'It matters whether the feeling is spinning, faintness, or imbalance.'
        ],
        precautions: [
            'Sit or lie down right away if you feel unsteady.',
            'Drink fluids and avoid sudden standing or fast movements.',
            'Eat if you may have gone too long without food.'
        ],
        avoid: [
            'Avoid driving, climbing, or operating anything dangerous while dizzy.',
            'Avoid standing up quickly or skipping fluids.'
        ],
        seekHelp: [
            'Get urgent help if dizziness comes with chest pain, fainting, one-sided weakness, severe headache, slurred speech, or trouble walking.',
            'See a clinician if it keeps returning, is getting worse, or has no clear cause.'
        ]
    },
    {
        label: 'chest pain or breathing symptoms',
        keywords: ['chest pain', 'shortness of breath', 'breathing', 'breathless', 'tight chest'],
        why: [
            'Chest discomfort or breathing trouble can have mild causes like muscle strain or viral illness, but it can also signal a serious condition.',
            'Because the range goes from minor to emergency, these symptoms should be treated carefully.'
        ],
        precautions: [
            'Stop activity and rest immediately.',
            'Pay attention to whether the symptom is worsening, spreading, or linked to exertion.'
        ],
        avoid: [
            'Avoid heavy activity and do not try to push through severe symptoms.',
            'Avoid delaying care if breathing is difficult or pain is significant.'
        ],
        seekHelp: [
            'Get urgent medical help immediately if you have chest pain, significant shortness of breath, bluish lips, fainting, or severe weakness.',
            'These symptoms are important enough that emergency evaluation is often the safest choice.'
        ]
    }
];

const GENERIC_FALLBACK_GUIDE = {
    why: [
        'Symptoms can happen for many reasons, including infection, inflammation, dehydration, stress, lack of sleep, allergies, or a condition that needs medical review.',
        'The best next step depends on what symptoms you have, how long they have been happening, and whether they are getting worse.'
    ],
    precautions: [
        'Rest, drink fluids, eat light regular meals if you can, and monitor your symptoms closely.',
        'Write down what started first, what makes it better or worse, and whether fever, pain, weakness, or breathing changes are present.'
    ],
    avoid: [
        'Avoid dehydration, overexertion, alcohol, and ignoring symptoms that are worsening.',
        'Avoid self-medicating beyond normal label directions.'
    ],
    seekHelp: [
        'Get urgent medical help for severe pain, trouble breathing, chest pain, confusion, fainting, seizure, or rapidly worsening symptoms.',
        'See a doctor if symptoms are persistent, recurring, or interfering with daily life.'
    ]
};

const dedupeItems = (items) => Array.from(new Set(items.filter(Boolean)));

const formatSection = (title, items) => {
    const uniqueItems = dedupeItems(items);

    if (uniqueItems.length === 0) {
        return '';
    }

    return `### ${title}\n${uniqueItems.map((item) => `- ${item}`).join('\n')}`;
};

const buildFallbackGuidance = (question) => {
    const normalizedQuestion = String(question || '').toLowerCase();
    const matchedGuides = FALLBACK_GUIDES.filter((guide) =>
        guide.keywords.some((keyword) => normalizedQuestion.includes(keyword))
    );

    const selectedGuide = matchedGuides.length > 0
        ? {
            why: matchedGuides.flatMap((guide) => guide.why),
            precautions: matchedGuides.flatMap((guide) => guide.precautions),
            avoid: matchedGuides.flatMap((guide) => guide.avoid),
            seekHelp: matchedGuides.flatMap((guide) => guide.seekHelp),
            labels: matchedGuides.map((guide) => guide.label)
        }
        : { ...GENERIC_FALLBACK_GUIDE, labels: [] };

    const intro = selectedGuide.labels.length > 0
        ? `Based on what you described, this sounds most related to ${selectedGuide.labels.join(', ')}. I cannot diagnose you, but here is practical general guidance.`
        : 'I cannot diagnose you, but here is practical general guidance based on the symptoms you described.';

    return [
        intro,
        formatSection('Why This May Be Happening', selectedGuide.why),
        formatSection('Precautions To Take', selectedGuide.precautions),
        formatSection('What To Avoid', selectedGuide.avoid),
        formatSection('When To Seek Medical Help', selectedGuide.seekHelp),
        'If you want, you can tell me your exact symptoms, how long they have been happening, your age, and whether you have fever, cough, pain, vomiting, dizziness, or breathing trouble, and I can give more focused general guidance.'
    ]
        .filter(Boolean)
        .join('\n\n');
};

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
        return buildFallbackGuidance(question);
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
