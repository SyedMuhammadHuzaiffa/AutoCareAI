const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const testRoutes = require("./routes/testRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/ping", (req, res) => {
  res.json({ message: "AutoCareAI backend is alive 🚀" });
});

// Test API route
app.use("/api/test", testRoutes);

// Routes (we will add later)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/ai", require("./routes/diagnosisRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
