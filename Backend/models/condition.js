const mongoose = require('mongoose');

const ConditionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide condition name'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide condition description']
    },
    commonSymptoms: [{
        symptom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Symptom'
        },
        weight: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        }
    }],
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Emergency'],
        default: 'Low'
    },
    recommendedActions: [{
        type: String,
        enum: ['Home Care', 'Doctor Visit', 'Urgent Care', 'Emergency Room', 'Specialist']
    }],
    homeRemedies: [String],
    whenToSeeDoctor: String,
    riskFactors: [String],
    preventionTips: [String],
    icd10Code: {
        type: String,
        trim: true
    },
    isChronic: {
        type: Boolean,
        default: false
    },
    isContagious: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Condition', ConditionSchema);
