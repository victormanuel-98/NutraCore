const mongoose = require('mongoose');

const menuConsumptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    plannerVersionByPeriod: {
      type: Object,
      default: () => ({ daily: 0, weekly: 0, monthly: 0 })
    },
    consumedByPeriod: {
      type: Object,
      default: () => ({ daily: {}, weekly: {}, monthly: {} })
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuConsumption', menuConsumptionSchema);
