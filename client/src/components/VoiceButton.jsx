import { useEffect, useState } from "react";

function VoiceButton({
    onTranscript,
    language,
    voiceMode,
    setVoiceMode
}) {

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

            // Continue listening only while voice mode is active
            if (voiceMode && !speechSynthesis.speaking) {

                setTimeout(() => {

                    try {

                        recognition.start();

                    } catch {}

                }, 500);

            }

        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognition.onresult = (event) => {

            const transcript = event.results[0][0].transcript;

            onTranscript(transcript);

        };

        window.recognition = recognition;

    }, [language, onTranscript, voiceMode]);

    const startCall = () => {

        if (!window.recognition) {

            alert("Speech Recognition not supported.");

            return;

        }

        speechSynthesis.cancel();

        setVoiceMode(true);

        window.recognition.start();

    };

    const stopCall = () => {

        setVoiceMode(false);

        speechSynthesis.cancel();

        if (window.recognition) {

            window.recognition.stop();

        }

        setListening(false);

    };

    return (

        <div>

            {
                voiceMode ?

                    <button
                        className={`voice-btn ${listening ? "listening" : ""}`}
                        onClick={stopCall}
                    >
                        {listening ? "🎤 Listening... (End Call)" : "🛑 End Call"}
                    </button>

                    :

                    <button
                        className="voice-btn"
                        onClick={startCall}
                    >
                        📞 Start Voice Call
                    </button>

            }

        </div>

    );

}

export default VoiceButton;