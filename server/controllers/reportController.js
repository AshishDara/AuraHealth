// server/controllers/reportController.js

const OpenAI = require('openai');
const pdf = require('pdf-parse');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeReport = async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // Parse the PDF text from the uploaded file buffer
    const data = await pdf(req.file.buffer);
    const reportText = data.text;

    // The system prompt is critical for getting a safe and helpful response
    const systemPrompt = `
      You are "Aura", a personal AI health assistant.
      Your task is to analyze the provided text from a health report.
      - Summarize the key findings in simple, easy-to-understand language.
      - Do NOT provide any medical advice, diagnosis, or treatment recommendations.
      - You must explicitly state that you are an AI assistant and the user should consult a real doctor for medical advice.
      - If the user asks a specific question (e.g., "what does my cholesterol mean?"), answer that question based on the report text, but still maintain the persona of a helpful assistant, not a medical professional.
      - Keep the summary concise and well-structured.
    `;

    // Get the user's specific question from the request body, if any
    const userQuestion = req.body.message || 'Please summarize this health report.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using a more advanced model for better analysis
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the health report text: \n\n${reportText}\n\nMy question is: ${userQuestion}` }
      ]
    });

    const aiResponse = {
      role: 'assistant',
      content: response.choices[0].message.content,
    };

    // We don't need to save the report analysis to the chat history DB
    // to maintain user privacy, but you could add that logic here if desired.

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ error: 'Failed to analyze the report.' });
  }
};