const { extractAppointmentDetails } = require("../services/aiService");

const {
    bookAppointment,
    checkAvailability,
    cancelAppointment,
    rescheduleAppointment,
    getDoctorInfo,
    getClinicTimings
} = require("../services/appointmentService");
const {
    updateConversation,
    clearConversation
} = require("../services/conversationService");

exports.chat = async (req, res) => {

    try {

        const {message,language,llm = "gemini"} = req.body;
        const sessionId = "guest";
        const ai = await extractAppointmentDetails(message,llm);
        const request = updateConversation(sessionId, ai);

        console.log("Conversation State:", request);
        
        console.log("AI Response:", ai);

       const intent = (request.intent || "").toLowerCase();

        let result;

        if (intent === "book" || intent === "book_appointment") {

            result = await bookAppointment(request, language);

        }
        else if (intent === "availability") {

            result = await checkAvailability(request, language);

        }
        else if (intent === "cancel") {

            result = await cancelAppointment(request, language);

        }
        else if (intent === "reschedule" || intent === "reschedule_appointment") {

            result = await rescheduleAppointment(request, language);

        }
        else if (
            intent === "doctor_info" ||
            intent === "doctor" ||
            intent === "query"
        ) {

            result = await getDoctorInfo(request, language);

        }
        else if (
            intent === "clinic_timings" ||
            intent === "timings" ||
            intent === "hours"
        ) {

            result = await getClinicTimings(language);

        }
        else {

            result = {
                success: false,
                message: `Intent '${ai.intent}' not supported yet.`
            };

        }
      if (result.success) {
    clearConversation(sessionId);
}
        return res.json(result);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};