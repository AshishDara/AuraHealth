const OpenAI = require('openai');
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');

// Initialize OpenAI with your API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET /api/v1/chat - Fetches the entire chat history
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
  await Chat.create({ role: 'user', content: userMessage.content });

  const systemPrompt = `
    You are "Aura", a personal AI health assistant.
    - Your goal is to be helpful and empathetic, but you must clarify you are an AI and not a medical professional.
    - Do not provide medical advice.
    - You can book and cancel appointments.
    - When a user asks to book an appointment, use the 'book_appointment' function.
    - When a user asks to cancel an appointment, use the 'cancel_appointment' function.
    - Infer the current date to be ${new Date().toISOString()}.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
        {
          type: 'function',
          function: {
            name: 'cancel_appointment',
            description: 'Cancels an existing appointment for the user based on its title or date.',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'The title of the appointment to cancel, e.g., "Dental Checkup".' },
                date: { type: 'string', description: 'The date of the appointment to cancel, in ISO 8601 format.' },
              },
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === 'book_appointment') {
        const newAppointment = await Appointment.create({
          title: functionArgs.title,
          date: new Date(functionArgs.date),
        });
        const confirmationMessage = {
          role: 'assistant',
          content: `Appointment confirmed! I've booked a "${newAppointment.title}" for you on ${new Date(newAppointment.date).toLocaleString()}.`,
        };
        await Chat.create(confirmationMessage);
        return res.json({ response: confirmationMessage });
      }

      if (functionName === 'cancel_appointment') {
        console.log("AI is trying to cancel with these details:", functionArgs);

        const query = {};
        if (functionArgs.title) {
          query.title = { $regex: new RegExp(functionArgs.title, "i") };
        }
        if (functionArgs.date) {
            const startOfDay = new Date(functionArgs.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(functionArgs.date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const deletedAppointment = await Appointment.findOneAndDelete(query);

        if (!deletedAppointment) {
          const notFoundMessage = { role: 'assistant', content: "I couldn't find an active appointment that matches your request. Could you be more specific?" };
          await Chat.create(notFoundMessage);
          return res.json({ response: notFoundMessage });
        }

        const confirmationMessage = {
          role: 'assistant',
          content: `OK. I've deleted your "${deletedAppointment.title}" appointment.`,
        };
        await Chat.create(confirmationMessage);
        return res.json({ response: confirmationMessage });
      }
    }

    // If no function was called, just save and return the text response
    await Chat.create({ role: 'assistant', content: responseMessage.content });
    res.json({ response: responseMessage });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
};