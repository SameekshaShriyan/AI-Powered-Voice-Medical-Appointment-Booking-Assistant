const { DeepgramClient } = require("@deepgram/sdk");

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

async function transcribeAudio(buffer) {
  try {
    const response = await deepgram.listen.v1.media.transcribeFile(
      buffer,
      {
        model: "nova-3",
        smart_format: true,
        language: "multi",
      }
    );

    return (
      response.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
    );
  } catch (err) {
    console.error("Deepgram Error:", err);
    throw err;
  }
}

module.exports = {
  transcribeAudio,
};