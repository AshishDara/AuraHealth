const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // --- THIS IS THE FIX ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // This creates a reference to the User model
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
  },
  content: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;