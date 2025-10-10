// server/routes/chatRoutes.js

const express = require('express');
const { handleChat, getChatHistory } = require('../controllers/chatController');
const router = express.Router();

router.get('/', getChatHistory);
router.post('/', handleChat);

module.exports = router;