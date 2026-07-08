const prisma = require("../lib/prisma");
const translate = require("../utils/translator");

function parseAppointmentDate(date) {

    if (!date) return null;

    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
        return null;
    }

    return appointmentDate;

}

async function findDoctor(specialty) {

    if (!specialty) return null;

    return await prisma.doctor.findFirst({
        where: {
            specialty: {
                equals: specialty,
                mode: "insensitive"
            }
        }
    });

}

async function bookAppointment(data, language = "en-US") {

    if (!data.specialty) {

        return {
            success: false,
            message: translate(
                language,
                "Which specialist would you like to book an appointment with?",
                "आप किस विशेषज्ञ के साथ अपॉइंटमेंट बुक करना चाहते हैं?",
                "ಯಾವ ತಜ್ಞರೊಂದಿಗೆ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?"
            )
        };

    }

    if (!data.date) {

        return {
            success: false,
            message: translate(
                language,
                `Great! You want to see a ${data.specialty}. Which date would you prefer?`,
                `अच्छा! आप ${data.specialty} विशेषज्ञ से मिलना चाहते हैं। किस तारीख़ को?`,
                `ಚೆನ್ನಾಗಿದೆ! ನೀವು ${data.specialty} ತಜ್ಞರನ್ನು ಭೇಟಿ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ. ಯಾವ ದಿನಾಂಕ?`
            )
        };

    }

    if (!data.time) {

        return {
            success: false,
            message: translate(
                language,
                "What time would you like to book the appointment?",
                "आप किस समय अपॉइंटमेंट बुक करना चाहते हैं?",
                "ನೀವು ಯಾವ ಸಮಯಕ್ಕೆ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?"
            )
        };

    }

    const appointmentDate = parseAppointmentDate(data.date);

    if (!appointmentDate) {

        return {
            success: false,
            message: translate(
                language,
                "Invalid appointment date.",
                "अमान्य अपॉइंटमेंट तिथि।",
                "ಅಮಾನ್ಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ."
            )
        };

    }

    const doctor = await findDoctor(data.specialty);

    if (!doctor) {

        return {
            success: false,
            message: translate(
                language,
                "No doctor available for this specialty.",
                "इस विशेषज्ञता के लिए कोई डॉक्टर उपलब्ध नहीं है।",
                "ಈ ತಜ್ಞತೆಗೆ ವೈದ್ಯರು ಲಭ್ಯವಿಲ್ಲ."
            )
        };

    }

    const existing = await prisma.appointment.findFirst({
        where: {
            doctorId: doctor.id,
            date: appointmentDate,
            time: data.time,
            status: "Booked"
        }
    });

    if (existing) {

        return {
            success: false,
            message: translate(
                language,
                "Selected slot is already booked.",
                "चयनित समय पहले से बुक है।",
                "ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯ ಈಗಾಗಲೇ ಬುಕ್ ಆಗಿದೆ."
            )
        };

    }

    const appointment = await prisma.appointment.create({
        data: {
            patient: "Guest",
            doctorId: doctor.id,
            date: appointmentDate,
            time: data.time
        }
    });

    return {

        success: true,

        message: translate(
            language,
            `Appointment booked with ${doctor.name} at ${data.time}.`,
            `${doctor.name} के साथ आपकी अपॉइंटमेंट ${data.time} पर सफलतापूर्वक बुक हो गई है।`,
            `${doctor.name} ಅವರೊಂದಿಗೆ ${data.time}ಕ್ಕೆ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಮಾಡಲಾಗಿದೆ.`
        ),

        appointment

    };

}

