const express = require('express');
const mongoose = require('mongoose');

const Meal = require('../models/Meal');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

router.get('/nutrition/summary', requireAuth, async (req, res) => {
    const { from, to } = req.query;
    if (!isValidDate(from) || !isValidDate(to) || from > to) {
        return res.status(400).json({
            message: 'from and to must be valid dates in YYYY-MM-DD format, with from not later than to.'
        });
    }

    const dayCount = (Date.parse(`${to}T00:00:00.000Z`) -
        Date.parse(`${from}T00:00:00.000Z`)) / 86400000 + 1;
    if (dayCount > 35) {
        return res.status(400).json({ message: 'The summary range cannot exceed 35 days.' });
    }

    try {
        const days = await Meal.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.userId),
                    date: { $gte: from, $lte: to }
                }
            },
            {
                $group: {
                    _id: '$date',
                    calories: { $sum: '$calories' },
                    protein: { $sum: '$protein' },
                    carbs: { $sum: '$carbs' },
                    fat: { $sum: '$fat' },
                    mealCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    calories: 1,
                    protein: 1,
                    carbs: 1,
                    fat: 1,
                    mealCount: 1
                }
            }
        ]);

        const totals = days.reduce((sum, day) => ({
            calories: sum.calories + day.calories,
            protein: sum.protein + day.protein,
            carbs: sum.carbs + day.carbs,
            fat: sum.fat + day.fat,
            mealCount: sum.mealCount + day.mealCount
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 });

        return res.status(200).json({ from, to, days, totals });
    } catch (error) {
        console.error('Nutrition summary retrieval error:', error);
        return res.status(500).json({ message: 'Failed to retrieve nutrition summary.' });
    }
});

module.exports = router;
