// server/routes/appointmentRoutes.js

const express = require('express');
const { getAppointments } = require('../controllers/appointmentController');
const router = express.Router();

router.get('/', getAppointments);

module.exports = router;