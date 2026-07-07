const prisma = require("../lib/prisma");

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { patient, doctorId, date, time } = req.body;

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Check if slot already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        time,
        status: "Booked",
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient,
        doctorId,
        date: new Date(date),
        time,
      },
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};