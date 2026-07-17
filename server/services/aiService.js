const llm = require("./llm");

async function extractAppointmentDetails(userMessage, provider = "gemini") {

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
- clinic_timings

Return ONLY one of the above intent values.

Do NOT return values like:
book_appointment
cancel_appointment

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

If the user only provides ONE missing detail like:

Tomorrow

Return

{
 "intent":"",
 "specialty":"",
 "doctor":"",
 "date":"2026-07-09",
 "time":""
}

If user says

9 AM

Return

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

    const response = await llm.generateContent(provider, prompt);

    const text = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(text);

}

async function translateResponse(message, language, provider = "gemini") {

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

    const translated = await llm.generateContent(provider, prompt);

    return translated.trim();

}

module.exports = {
    extractAppointmentDetails,
    translateResponse
};