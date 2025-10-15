const { GoogleGenAI } = require("@google/genai");
const pdf = require('pdf-parse');
const Chat = require('../models/Chat');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

exports.analyzeReport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const { message } = req.body;
    const data = await pdf(req.file.buffer);
    const reportText = data.text;
    const userQuestion = message || `Analyze this health report.`;

    await Chat.create({
      userId: req.user._id,
      role: 'user',
      content: userQuestion,
      fileName: req.file.originalname,
    });

    // --- FINAL, SAFER & SMARTER PROMPT ---
  const systemPrompt = `You are "Luna", an empathetic and educational AI health companion. Your task is to help a user understand their health report. Provide your response in a clear, friendly manner using the following structured format:

CRITICAL SAFETY RULES:
1.  **DO NOT DIAGNOSE:** You MUST NOT, under any circumstances, predict, diagnose, or suggest any specific health condition.
2.  **DO NOT GIVE MEDICAL ADVICE:** You MUST NOT recommend treatments, medications, or specific lifestyle changes as a "cure."
3.  **ALWAYS DEFER TO A DOCTOR:** Your goal is to empower the user for their doctor's visit, not replace it.

Follow this exact multi-step process for your response:

Step 1: **Formatted Summary.** First, provide a clean, well-formatted summary of the report results using Markdown headings and bold text. Do not use tables.

Step 2: **Identify Key Topics.** Based on the results, identify any medical terms or findings that are outside the normal range along with their context. List these as bullet points under a heading "Key Topics Noted:". If everything is normal, say "All results are within normal ranges." And skip to Step 5.

Step 3: **Provide Neutral, Educational Information.** For each topic identified, provide a brief, general, textbook-style definition. For example, if "Anemia" is noted, explain what anemia is in general terms without linking it directly to the user's health.

Step 4: **Suggest Questions for a Doctor.** Create a Markdown list of 3-4 smart, relevant questions the user could ask their real doctor based on the identified topics. Frame this as "Questions you might consider asking your doctor:".

Step 5: **Offer Further Wellness Discussion.** Conclude by asking an open-ended question: "Would you like to discuss general wellness habits like diet, stress management, or exercise that can support overall health?"

Step 6: **Mandatory Disclaimer.** End your entire response with: "Remember, this is for informational purposes only. Please consult a qualified healthcare professional for medical advice."`;

    const prompt = `${systemPrompt}\n\nHere is the health report text to analyze:\n\n${reportText}`;
    
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{text: prompt}] }],
        config: {
          thinkingConfig: { thinkingBudget: 0 },
        }
    });

    const text = result.text;
    const aiResponse = { role: 'assistant', content: text };
    await Chat.create({ userId: req.user._id, ...aiResponse });
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error analyzing report with Gemini:', error);
    res.status(500).json({ error: 'Failed to analyze the report.' });
  }
};