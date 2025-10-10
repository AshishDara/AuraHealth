const OpenAI = require('openai');
const pdf = require('pdf-parse');
const Chat = require('../models/Chat');

// *** FIX: These two lines were missing ***
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const data = await pdf(req.file.buffer);
    const reportText = data.text;
    const userQuestion = req.body.message || `Analyze: ${req.file.originalname}`;

    await Chat.create({
      role: 'user',
      content: userQuestion,
      fileName: req.file.originalname,
    });

    const systemPrompt = `
      You are "Aura", a personal AI health assistant.
      Your task is to analyze the provided text from a health report.
      - Use Markdown formatting (like headings, bullet points, and bold text) to structure your response clearly.
      - Do NOT provide any medical advice, diagnosis, or treatment recommendations.
      - You must explicitly state that you are an AI assistant and the user should consult a real doctor for medical advice.
    `;
    
    // The 'openai' variable is now correctly defined and can be used here
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the health report text: \n\n${reportText}\n\nMy question is: ${userQuestion}` }
      ]
    });

    const aiResponse = {
      role: 'assistant',
      content: response.choices[0].message.content,
    };
    
    await Chat.create(aiResponse);
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ error: 'Failed to analyze the report.' });
  }
};