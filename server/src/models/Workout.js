const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['push', 'pull', 'legs', 'core', 'general'],
        default: 'general'
    },
    targetSets: {
        type: Number,
        min: 0,
        default: null
    },
    targetReps: {
        type: Number,
        min: 0,
        default: null
    },
    sets: {
        type: Number,
        min: 0,
        default: null
    },
    reps: {
        type: Number,
        min: 0,
        default: null
    },
    weight: {
        type: Number,
        min: 0,
        default: null
    },
    workoutTime: {
        type: String,
        default: ''
    },
    sourceCard: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false
    }
});

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    exercises: {
        type: [workoutExerciseSchema],
        default: []
    },
    completionState: {
        type: String,
        enum: ['day-done', 'day-partial'],
        default: null
    }
}, { timestamps: true });

workoutSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Workout', workoutSchema);
