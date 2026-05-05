const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 🔥 increased slightly for better UX

  message: {
    success: false,
    message: "Too many AI requests. Please wait a moment.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = aiLimiter;
