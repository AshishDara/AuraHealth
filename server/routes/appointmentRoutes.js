const express = require('express');
const { getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const router = express.Router();

router.get('/', getAppointments);
router.patch('/:id', updateAppointmentStatus);

module.exports = router;