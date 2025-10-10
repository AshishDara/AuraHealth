// server/routes/reportRoutes.js

const express = require('express');
const multer = require('multer');
const { analyzeReport } = require('../controllers/reportController');
const router = express.Router();

// Configure multer to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the route: POST /api/v1/reports/analyze
// The 'upload.single('report')' middleware processes the file upload
router.post('/analyze', upload.single('report'), analyzeReport);

module.exports = router;