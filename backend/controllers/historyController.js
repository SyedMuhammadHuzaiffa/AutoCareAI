const Diagnosis = require("../models/Diagnosis");

const getHistory = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const history = await Diagnosis.find({
      carId,
      userId, // 🔥 SECURITY FIX
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getHistory };
