const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealName: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'individual-food'],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  mealTime: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  fiber: {
    type: Number,
    default: 0
  },
  sodium: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'serving'
  },
  legacyKey: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

mealSchema.index(
  { userId: 1, legacyKey: 1 },
  { unique: true, partialFilterExpression: { legacyKey: { $type: 'string' } } }
);

module.exports = mongoose.model('Meal', mealSchema);