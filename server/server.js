// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
const chatRoutes = require('./routes/chatRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Define the port from environment variables or default to 5001
const PORT = process.env.PORT || 5001;

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});