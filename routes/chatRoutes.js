const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');

// Initialize Gemini API with error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
}

// Chat context for the AI
const SYSTEM_PROMPT = `You are an AI shopping assistant for a sneaker store. Your role is to:
1. Help customers find the right sneakers based on their preferences
2. Answer questions about products, sizes, and availability
3. Provide style advice and recommendations
4. Assist with order-related queries
5. Be friendly, professional, and knowledgeable about sneakers

Keep responses concise and focused on helping customers with their shopping experience.`;

// Add CORS options specifically for chat routes
const chatCorsOptions = {
  origin: [
    "https://e-com-front.netlify.app",
    "http://localhost:5173",
    /\.vercel\.app$/,
    /\.netlify\.app$/
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

router.post("/", cors(chatCorsOptions), async (req, res) => {
  try {
    if (!genAI) {
      throw new Error("Gemini API not initialized");
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get the chat model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Start a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I'll act as a knowledgeable sneaker store assistant, helping customers with their shopping needs while maintaining a professional and friendly demeanor.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage([{ text: message }]);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
});

module.exports = router;
