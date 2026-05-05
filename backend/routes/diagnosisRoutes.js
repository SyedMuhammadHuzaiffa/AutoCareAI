const express = require("express");
const router = express.Router();

const { diagnoseProblem } = require("../controllers/diagnosisController");
const upload = require("../middleware/upload");
const aiLimiter = require("../middleware/rateLimit");
const { protect } = require("../middleware/authMiddleware");

// 🛡️ protect + rate limit all AI routes
router.use(protect);
router.use(aiLimiter);

// 🚗 SINGLE SMART ENDPOINT (TEXT + IMAGE)
router.post("/diagnose", upload.single("image"), diagnoseProblem);

module.exports = router;
