const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 14
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        required: true
    },
    height: {
        type: Number,
        required: true,
        min: 50
    },
    weight: {
        type: Number,
        required: true,
        min: 20
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);

