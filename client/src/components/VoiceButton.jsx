import { useEffect } from "react";

function VoiceButton({ onTranscript }) {

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        window.recognition = recognition;

    }, []);

    const startListening = () => {

        if (!window.recognition) {

            alert("Speech Recognition not supported.");

            return;
        }

        window.recognition.start();

        window.recognition.onresult = (event) => {

            const transcript =
                event.results[0][0].transcript;

            onTranscript(transcript);

        };

    };

    return (

        <button
            className="voice-btn"
            onClick={startListening}
        >
            🎤 Start Speaking
        </button>

    );

}

export default VoiceButton;