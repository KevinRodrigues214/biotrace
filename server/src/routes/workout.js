const express = require('express');
const mongoose = require('mongoose');

const Workout = require('../models/Workout');
const WorkoutTemplates = require('../models/WorkoutTemplates');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

const categories = ['push', 'pull', 'legs', 'core', 'general'];
const numericFields = ['targetSets', 'targetReps', 'sets', 'reps', 'weight'];

function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

function parseExercises(value) {
    if (!Array.isArray(value) || value.length > 100) {
        return { error: 'exercises must be an array with at most 100 entries.' };
    }

    const exercises = [];
    for (const [index, exercise] of value.entries()) {
        if (!exercise || typeof exercise.name !== 'string' || !exercise.name.trim()) {
            return { error: `exercises[${index}].name is required.` };
        }
        if (typeof exercise.sourceCard !== 'string' || !exercise.sourceCard.trim()) {
            return { error: `exercises[${index}].sourceCard is required.` };
        }

        const category = exercise.category || 'general';
        if (!categories.includes(category)) {
            return { error: `exercises[${index}].category is invalid.` };
        }

        const parsed = {
            name: exercise.name.trim(),
            category,
            sourceCard: exercise.sourceCard,
            checked: exercise.checked === true,
            workoutTime: typeof exercise.workoutTime === 'string' ? exercise.workoutTime : ''
        };

        for (const field of numericFields) {
            const valueForField = exercise[field];
            if (valueForField === '' || valueForField === null ||
                valueForField === undefined) {
                parsed[field] = null;
                continue;
            }

            const number = typeof valueForField === 'number'
                ? valueForField
                : Number(valueForField);
            if (!Number.isFinite(number) || number < 0) {
                return { error: `exercises[${index}].${field} must be a non-negative number.` };
            }
            parsed[field] = number;
        }

        exercises.push(parsed);
    }

    return { exercises };
}

function completionStateFor(exercises) {
    if (!exercises.length) {
        return null;
    }
    return exercises.every(exercise => exercise.checked)
        ? 'day-done'
        : 'day-partial';
}

function serializeWorkout(workout) {
    return {
        date: workout.date,
        exercises: workout.exercises,
        completionState: workout.completionState
    };
}

function parseTemplates(value) {
    if (!Array.isArray(value) || value.length > 100) {
        return { error: 'templates must be an array with at most 100 entries.' };
    }

    const templatesById = new Map();
    for (const [index, template] of value.entries()) {
        if (!template || typeof template.cardId !== 'string' || !template.cardId.trim()) {
            return { error: `templates[${index}].cardId is required.` };
        }

        const category = template.category || 'general';
        if (!categories.includes(category)) {
            return { error: `templates[${index}].category is invalid.` };
        }

        const { exercises, error } = parseExercises([{
            ...(template.data || {}),
            category,
            sourceCard: template.cardId,
            checked: false
        }]);
        if (error) {
            return { error: `templates[${index}]: ${error}` };
        }

        const { sourceCard, checked, ...data } = exercises[0];
        templatesById.set(template.cardId, {
            cardId: template.cardId,
            category,
            data
        });
    }

    return { templates: [...templatesById.values()] };
}

function handleWorkoutError(res, error, action) {
    if (error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: error.message });
    }

    console.error(`Workout ${action} error:`, error);
    return res.status(500).json({ message: `Failed to ${action} workout.` });
}

router.get('/workouts', requireAuth, async (req, res) => {
    const { from, to } = req.query;
    if (!isValidDate(from) || !isValidDate(to) || from > to) {
        return res.status(400).json({
            message: 'from and to must be valid dates in YYYY-MM-DD format, with from not later than to.'
        });
    }

    const dayCount = (Date.parse(`${to}T00:00:00.000Z`) -
        Date.parse(`${from}T00:00:00.000Z`)) / 86400000 + 1;
    if (dayCount > 400) {
        return res.status(400).json({ message: 'The workout range cannot exceed 400 days.' });
    }

    try {
        const workouts = await Workout.find({
            userId: req.user.userId,
            date: { $gte: from, $lte: to }
        }).sort({ date: 1 });
        return res.status(200).json(workouts.map(serializeWorkout));
    } catch (error) {
        return handleWorkoutError(res, error, 'retrieve');
    }
});

