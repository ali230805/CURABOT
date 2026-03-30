const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide symptom name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide symptom description']
    },
    category: {
        type: String,
        enum: ['General', 'Respiratory', 'Gastrointestinal', 'Cardiovascular', 'Neurological', 'Musculoskeletal', 'Skin', 'Other'],
        default: 'General'
    },
    severityLevel: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe', 'Emergency'],
        default: 'Mild'
    },
    commonQuestions: [{
        question: String,
        type: String
    }],
    relatedSymptoms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Symptom'
    }],
    icd10Code: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Symptom', SymptomSchema);
