const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // --- THIS IS THE FIX ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed',
  },
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;