const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🔥 IMPORTANT for history queries
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Car", carSchema);