async function checkAvailability(data, language = "en-US") {

    if (!data.specialty || !data.date || !data.time) {

        return {
            success: false,
            message: translate(
                language,
                "Please provide specialty, date and time.",
                "कृपया विशेषज्ञता, तारीख़ और समय बताइए।",
                "ದಯವಿಟ್ಟು ತಜ್ಞತೆ, ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ತಿಳಿಸಿ."
            )
        };

    }

    const appointmentDate = parseAppointmentDate(data.date);

    if (!appointmentDate) {

        return {
            success: false,
            message: translate(
                language,
                "Invalid appointment date.",
                "अमान्य अपॉइंटमेंट तिथि।",
                "ಅಮಾನ್ಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ."
            )
        };

    }

    const doctor = await findDoctor(data.specialty);

    if (!doctor) {

        return {
            success: false,
            message: translate(
                language,
                "Doctor not found.",
                "डॉक्टर नहीं मिला।",
                "ವೈದ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ."
            )
        };

    }

    const booked = await prisma.appointment.findFirst({
        where: {
            doctorId: doctor.id,
            date: appointmentDate,
            time: data.time,
            status: "Booked"
        }
    });

    if (booked) {

        return {

            success: false,

            message: translate(
                language,
                `${doctor.name} is not available at ${data.time}.`,
                `${doctor.name} ${data.time} पर उपलब्ध नहीं हैं।`,
                `${doctor.name} ${data.time}ಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ.`
            )

        };

    }

    return {

        success: true,

        message: translate(
            language,
            `${doctor.name} is available at ${data.time}.`,
            `${doctor.name} ${data.time} पर उपलब्ध हैं।`,
            `${doctor.name} ${data.time}ಕ್ಕೆ ಲಭ್ಯವಿದ್ದಾರೆ.`
        )

    };

}
async function cancelAppointment(data, language = "en-US") {

    if (!data.specialty) {
        return {
            success: false,
            message: translate(
                language,
                "Which specialist's appointment would you like to cancel?",
                "आप किस विशेषज्ञ की अपॉइंटमेंट रद्द करना चाहते हैं?",
                "ಯಾವ ತಜ್ಞರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ರದ್ದುಪಡಿಸಲು ಬಯಸುತ್ತೀರಿ?"
            )
        };
    }

    if (!data.date) {
        return {
            success: false,
            message: translate(
                language,
                "Which appointment date would you like to cancel?",
                "आप किस तारीख़ की अपॉइंटमेंट रद्द करना चाहते हैं?",
                "ಯಾವ ದಿನಾಂಕದ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ರದ್ದುಪಡಿಸಲು ಬಯಸುತ್ತೀರಿ?"
            )
        };
    }

    if (!data.time) {
        return {
            success: false,
            message: translate(
                language,
                "What time is the appointment?",
                "अपॉइंटमेंट किस समय है?",
                "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಾವ ಸಮಯದಲ್ಲಿದೆ?"
            )
        };
    }

    const appointmentDate = parseAppointmentDate(data.date);

    if (!appointmentDate) {
        return {
            success: false,
            message: translate(
                language,
                "Invalid appointment date.",
                "अमान्य अपॉइंटमेंट तिथि।",
                "ಅಮಾನ್ಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ."
            )
        };
    }

    const doctor = await findDoctor(data.specialty);

    if (!doctor) {
        return {
            success: false,
            message: translate(
                language,
                "Doctor not found.",
                "डॉक्टर नहीं मिला।",
                "ವೈದ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ."
            )
        };
    }

    const appointment = await prisma.appointment.findFirst({
        where: {
            doctorId: doctor.id,
            date: appointmentDate,
            time: data.time,
            status: "Booked"
        }
    });

    if (!appointment) {
        return {
            success: false,
            message: translate(
                language,
                "No booked appointment found.",
                "कोई बुक की गई अपॉइंटमेंट नहीं मिली।",
                "ಯಾವುದೇ ಬುಕ್ ಮಾಡಿದ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಂಡುಬಂದಿಲ್ಲ."
            )
        };
    }

    await prisma.appointment.update({
        where: {
            id: appointment.id
        },
        data: {
            status: "Cancelled"
        }
    });

    return {
        success: true,
        message: translate(
            language,
            "Appointment cancelled successfully.",
            "आपकी अपॉइंटमेंट सफलतापूर्वक रद्द कर दी गई है।",
            "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಪಡಿಸಲಾಗಿದೆ."
        )
    };

}

