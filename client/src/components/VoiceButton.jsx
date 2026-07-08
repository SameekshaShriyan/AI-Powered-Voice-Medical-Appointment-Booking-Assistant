import { useEffect, useState } from "react";

function VoiceButton({ onTranscript, language }) {

    const [listening, setListening] = useState(false);

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language || "en-US";

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognition.onresult = (event) => {

            const transcript = event.results[0][0].transcript;

            onTranscript(transcript);

        };

        window.recognition = recognition;

    }, [language, onTranscript]);

    const startListening = () => {

        if (!window.recognition) {

            alert("Speech Recognition not supported.");

            return;

        }

        window.recognition.start();

    };

    return (

        <button
            className={`voice-btn ${listening ? "listening" : ""}`}
            onClick={startListening}
            disabled={listening}
        >
            {listening ? "🎤 Listening..." : "🎤 Start Speaking"}
        </button>

    );

}

export default VoiceButton;