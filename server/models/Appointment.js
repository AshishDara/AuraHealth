// server/models/Appointment.js

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed',
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;