async function rescheduleAppointment(data, language = "en-US") {

    if (!data.specialty) {
        return {
            success: false,
            message: translate(
                language,
                "Which specialist's appointment would you like to reschedule?",
                "आप किस विशेषज्ञ की अपॉइंटमेंट बदलना चाहते हैं?",
                "ಯಾವ ತಜ್ಞರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಮರುನಿಗದಿಪಡಿಸಲು ಬಯಸುತ್ತೀರಿ?"
            )
        };
    }

    if (!data.date) {
        return {
            success: false,
            message: translate(
                language,
                "What is the new appointment date?",
                "नई अपॉइंटमेंट की तारीख़ क्या है?",
                "ಹೊಸ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ ಯಾವುದು?"
            )
        };
    }

    if (!data.time) {
        return {
            success: false,
            message: translate(
                language,
                "What new time would you like?",
                "आप कौन सा नया समय चाहते हैं?",
                "ನೀವು ಯಾವ ಹೊಸ ಸಮಯವನ್ನು ಬಯಸುತ್ತೀರಿ?"
            )
        };
    }

    const appointmentDate = parseAppointmentDate(data.date);

    if (!appointmentDate) {
        return {
            success: false,
            message: translate(
                language,
                "Invalid appointment date.",
                "अमान्य अपॉइंटमेंट तिथि।",
                "ಅಮಾನ್ಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ."
            )
        };
    }

    const doctor = await findDoctor(data.specialty);

    if (!doctor) {
        return {
            success: false,
            message: translate(
                language,
                "Doctor not found.",
                "डॉक्टर नहीं मिला।",
                "ವೈದ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ."
            )
        };
    }

    const appointment = await prisma.appointment.findFirst({
        where: {
            doctorId: doctor.id,
            status: "Booked"
        },
        orderBy: {
            id: "desc"
        }
    });

    if (!appointment) {
        return {
            success: false,
            message: translate(
                language,
                "No active appointment found.",
                "कोई सक्रिय अपॉइंटमेंट नहीं मिली।",
                "ಯಾವುದೇ ಸಕ್ರಿಯ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಂಡುಬಂದಿಲ್ಲ."
            )
        };
    }

    const updated = await prisma.appointment.update({
        where: {
            id: appointment.id
        },
        data: {
            date: appointmentDate,
            time: data.time
        }
    });

    return {
        success: true,
        message: translate(
            language,
            `Appointment rescheduled to ${data.date} at ${data.time}.`,
            `आपकी अपॉइंटमेंट ${data.date} को ${data.time} पर पुनर्निर्धारित कर दी गई है।`,
            `ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ${data.date} ರಂದು ${data.time}ಕ್ಕೆ ಮರುನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`
        ),
        appointment: updated
    };

}
async function getDoctorInfo(data, language = "en-US") {

    // User asked for a specific specialty
    if (data.specialty) {

        const doctor = await findDoctor(data.specialty);

        if (!doctor) {
            return {
                success: false,
                message: translate(
                    language,
                    "No doctor found for this specialty.",
                    "इस विशेषज्ञता के लिए कोई डॉक्टर नहीं मिला।",
                    "ಈ ತಜ್ಞತೆಗೆ ಯಾವುದೇ ವೈದ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ."
                )
            };
        }

        return {
            success: true,
            message: translate(
                language,
                `${doctor.name} is our ${doctor.specialty} specialist.`,
                `${doctor.name} हमारे ${doctor.specialty} विशेषज्ञ हैं।`,
                `${doctor.name} ನಮ್ಮ ${doctor.specialty} ತಜ್ಞರು.`
            )
        };

    }

    // User asked for all doctors
    const doctors = await prisma.doctor.findMany();

    if (doctors.length === 0) {
        return {
            success: false,
            message: translate(
                language,
                "No doctors are available.",
                "कोई डॉक्टर उपलब्ध नहीं हैं।",
                "ಯಾವುದೇ ವೈದ್ಯರು ಲಭ್ಯವಿಲ್ಲ."
            )
        };
    }

    let doctorList = "";

    if (language === "hi-IN") {

        doctorList = doctors
            .map(doc => `${doc.name} - ${doc.specialty}`)
            .join("\n");

        return {
            success: true,
            message: `उपलब्ध डॉक्टर:\n\n${doctorList}`
        };

    }

    if (language === "kn-IN") {

        doctorList = doctors
            .map(doc => `${doc.name} - ${doc.specialty}`)
            .join("\n");

        return {
            success: true,
            message: `ಲಭ್ಯವಿರುವ ವೈದ್ಯರು:\n\n${doctorList}`
        };

    }

    doctorList = doctors
        .map(doc => `${doc.name} - ${doc.specialty}`)
        .join("\n");

    return {
        success: true,
        message: `Available Doctors:\n\n${doctorList}`
    };

}

async function getClinicTimings(language = "en-US") {

    return {

        success: true,

        message: translate(

            language,

            `Our clinic is open:

Monday - Saturday
9:00 AM - 6:00 PM

Sunday: Closed`,

            `हमारा क्लिनिक खुला रहता है:

सोमवार - शनिवार
सुबह 9:00 बजे - शाम 6:00 बजे

रविवार: बंद`,

            `ನಮ್ಮ ಕ್ಲಿನಿಕ್ ತೆರೆದಿರುವ ಸಮಯ:

ಸೋಮವಾರ - ಶನಿವಾರ
ಬೆಳಿಗ್ಗೆ 9:00 ರಿಂದ ಸಂಜೆ 6:00

ಭಾನುವಾರ: ಮುಚ್ಚಲಾಗಿದೆ`

        )

    };

}

module.exports = {
    bookAppointment,
    checkAvailability,
    cancelAppointment,
    rescheduleAppointment,
    getDoctorInfo,
    getClinicTimings
};