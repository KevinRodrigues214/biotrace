const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Meal = require('../models/Meal');
const router = express.Router();

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        console.error('Meal authentication error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

function buildMealPayload(body, partial = false) {
    const payload = {};
    const fields = [
        ['date', ['date'], 'date'],
        ['mealName', ['mealName', 'name'], 'text'],
        ['mealType', ['mealType'], 'text'],
        ['mealTime', ['mealTime'], 'text'],
        ['calories', ['calories'], 'number'],
        ['protein', ['protein'], 'number'],
        ['carbs', ['carbs', 'carbohydrates'], 'number'],
        ['fat', ['fat', 'fats'], 'number'],
        ['fiber', ['fiber'], 'number'],
        ['sodium', ['sodium'], 'number'],
        ['sugar', ['sugar'], 'number'],
        ['quantity', ['quantity', 'mealQuantity'], 'number'],
        ['unit', ['unit', 'mealUnit'], 'text']
    ];

    for (const [field, aliases, type] of fields) {
        const source = aliases.find(alias => Object.prototype.hasOwnProperty.call(body, alias));
        if (!source) {
            continue;
        }

        const value = body[source];
        if (type === 'text') {
            if (typeof value !== 'string') {
                return { error: `${field} must be a string.` };
            }
            payload[field] = value.trim();
        } else if (type === 'date') {
            if (!isValidDate(value)) {
                return { error: 'date must use the YYYY-MM-DD format.' };
            }
            payload[field] = value;
        } else {
            if (value === '' && field !== 'calories') {
                continue;
            }

            const number = typeof value === 'number' ? value : Number(value);
            if (!Number.isFinite(number)) {
                return { error: `${field} must be a valid number.` };
            }
            payload[field] = number;
        }
    }

    if (!partial) {
        const requiredFields = ['date', 'mealName', 'mealType', 'mealTime', 'calories'];
        const missingField = requiredFields.find(field =>
            payload[field] === undefined || payload[field] === ''
        );
        if (missingField) {
            return { error: `${missingField} is required.` };
        }
        if (!['breakfast', 'lunch', 'dinner', 'snack', 'individual-food'].includes(payload.mealType)) {
            return { error: 'Invalid mealType.' };
        }
    }

    if (partial && payload.mealType !== undefined &&
        !['breakfast', 'lunch', 'dinner', 'snack', 'individual-food'].includes(payload.mealType)) {
        return { error: 'Invalid mealType.' };
    }

    return { payload };
}

function handleDatabaseError(res, error, action) {
    if (error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: error.message });
    }

    console.error(`Error ${action} meal:`, error);
    return res.status(500).json({ message: 'Internal server error.' });
}

router.get('/meals', requireAuth, async (req, res) => {
    try {
        const filter = { userId: req.user.userId };
        if (req.query.date !== undefined) {
            if (!isValidDate(req.query.date)) {
                return res.status(400).json({ message: 'date must use the YYYY-MM-DD format.' });
            }
            filter.date = req.query.date;
        }

        const meals = await Meal.find(filter).sort({ date: 1, mealTime: 1, createdAt: 1 });
        return res.status(200).json(meals);
    } catch (error) {
        return handleDatabaseError(res, error, 'fetching');
    }
});

router.post('/meals', requireAuth, async (req, res) => {
    const { payload, error } = buildMealPayload(req.body || {});
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const meal = await Meal.create({
            ...payload,
            userId: req.user.userId
        });
        return res.status(201).json(meal);
    } catch (databaseError) {
        return handleDatabaseError(res, databaseError, 'creating');
    }
});

router.put('/meals/:id', requireAuth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid meal ID.' });
    }

    const { payload, error } = buildMealPayload(req.body || {}, true);
    if (error) {
        return res.status(400).json({ message: error });
    }
    if (Object.keys(payload).length === 0) {
        return res.status(400).json({ message: 'At least one meal field is required.' });
    }

    try {
        const meal = await Meal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: payload },
            { new: true, runValidators: true }
        );
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found.' });
        }
        return res.status(200).json(meal);
    } catch (databaseError) {
        return handleDatabaseError(res, databaseError, 'updating');
    }
});

router.delete('/meals/:id', requireAuth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid meal ID.' });
    }

    try {
        const meal = await Meal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found.' });
        }
        return res.status(200).json({ message: 'Meal deleted successfully.' });
    } catch (error) {
        return handleDatabaseError(res, error, 'deleting');
    }
});

module.exports = router;
