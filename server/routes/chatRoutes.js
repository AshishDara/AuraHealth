// server/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const { getChatHistory, handleChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Import protect

// Apply the middleware to both routes
router.route('/').get(protect, getChatHistory).post(protect, handleChat);

module.exports = router;