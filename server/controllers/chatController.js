const { GoogleGenAI } = require("@google/genai");
const Appointment = require('../models/Appointment');
const Chat = require('../models/Chat');
// --- IMPORT the email functions ---
const { sendAppointmentConfirmationEmail, sendAppointmentCancellationEmail } = require('../utils/emailUtils');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Helper function to extract structured JSON data from a message
async function extractAppointmentDetails(userMessage) {
  const prompt = `You are a data extraction specialist. Analyze the user's request and provide a JSON object with two keys: "title" and "date". The current date is ${new Date().toISOString()}.
  - The "title" should be a clean, short summary of the appointment's purpose.
  - The "date" must be a precise date in ISO 8601 format.
  
  User Request: "${userMessage}"`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const rawText = result.text;
    const jsonMatch = rawText.match(/{[\s\S]*}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);

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
    const history = await Chat.find({ userId: req.user._id }).sort({ createdAt: 'asc' });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

exports.handleChat = async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1];
  await Chat.create({ userId: req.user._id, role: 'user', content: userMessage.content, fileName: userMessage.fileName || null });

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
        await Chat.create({ userId: req.user._id, ...failedMessage });
        return res.json({ response: failedMessage });
      }

      const deletedAppointment = await Appointment.findOneAndDelete({ userId: req.user._id, title: { $regex: new RegExp(titleToCancel, "i") } });
      if (!deletedAppointment) {
        const notFoundMessage = { role: 'assistant', content: `I couldn't find an appointment titled "${titleToCancel}".` };
        await Chat.create({ userId: req.user._id, ...notFoundMessage });
        return res.json({ response: notFoundMessage });
      }

      // --- SEND CANCELLATION EMAIL ---
      await sendAppointmentCancellationEmail(req.user, deletedAppointment);

      const confirmationMessage = { role: 'assistant', content: `OK. I've canceled your "${deletedAppointment.title}" appointment.` };
      await Chat.create({ userId: req.user._id, ...confirmationMessage });
      return res.json({ response: confirmationMessage });

    } else if (isBooking) {
      const details = await extractAppointmentDetails(userMessage.content);
      
      if (!details || !details.title || !details.date) {
        const failedMessage = { role: 'assistant', content: "I'm sorry, I couldn't understand the details of the appointment. Could you please provide a clear reason and date?" };
        await Chat.create({ userId: req.user._id, ...failedMessage });
        return res.json({ response: failedMessage });
      }
      
      const newAppointment = await Appointment.create({
        userId: req.user._id,
        title: details.title,
        date: new Date(details.date),
      });

      // --- SEND CONFIRMATION EMAIL ---
      await sendAppointmentConfirmationEmail(req.user, newAppointment);

      const confirmationMessage = { role: 'assistant', content: `Appointment confirmed: "${newAppointment.title}" on ${newAppointment.date.toLocaleString()}.` };
      await Chat.create({ userId: req.user._id, ...confirmationMessage });
      return res.json({ response: confirmationMessage });

    } else {
  const systemPrompt = `You are "Luna", a helpful and personalized AI health assistant and companion. Be friendly and conversational and act like a human. Use the user's health profile to tailor your responses. Be empathetic and supportive, especially regarding health topics. Be mindful of the user's emotional state and respond with care. Be short and concise.
      ---
      USER'S HEALTH PROFILE:
      - Name: ${req.user.name}
      - Blood Type: ${req.user.bloodType || 'Not provided'}
      - Known Allergies: ${req.user.allergies || 'Not provided'}
      - Ongoing Health Conditions: ${req.user.healthConditions || 'Not provided'}
      - Health Goals: ${req.user.healthGoals || 'Not provided'}
      ---`;

      const history = messages.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
      const result = await ai.models.generateContent({ model: "gemini-2.5-flash", systemInstruction: systemPrompt, contents: history });
      const assistantResponse = { role: 'assistant', content: result.text };
      await Chat.create({ userId: req.user._id, ...assistantResponse });
      res.json({ response: assistantResponse });
    }
  } catch (error) {
    console.error('Error in handleChat:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
};