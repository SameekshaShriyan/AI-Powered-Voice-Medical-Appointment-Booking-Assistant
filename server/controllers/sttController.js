const { transcribeAudio } = require("../services/deepgramService");

exports.transcribe = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No audio uploaded"
      });
    }

    const transcript = await transcribeAudio(req.file.buffer);

    res.json({
      transcript
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }
};