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
If the user asks:
- Who is the cardiologist?
- Which doctors are available?
- Tell me about the dermatologist.

Return:

{
 "intent":"doctor_info",
 "specialty":"Cardiologist"
}

If the user asks for all doctors:

{
 "intent":"doctor_info",
 "specialty":""
}
 If the user asks:
- What are your clinic timings?
- When is the hospital open?
- What are your working hours?

Return:

{
  "intent":"clinic_timings"
}
Return in this format:

{
  "intent":"",
  "specialty":"",
  "doctor":"",
  "date":"",
  "time":""
}
IMPORTANT:

If the user only provides one missing detail like:

"Tomorrow"
"9 AM"
"Cardiologist"
"Dr Rajesh Sharma"

Return ONLY that field.

Examples:

User: Tomorrow

{
  "intent":"",
  "specialty":"",
  "doctor":"",
  "date":"2026-07-09",
  "time":""
}

User: 9 AM

{
  "intent":"",
  "specialty":"",
  "doctor":"",
  "date":"",
  "time":"09:00"
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
async function translateResponse(message, language) {

  if (language === "en-US") {
    return message;
  }

  let targetLanguage = "English";

  if (language === "hi-IN") {
    targetLanguage = "Hindi";
  }

  if (language === "kn-IN") {
    targetLanguage = "Kannada";
  }

  const prompt = `
Translate the following hospital assistant response into ${targetLanguage}.

Rules:
- Keep the meaning exactly the same.
- Do not add extra information.
- Return only the translated sentence.

Text:
${message}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text.trim();

}
module.exports = {
    extractAppointmentDetails,
    translateResponse
};