router.post('/workouts/import-legacy', requireAuth, async (req, res) => {
    const legacyWorkouts = req.body && req.body.workouts;
    const legacyTemplates = req.body && req.body.templates;
    if (!Array.isArray(legacyWorkouts) || legacyWorkouts.length > 400) {
        return res.status(400).json({ message: 'workouts must be an array with at most 400 entries.' });
    }
    const parsedTemplates = parseTemplates(legacyTemplates || []);
    if (parsedTemplates.error) {
        return res.status(400).json({ message: parsedTemplates.error });
    }

    const operationsByDate = new Map();
    for (const [index, workout] of legacyWorkouts.entries()) {
        if (!workout || !isValidDate(workout.date)) {
            return res.status(400).json({ message: `workouts[${index}].date is invalid.` });
        }

        const { exercises, error } = parseExercises(workout.exercises);
        if (error) {
            return res.status(400).json({ message: `workouts[${index}]: ${error}` });
        }

        if (!exercises.length) {
            continue;
        }

        operationsByDate.set(workout.date, {
            updateOne: {
                filter: { userId: req.user.userId, date: workout.date },
                update: {
                    $setOnInsert: {
                        userId: req.user.userId,
                        date: workout.date,
                        exercises,
                        completionState: completionStateFor(exercises)
                    }
                },
                upsert: true
            }
        });
    }

    try {
        let imported = 0;
        if (operationsByDate.size) {
            const result = await Workout.bulkWrite([...operationsByDate.values()], { ordered: true });
            imported = result.upsertedCount;
        }

        if (parsedTemplates.templates.length) {
            await WorkoutTemplates.findOneAndUpdate(
                { userId: req.user.userId },
                {
                    $setOnInsert: {
                        userId: req.user.userId,
                        templates: parsedTemplates.templates
                    }
                },
                { upsert: true, runValidators: true, setDefaultsOnInsert: true }
            );
        }

        return res.status(200).json({
            imported,
            templatesImported: parsedTemplates.templates.length
        });
    } catch (error) {
        return handleWorkoutError(res, error, 'import legacy data');
    }
});

router.get('/workout-templates', requireAuth, async (req, res) => {
    try {
        const saved = await WorkoutTemplates.findOne({ userId: req.user.userId });
        return res.status(200).json({ templates: saved ? saved.templates : [] });
    } catch (error) {
        return handleWorkoutError(res, error, 'retrieve exercise templates');
    }
});

router.put('/workout-templates', requireAuth, async (req, res) => {
    const { templates, error } = parseTemplates(req.body && req.body.templates);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        if (templates.length === 0) {
            await WorkoutTemplates.findOneAndDelete({ userId: req.user.userId });
            return res.status(200).json({ templates: [] });
        }

        const saved = await WorkoutTemplates.findOneAndUpdate(
            { userId: req.user.userId },
            {
                $set: { templates },
                $setOnInsert: { userId: req.user.userId }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        return res.status(200).json({ templates: saved.templates });
    } catch (error) {
        return handleWorkoutError(res, error, 'save exercise templates');
    }
});

router.put('/workouts/:date', requireAuth, async (req, res) => {
    const { date } = req.params;
    if (!isValidDate(date)) {
        return res.status(400).json({ message: 'Invalid workout date.' });
    }

    const { exercises, error } = parseExercises(req.body && req.body.exercises);
    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        if (!exercises.length) {
            await Workout.findOneAndDelete({ userId: req.user.userId, date });
            return res.status(200).json({
                workout: { date, exercises: [], completionState: null }
            });
        }

        const workout = await Workout.findOneAndUpdate(
            { userId: req.user.userId, date },
            {
                $set: {
                    exercises,
                    completionState: completionStateFor(exercises)
                },
                $setOnInsert: {
                    userId: req.user.userId,
                    date
                }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        return res.status(200).json({ workout: serializeWorkout(workout) });
    } catch (error) {
        return handleWorkoutError(res, error, 'save');
    }
});

router.delete('/workouts/:date', requireAuth, async (req, res) => {
    if (!isValidDate(req.params.date)) {
        return res.status(400).json({ message: 'Invalid workout date.' });
    }

    try {
        await Workout.findOneAndDelete({
            userId: req.user.userId,
            date: req.params.date
        });
        return res.status(200).json({ message: 'Workout deleted successfully.' });
    } catch (error) {
        return handleWorkoutError(res, error, 'delete');
    }
});

module.exports = router;
