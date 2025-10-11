const { GoogleGenAI } = require("@google/genai");
const pdf = require('pdf-parse'); // This now works with the older version
const Chat = require('../models/Chat');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

exports.analyzeReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const { message } = req.body;
    
    // Simple and direct parsing method
    const data = await pdf(req.file.buffer);
    const reportText = data.text;
    
    const userQuestion = message || `Analyze: ${req.file.originalname}`;

    await Chat.create({
      role: 'user',
      content: userQuestion,
      fileName: req.file.originalname,
    });

    const systemPrompt = `
      You are "Aura", a personal AI health assistant.
      Your task is to analyze the provided text from a health report.
      - Use Markdown formatting to structure your response clearly.
      - Do NOT provide any medical advice.
      - You must explicitly state that you are an AI assistant and a user should consult a real doctor.
    `;

    const prompt = `${systemPrompt}\n\nHere is the health report text: \n\n${reportText}\n\nMy question is: ${userQuestion}`;
    
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{text: prompt}] }]
    });

    const text = result.text;

    const aiResponse = {
      role: 'assistant',
      content: text,
    };
    
    await Chat.create(aiResponse);
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error analyzing report with Gemini:', error);
    res.status(500).json({ error: 'Failed to analyze the report.' });
  }
};