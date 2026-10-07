
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const NutritionGoal = require('../models/NutritionGoal');
const router = express.Router();
router.get('/nutrition-goal/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const nutritionGoal = await NutritionGoal.findOne({ userId });

        if (!nutritionGoal) {
            return res.status(404).json({ message: 'Nutrition goal not found.' });
        }

        return res.status(200).json({
            message: 'Nutrition goal retrieved successfully.',
            nutritionGoal
        });
    } catch (error) {
        console.error('Nutrition goal retrieval error:', error);
        return res.status(500).json({ message: 'Failed to retrieve nutrition goal.' });
    }
});
router.post('/nutrition-goal', async (req, res) => {
    try {
        const { userId, goalType, calories, protein, carbohydrates, fats } = req.body;
        const nutritionGoal = await NutritionGoal.create({
            userId,
            goalType,
            calories,
            protein,
            carbohydrates,
            fats
        });
        return res.status(201).json({
            message: 'Nutrition goal created successfully.',
            nutritionGoal
        });
    } catch (error) {
        console.error('Nutrition goal creation error:', error);
        return res.status(500).json({ message: 'Failed to create nutrition goal.' });
    }
});

router.put('/nutrition-goal/:userId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { goalType, calories, protein, carbohydrates, fats } = req.body;
        const nutritionGoal = await NutritionGoal.findOne({ userId });

        if (!nutritionGoal) {
            return res.status(404).json({ message: 'Nutrition goal not found.' });
        }

        const updatedNutritionGoal = await NutritionGoal.findByIdAndUpdate(
            nutritionGoal._id,
            { goalType, calories, protein, carbohydrates, fats },
            { new: true }
        );

        return res.status(200).json({
            message: 'Nutrition goal updated successfully.',
            nutritionGoal: updatedNutritionGoal
        });
    } catch (error) {
        console.error('Nutrition goal update error:', error);
        return res.status(500).json({ message: 'Failed to update nutrition goal.' });
    }
});

module.exports = router;
