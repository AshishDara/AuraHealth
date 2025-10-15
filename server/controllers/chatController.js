const { GoogleGenAI } = require("@google/genai");
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Helper function with robust JSON extraction
async function extractAppointmentDetails(userMessage) {
  const prompt = `You are a data extraction specialist. Analyze the user's request and provide a JSON object with two keys: "title" and "date". The current date is ${new Date().toISOString()}.
  - The "title" should be a clean, short summary of the appointment's purpose.
  - The "date" must be a precise date in ISO 8601 format.
  
  User Request: "${userMessage}"`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    // --- THIS IS THE KEY FIX: Robustly find and extract the JSON object ---
    const rawText = result.text;
    const jsonMatch = rawText.match(/{[\s\S]*}/); // Find the first occurrence of {...}

    if (!jsonMatch) {
      console.error("No JSON object found in the AI's response.");
      return null;
    }

    return JSON.parse(jsonMatch[0]); // Parse only the extracted JSON part

  } catch (error) {
    console.error("Could not extract appointment details:", error);
    return null;
  }
}

// Helper function to find which appointment to cancel
async function findAppointmentTitleToCancel(history) {
  const prompt = `Based on the conversation history, identify the title of the specific appointment the user wants to cancel. Look for phrases like "Appointment confirmed:" to find the title. Return only the exact title and nothing else.\n\nHistory:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}`;
  try {
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return result.text.trim().replace(/Appointment confirmed:|"/g, '').trim();
  } catch (error) {
    return null;
  }
}

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
  await Chat.create({ role: 'user', content: userMessage.content, fileName: userMessage.fileName || null });

  try {
    const lowerCaseMessage = userMessage.content.toLowerCase();
    const bookingKeywords = ['book', 'appointment', 'schedule', 'create', 'set up'];
    const cancelKeywords = ['cancel', 'delete', 'remove'];

    const isCanceling = cancelKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const isBooking = bookingKeywords.some(keyword => lowerCaseMessage.includes(keyword));

    if (isCanceling) {
      const titleToCancel = await findAppointmentTitleToCancel(messages);
      if (!titleToCancel) {
        const failedMessage = { role: 'assistant', content: "I'm sorry, I couldn't determine which appointment to cancel from our conversation." };
        await Chat.create(failedMessage);
        return res.json({ response: failedMessage });
      }

      const deletedAppointment = await Appointment.findOneAndDelete({ title: { $regex: new RegExp(titleToCancel, "i") } });
      if (!deletedAppointment) {
        const notFoundMessage = { role: 'assistant', content: `I couldn't find an appointment titled "${titleToCancel}".` };
        await Chat.create(notFoundMessage);
        return res.json({ response: notFoundMessage });
      }
      const confirmationMessage = { role: 'assistant', content: `OK. I've canceled your "${deletedAppointment.title}" appointment.` };
      await Chat.create(confirmationMessage);
      return res.json({ response: confirmationMessage });

    } else if (isBooking) {
      const details = await extractAppointmentDetails(userMessage.content);
      
      if (!details || !details.title || !details.date) {
        const failedMessage = { role: 'assistant', content: "I'm sorry, I couldn't understand the details of the appointment. Could you please provide a clear reason and date?" };
        await Chat.create(failedMessage);
        return res.json({ response: failedMessage });
      }
      
      const newAppointment = await Appointment.create({
        title: details.title,
        date: new Date(details.date),
      });
      const confirmationMessage = { role: 'assistant', content: `Appointment confirmed: "${newAppointment.title}" on ${newAppointment.date.toLocaleString()}.` };
      await Chat.create(confirmationMessage);
      return res.json({ response: confirmationMessage });

    } else {
      const systemPrompt = `You are "Aura", a helpful AI health assistant. Be friendly and conversational. Do not mention appointments unless the user does.`;
      const history = messages.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
      const result = await ai.models.generateContent({ model: "gemini-2.5-flash", systemInstruction: systemPrompt, contents: history });
      const assistantResponse = { role: 'assistant', content: result.text };
      await Chat.create(assistantResponse);
      res.json({ response: assistantResponse });
    }
  } catch (error) {
    console.error('Error in handleChat:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
};