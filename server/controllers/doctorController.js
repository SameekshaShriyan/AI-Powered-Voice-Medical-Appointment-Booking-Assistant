const prisma = require("../lib/prisma");

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to fetch doctors",
    });
  }
};