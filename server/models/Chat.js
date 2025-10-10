const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // *** ADD THIS NEW FIELD ***
  // It's not required, so normal text messages won't be affected.
  fileName: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;