import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function VoiceButton({

onTranscript,

language,

callActive,

voiceState,

setVoiceState,

sttProvider

}) {
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
const audioChunksRef = useRef([]);
const streamRef = useRef(null);

  const [listening, setListening] = useState(false);

  useEffect(() => {
    if(sttProvider!=="browser"){

console.log(`${sttProvider} selected`);

}
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language || "en-US";

    recognition.onstart = () => {
      setListening(true);
      setVoiceState("listening");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setVoiceState("processing");

      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.log("Speech Error:", event.error);

      setListening(false);

      if (!callActive) return;

      setTimeout(() => {
        try {
          recognition.start();
        } catch {}
      }, 1000);
    };

    recognition.onend = () => {
      setListening(false);

      if (!callActive) return;

      // Don't restart while AI is speaking
      if (speechSynthesis.speaking) return;

      setTimeout(() => {
        try {
          recognition.start();
        } catch {}
      }, 400);
    };

    recognitionRef.current = recognition;
    window.recognition = recognition;

    return () => {
      recognition.stop();
    };
  }, [language]);

  // Auto start when user presses Start Call
  useEffect(() => {

  if (!callActive) return;

  if (sttProvider === "deepgram") {

    startDeepgramRecording();

    return;

  }

  if (!recognitionRef.current) return;

  setTimeout(() => {

    try {

      recognitionRef.current.start();

    } catch {}

  }, 300);

}, [callActive]);

  // Stop recognition when call ends
  useEffect(() => {
    if (callActive) return;

    try {
      recognitionRef.current?.stop();
    } catch {}

    speechSynthesis.cancel();

    setListening(false);
    setVoiceState("idle");
  }, [callActive]);
  console.log("Deepgram restarted", callActive);
  const startDeepgramRecording = async () => {
  if (!callActive) return;

if (mediaRecorderRef.current?.state === "recording") {
  return;
}
  try {

    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    

    const recorder = new MediaRecorder(streamRef.current);

    mediaRecorderRef.current = recorder;

    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    recorder.onstart = () => {
      setListening(true);
      setVoiceState("listening");
    };

    recorder.onstop = async () => {

      setListening(false);

      setVoiceState("processing");
      

      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];

      const formData = new FormData();

      formData.append("audio", blob, "voice.webm");

      try {

        const res = await api.post(
          "/ai/transcribe",
          formData
        );

        onTranscript(res.data.transcript);

      } catch (err) {

        console.error(err);

        setVoiceState("idle");

      }
       streamRef.current
        ?.getTracks()
        .forEach(track => track.stop());

    };

    recorder.start();

    setTimeout(() => {

      recorder.stop();

    }, 5000);

  } catch (err) {

    console.error(err);

  }

};
useEffect(() => {

  window.startDeepgramRecording = startDeepgramRecording;

  return () => {
    delete window.startDeepgramRecording;
  };

}, [callActive, sttProvider]);
  const interruptAI = () => {
    // Stop AI speaking immediately
    speechSynthesis.cancel();

    try {
      recognitionRef.current.start();
    } catch {}
  };

  return (
    <div style={{ marginTop: "15px" }}>
      {callActive && (
        <button
          className={`voice-btn ${listening ? "listening" : ""}`}
          onClick={interruptAI}
        >
          {voiceState === "listening" && "🎤 Listening..."}
          {voiceState === "processing" && "🧠 Processing..."}
          {voiceState === "speaking" && "🔊 Speaking... (Tap to interrupt)"}
          {voiceState === "idle" && "🎤 Ready"}
        </button>
      )}
    </div>
  );
}

export default VoiceButton;