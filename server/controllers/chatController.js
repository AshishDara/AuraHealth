// server/controllers/chatController.js

const OpenAI = require('openai');
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');

// Initialize OpenAI with your API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /api/v1/chat - Fetches chat history
exports.getChatHistory = async (req, res) => {
  try {
    const history = await Chat.find({}).sort({ createdAt: 'asc' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

// POST /api/v1/chat - Handles new chat messages
exports.handleChat = async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1];

  // Save the user's message to the database
  await Chat.create({ role: 'user', content: userMessage.content });

  // The system prompt that defines the AI's role and capabilities
  const systemPrompt = `
    You are "Aura", a personal AI health assistant.
    - Your goal is to be helpful and empathetic, but you must clarify you are an AI and not a medical professional.
    - Do not provide medical advice.
    - You can book and manage appointments.
    - You can answer general health questions.
    - When a user asks to book an appointment, use the 'book_appointment' function you have been given.
    - Infer the current date to be ${new Date().toISOString()}.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      tools: [
        {
          type: 'function',
          function: {
            name: 'book_appointment',
            description: 'Books a health or medical appointment for the user.',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'The title or reason for the appointment, e.g., "Dental Checkup".' },
                date: { type: 'string', description: 'The date and time of the appointment in ISO 8601 format.' },
              },
              required: ['title', 'date'],
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;

    // Check if the model decided to call our function
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;

      if (functionName === 'book_appointment') {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        // Save the new appointment to the database
        const newAppointment = await Appointment.create({
          title: functionArgs.title,
          date: new Date(functionArgs.date),
        });

        const confirmationMessage = {
          role: 'assistant',
          content: `Appointment confirmed! I've booked a "${newAppointment.title}" for you on ${new Date(newAppointment.date).toLocaleString()}.`,
        };

        // Save the AI's confirmation message to the chat history
        await Chat.create(confirmationMessage);
        return res.json({ response: confirmationMessage });
      }
    }

    // If no function was called, save the AI's text response
    await Chat.create({ role: 'assistant', content: responseMessage.content });
    res.json({ response: responseMessage });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
};