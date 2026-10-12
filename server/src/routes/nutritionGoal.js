const express = require('express');
const mongoose = require('mongoose');

const NutritionGoal = require('../models/NutritionGoal');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

const validGoalTypes = ['loss', 'gain', 'maintenance'];

function parseGoal(body) {
    const { goalType, calories, protein, carbohydrates, fats } = body || {};
    if (!validGoalTypes.includes(goalType)) {
        return { error: 'Invalid goal type.' };
    }

    const values = { calories, protein, carbohydrates, fats };
    for (const [field, value] of Object.entries(values)) {
        const number = typeof value === 'number' ? value : Number(value);
        if (value === '' || value === null || value === undefined ||
            !Number.isFinite(number) || number < 0) {
            return { error: `${field} must be a non-negative number.` };
        }
        values[field] = number;
    }

    return { goal: { goalType, ...values } };
}

function handleGoalError(res, error, action) {
    if (error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: error.message });
    }

    console.error(`Nutrition goal ${action} error:`, error);
    return res.status(500).json({ message: `Failed to ${action} nutrition goal.` });
}

router.get('/nutrition-goal', requireAuth, async (req, res) => {
    try {
        const nutritionGoal = await NutritionGoal.findOne({ userId: req.user.userId });
        if (!nutritionGoal) {
            return res.status(404).json({ message: 'Nutrition goal not found.' });
        }

        return res.status(200).json({ nutritionGoal });
    } catch (error) {
        return handleGoalError(res, error, 'retrieve');
    }
});

router.post('/nutrition-goal', requireAuth, async (req, res) => {
    const { goal, error } = parseGoal(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const existingGoal = await NutritionGoal.findOne({ userId: req.user.userId });
        if (existingGoal) {
            return res.status(409).json({ message: 'Nutrition goal already exists.' });
        }

        const nutritionGoal = await NutritionGoal.create({
            ...goal,
            userId: req.user.userId
        });
        return res.status(201).json({ nutritionGoal });
    } catch (databaseError) {
        return handleGoalError(res, databaseError, 'create');
    }
});

router.put('/nutrition-goal', requireAuth, async (req, res) => {
    const { goal, error } = parseGoal(req.body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const nutritionGoal = await NutritionGoal.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: goal, $setOnInsert: { userId: req.user.userId } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        return res.status(200).json({ nutritionGoal });
    } catch (databaseError) {
        return handleGoalError(res, databaseError, 'save');
    }
});

router.delete('/nutrition-goal', requireAuth, async (req, res) => {
    try {
        const nutritionGoal = await NutritionGoal.findOneAndDelete({ userId: req.user.userId });
        if (!nutritionGoal) {
            return res.status(404).json({ message: 'Nutrition goal not found.' });
        }
        return res.status(200).json({ message: 'Nutrition goal deleted successfully.' });
    } catch (error) {
        return handleGoalError(res, error, 'delete');
    }
});

module.exports = router;
