const { extractAppointmentDetails } = require("../services/aiService");
const {
    bookAppointment,
    checkAvailability,
    cancelAppointment,
    rescheduleAppointment
} = require("../services/appointmentService");

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    const ai = await extractAppointmentDetails(message);

    console.log("AI Response:", ai);

   const intent = ai.intent.toLowerCase();

if (intent === "book" || intent === "book_appointment") {
    return res.json(await bookAppointment(ai));
}

if (intent === "availability") {
    return res.json(await checkAvailability(ai));
}

if (intent === "cancel") {
    return res.json(await cancelAppointment(ai));
}
if (intent === "reschedule" || intent === "reschedule_appointment") {
    return res.json(await rescheduleAppointment(ai));
}
return res.json({
    success: false,
    message: `Intent '${ai.intent}' not supported yet.`
});
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};