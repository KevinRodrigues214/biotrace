const mongoose = require('mongoose');

const workoutTemplatesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    templates: {
        type: [{
            cardId: {
                type: String,
                required: true
            },
            category: {
                type: String,
                enum: ['push', 'pull', 'legs', 'core', 'general'],
                required: true
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            }
        }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutTemplates', workoutTemplatesSchema);
