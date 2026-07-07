const prisma = require("../lib/prisma");

async function bookAppointment(data) {

    // Convert the incoming date
    const appointmentDate = new Date(data.date);

    // Check if the date is valid
    if (isNaN(appointmentDate.getTime())) {
        return {
            success: false,
            message: "Invalid appointment date."
        };
    }

    // Find doctor
    const doctor = await prisma.doctor.findFirst({
        where: {
            specialty: {
                equals: data.specialty,
                mode: "insensitive"
            }
        }
    });

    if (!doctor) {
        return {
            success: false,
            message: "No doctor available for this specialty."
        };
    }

    // Check if slot already exists
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
            message: "Selected slot is already booked."
        };
    }

    // Create appointment
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
        message: `Appointment booked with ${doctor.name} at ${data.time}`,
        appointment
    };
}
async function checkAvailability(data) {

    const appointmentDate = new Date(data.date);

    if (isNaN(appointmentDate.getTime())) {
        return {
            success: false,
            message: "Invalid appointment date."
        };
    }

    const doctor = await prisma.doctor.findFirst({
        where: {
            specialty: {
                equals: data.specialty,
                mode: "insensitive"
            }
        }
    });

    if (!doctor) {
        return {
            success: false,
            message: "Doctor not found."
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
            message: `${doctor.name} is NOT available at ${data.time}.`
        };
    }

    return {
        success: true,
        message: `${doctor.name} is available at ${data.time}.`
    };
}
async function cancelAppointment(data) {

    const appointmentDate = new Date(data.date);

    if (isNaN(appointmentDate.getTime())) {
        return {
            success: false,
            message: "Invalid appointment date."
        };
    }

    const doctor = await prisma.doctor.findFirst({
        where: {
            specialty: {
                equals: data.specialty,
                mode: "insensitive"
            }
        }
    });

    if (!doctor) {
        return {
            success: false,
            message: "Doctor not found."
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
            message: "No booked appointment found."
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
        message: "Appointment cancelled successfully."
    };
}
async function rescheduleAppointment(data) {

    const appointmentDate = new Date(data.date);

    if (isNaN(appointmentDate.getTime())) {
        return {
            success: false,
            message: "Invalid appointment date."
        };
    }

    const doctor = await prisma.doctor.findFirst({
        where: {
            specialty: {
                equals: data.specialty,
                mode: "insensitive"
            }
        }
    });

    if (!doctor) {
        return {
            success: false,
            message: "Doctor not found."
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
            message: "No active appointment found."
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
        message: `Appointment rescheduled to ${data.date} at ${data.time}`,
        appointment: updated
    };
}
module.exports = {
    bookAppointment,
    checkAvailability,
    cancelAppointment,
    rescheduleAppointment
};