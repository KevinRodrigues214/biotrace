const express = require('express');
const mongoose = require('mongoose');

const Profile = require('../models/Profile');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

function parseProfile(body) {
    const { name, age, gender, height, weight } = body || {};
    if (typeof name !== 'string' || !name.trim()) {
        return { error: 'Name is required.' };
    }

    const numericFields = { age, height, weight };
    const values = {};
    for (const [field, value] of Object.entries(numericFields)) {
        const number = typeof value === 'number' ? value : Number(value);
        if (value === '' || value === null || value === undefined || !Number.isFinite(number)) {
            return { error: `${field} must be a valid number.` };
        }
        values[field] = number;
    }

    if (!['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
        return { error: 'Invalid gender value.' };
    }
    if (values.age < 14) {
        return { error: 'Age must be at least 14.' };
    }
    if (values.height < 50) {
        return { error: 'Height must be at least 50 cm.' };
    }
    if (values.weight < 20) {
        return { error: 'Weight must be at least 20 kg.' };
    }

    return {
        profile: {
            age: values.age,
            gender,
            height: values.height,
            weight: values.weight
        },
        name: name.trim()
    };
}

function handleProfileError(res, error, action) {
    if (
        error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError
    ) {
        return res.status(400).json({ message: error.message });
    }

    console.error(`Profile ${action} error:`, error);
    return res.status(500).json({ message: `Failed to ${action} profile.` });
}

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.userId })
            .populate('user', 'name username email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        return res.status(200).json({ message: 'Profile retrieved successfully.', profile });
    } catch (error) {
        return handleProfileError(res, error, 'retrieve');
    }
});

router.patch('/profile/goal', requireAuth, async (req, res) => {
    const { goalType } = req.body || {};
    if (!['loss', 'gain', 'maintenance'].includes(goalType)) {
        return res.status(400).json({ message: 'Invalid goal type.' });
    }

    try {
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { goalType } },
            { new: true, runValidators: true }
        ).populate('user', 'name username email');

        if (!profile) {
            return res.status(404).json({ message: 'Create your profile before choosing a nutrition goal.' });
        }

        return res.status(200).json({
            message: 'Nutrition goal saved successfully.',
            profile
        });
    } catch (error) {
        return handleProfileError(res, error, 'update nutrition goal');
    }
});

router.post('/profile', requireAuth, async (req, res) => {
    const { profile: profileData, name, error } = parseProfile(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const existingProfile = await Profile.findOne({ user: req.user.userId });
        if (existingProfile) {
            return res.status(409).json({ message: 'Profile already exists for this user.' });
        }

        user.name = name;
        await user.save();

        const profile = await Profile.create({
            user: req.user.userId,
            ...profileData
        });
        await profile.populate('user', 'name username email');

        return res.status(201).json({ message: 'Profile created successfully.', profile });
    } catch (error) {
        return handleProfileError(res, error, 'create');
    }
});

router.put('/profile', requireAuth, async (req, res) => {
    const { profile: profileData, name, error } = parseProfile(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const profile = await Profile.findOne({ user: req.user.userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.name = name;
        await user.save();

        const updatedProfile = await Profile.findByIdAndUpdate(
            profile._id,
            {
                $set: profileData,
                $unset: { name: '' }
            },
            { new: true, runValidators: true }
        ).populate('user', 'name username email');

        return res.status(200).json({
            message: 'Profile updated successfully.',
            profile: updatedProfile
        });
    } catch (error) {
        return handleProfileError(res, error, 'update');
    }
});

module.exports = router;
