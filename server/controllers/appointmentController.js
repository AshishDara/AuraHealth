const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
  try {
    // This correctly finds appointments from now into the future
    const appointments = await Appointment.find({
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

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
};