const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  reminders: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  studyGoal: { type: String, default: '4 Hours' },
  language: { type: String, default: 'English (US)' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
