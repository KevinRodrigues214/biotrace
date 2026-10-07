
const express = require('express');
const jwt = require('jsonwebtoken');

const Profile = require('../models/Profile');
const User = require('../models/User');

const router = express.Router();

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const profile = await Profile.findOne({ user: userId }).populate('user', 'name username email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        return res.status(200).json({
            message: 'Profile retrieved successfully.',
            profile
        });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        return res.status(500).json({ message: 'Failed to retrieve profile.' });
    }
});

router.post('/profile', requireAuth, async (req, res) => {
    try {
        const { name, age, gender, height, weight } = req.body;
        const userId = req.user.userId;

        if (!name || !age || !gender || !height || !weight) {
            return res.status(400).json({
                message: 'All fields are required.'
            });
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const existingProfile = await Profile.findOne({ user: userId });

        if (existingProfile) {
            return res.status(409).json({
                message: 'Profile already exists for this user.'
            });
        }

        const profile = await Profile.create({
            user: userId,
            name,
            age,
            gender,
            height,
            weight
        });

        return res.status(201).json({
            message: 'Profile created successfully.',
            profile
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        console.error('Profile creation error:', error);
        return res.status(500).json({ message: 'Failed to create profile.' });
    }
});

router.put('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, age, gender, height, weight } = req.body;

        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        const updatedProfile = await Profile.findByIdAndUpdate(
            profile._id,
            { name, age, gender, height, weight },
            { new: true }
        );

        return res.status(200).json({
            message: 'Profile updated successfully.',
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ message: 'Failed to update profile.' });
    }
});

module.exports = router;

