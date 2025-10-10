// server/controllers/appointmentController.js

const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
  try {
    // Find appointments from today onwards and sort them by date
    const appointments = await Appointment.find({ date: { $gte: new Date() } }).sort({ date: 'asc' });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};