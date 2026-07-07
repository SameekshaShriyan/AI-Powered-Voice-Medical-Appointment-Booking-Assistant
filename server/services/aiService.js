const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function extractAppointmentDetails(userMessage) {
const today = new Date().toISOString().split("T")[0];

const prompt = `
You are an AI hospital receptionist.

Today's date is ${today}.

Extract the appointment details.

IMPORTANT:
- Convert relative dates like "today", "tomorrow", "next Monday" into YYYY-MM-DD format.
- Return ONLY valid JSON.
- Do not wrap the JSON in markdown.
Supported intents (IMPORTANT):
- book
- cancel
- reschedule
- availability
- doctor_info

Return ONLY one of the above intent values.
Do NOT return values like "book_appointment" or "cancel_appointment".
Return in this format:

{
  "intent":"",
  "specialty":"",
  "doctor":"",
  "date":"",
  "time":""
}

User:
${userMessage}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(text);
}

module.exports = {
  extractAppointmentDetails,
};