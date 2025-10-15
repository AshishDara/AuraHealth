// server/routes/appointmentRoutes.js

const express = require('express');
const router = express.Router();
const { getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware'); // Import protect

router.route('/').get(protect, getAppointments);
router.route('/:id').patch(protect, updateAppointmentStatus);

module.exports = router;