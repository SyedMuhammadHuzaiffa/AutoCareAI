const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },

    symptom: {
      type: String,
      required: true,
    },

    issue: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
    },

    safe_to_drive: Boolean,

    recommendation: [String],

    possible_causes: [String],

    confidence: {
      type: String,
      enum: ["low", "medium", "high"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
