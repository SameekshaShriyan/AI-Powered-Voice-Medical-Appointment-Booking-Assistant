const express = require("express");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config();

const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const livekitRoutes = require("./routes/livekitRoutes");

const setupSocketServer = require("./websocket/socketServer");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/livekit", livekitRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI Medical Appointment Assistant Backend Running 🚀"
    });
});

const server = http.createServer(app);

// Start websocket server
setupSocketServer(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});