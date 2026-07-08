import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-powered-voice-medical-appointment-5qhz.onrender.com",
});

export default api;