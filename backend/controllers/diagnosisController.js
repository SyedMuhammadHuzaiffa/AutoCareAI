const model = require("../config/gemini");
const Car = require("../models/Car");
const Diagnosis = require("../models/Diagnosis");

const diagnoseProblem = async (req, res) => {
  try {
    // ✅ FIX: accept BOTH naming styles safely
    const symptom = req.body.symptom || req.body.symptoms;
    const { carId } = req.body;
    const imageFile = req.file;

    const userId = req.user?.id;

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "carId is required",
      });
    }

    if (!symptom && !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Either symptom or image is required",
      });
    }

    // -------------------------
    // CAR CHECK
    // -------------------------
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    // -------------------------
    // BUILD PROMPT
    // -------------------------
    let prompt = `
You are a senior automotive diagnostic expert.

CAR:
- Brand: ${car.brand}
- Model: ${car.model}
- Year: ${car.year}
- Mileage: ${car.mileage} km

SYMPTOM:
${symptom || "Not provided"}
`;

    // -------------------------
    // IMAGE HANDLING
    // -------------------------
    if (imageFile) {
      const base64Image = imageFile.buffer.toString("base64");

      prompt += `
IMAGE:
data:image/jpeg;base64,${base64Image}
`;
    }

    // -------------------------
    // STRICT JSON OUTPUT
    // -------------------------
    prompt += `
Return ONLY valid JSON:
{
  "issue": "1 sentence fault",
  "severity": "low | medium | high",
  "safe_to_drive": true,
  "recommendation": ["step1", "step2"],
  "possible_causes": ["cause1", "cause2"],
  "confidence": "low | medium | high"
}
`;

    // -------------------------
    // AI CALL
    // -------------------------
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // -------------------------
    // CLEAN RESPONSE
    // -------------------------
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      const match = cleaned.match(/\{[\s\S]*\}/);

      if (!match) {
        return res.status(500).json({
          success: false,
          message: "AI returned invalid format",
          raw: text,
        });
      }

      parsed = JSON.parse(match[0]);
    }

    // -------------------------
    // SAVE DIAGNOSIS
    // -------------------------
    const saved = await Diagnosis.create({
      userId,
      carId,
      symptom,
      result: parsed,
    });

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.json({
      success: true,
      data: parsed,
      meta: {
        diagnosisId: saved._id,
      },
    });
  } catch (err) {
    console.log("Diagnosis Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { diagnoseProblem };
