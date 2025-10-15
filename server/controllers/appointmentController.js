const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
  try {
    // --- THE FIX: Filter by the logged-in user's ID ---
    const appointments = await Appointment.find({
      userId: req.user._id,
      status: 'Confirmed',
      date: { $gte: new Date() } 
    }).sort({ date: 'asc' });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    // --- THE FIX: Ensure a user can only update their OWN appointments ---
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, userId: req.user._id }, // The query now checks for both the appointment ID and the user ID
      { status: status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or you are not authorized.' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
};