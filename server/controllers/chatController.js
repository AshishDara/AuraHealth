const { GoogleGenAI } = require("@google/genai");
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const tools = [
  {
    functionDeclarations: [
      {
        name: 'book_appointment',
        description: 'Books a health or medical appointment for the user. Requires a title (reason) and a date.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The title or reason for the appointment, e.g., "Dental Checkup".' },
            date: { type: 'STRING', description: 'The date and time of the appointment in ISO 8601 format.' },
          },
          required: ['title', 'date'],
        },
      },
      {
        name: 'cancel_appointment',
        description: 'Deletes or cancels an existing appointment for the user based on its title or date.',
        parameters: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING', description: 'The title of the appointment to cancel, e.g., "Dental Checkup".' },
            date: { type: 'STRING', description: 'The date of the appointment to cancel, in ISO 8601 format.' },
          },
        },
      },
    ],
  },
];

exports.getChatHistory = async (req, res) => {
  try {
    const history = await Chat.find({}).sort({ createdAt: 'asc' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

exports.handleChat = async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1];
  
  await Chat.create({ 
    role: 'user', 
    content: userMessage.content,
    fileName: userMessage.fileName || null,
  });

  // --- IMPROVEMENT 1: More forceful instructions for the AI ---
  const systemPrompt = `You are "Aura", a personal AI health assistant.
    - Your primary function is to use tools. You MUST use the tools provided when the user's intent matches.
    - If a user mentions booking, creating, or setting an appointment and provides a reason and a date, you MUST call the 'book_appointment' tool immediately. DO NOT ask for confirmation.
    - If a user mentions deleting or canceling an appointment, you MUST call the 'cancel_appointment' tool.
    - The current date is ${new Date().toISOString()}. Use this to calculate all future dates. The current year is ${new Date().getFullYear()}.
    - Do not provide medical advice.`;

  const history = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      contents: history,
      tools: tools,
    });
    
    // --- IMPROVEMENT 2: More robust response handling ---
    const functionCalls = result.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const { name, args } = call;

      console.log('AI wants to call a tool:', name, args); // Debugging line

      if (name === 'book_appointment') {
        const newAppointment = await Appointment.create({
          title: args.title,
          date: new Date(args.date),
        });
        const confirmationMessage = {
          role: 'assistant',
          content: `Appointment confirmed! I've booked a "${newAppointment.title}" for you on ${new Date(newAppointment.date).toLocaleString()}.`,
        };
        await Chat.create(confirmationMessage);
        return res.json({ response: confirmationMessage });
      }

      if (name === 'cancel_appointment') {
        const query = {};
        if (args.title) { query.title = { $regex: new RegExp(args.title, "i") }; }
        if (args.date) {
            const startOfDay = new Date(args.date); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(args.date); endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        const deletedAppointment = await Appointment.findOneAndDelete(query);
        if (!deletedAppointment) {
          const notFoundMessage = { role: 'assistant', content: "I couldn't find an active appointment that matches your request." };
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
    
    // If no tool was called, send a regular text response
    const textResponse = result.text;
    const assistantResponse = { role: 'assistant', content: textResponse };
    await Chat.create(assistantResponse);
    res.json({ response: assistantResponse });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
};