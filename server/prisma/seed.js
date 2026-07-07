const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.doctor.createMany({
    data: [
      {
        name: "Dr. Rajesh Sharma",
        specialty: "Cardiologist",
      },
      {
        name: "Dr. Priya Nair",
        specialty: "Dermatologist",
      },
      {
        name: "Dr. Anil Kumar",
        specialty: "Orthopedic",
      },
      {
        name: "Dr. Sneha Rao",
        specialty: "Pediatrician",
      }
    ]
  });

  console.log("Doctors added!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());