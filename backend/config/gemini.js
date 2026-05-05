const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a valid model from your account
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

module.exports = model;