import { useState } from "react";
import api from "./services/api";
import ChatBox from "./components/ChatBox";
import VoiceButton from "./components/VoiceButton";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const [language, setLanguage] = useState("en-US");
  const [sttProvider, setSttProvider] = useState("browser");
  const [llmProvider, setLlmProvider] = useState("gemini");

  // NEW
  const [callActive, setCallActive] = useState(false);
  const [voiceState, setVoiceState] = useState("idle");
  

  // NEW
const speakResponse = (text) => {

  if (!text) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = language;

  setVoiceState("speaking");

  utterance.onend = () => {

    if (!callActive) {

      setVoiceState("idle");
      return;

    }

    setVoiceState("listening");

    // Browser STT
    if (sttProvider === "browser") {

      if (window.recognition) {

        try {
          window.recognition.start();
        } catch {}

      }

    }

    // Deepgram STT
    else {

     console.log("Calling Deepgram again...", window.startDeepgramRecording);

if (window.startDeepgramRecording) {
  window.startDeepgramRecording();
}

    }

  };

  speechSynthesis.speak(utterance);

};

  const sendMessage = async () => {

    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: input
      }
    ]);

    setLoading(true);

    try {

      const res = await api.post("/ai", {
        message: input,
        language,
        llm:llmProvider
      });

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: res.data.message
        }
      ]);

      speakResponse(res.data.message);

    } catch {

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ AI service has reached its free daily limit. Please try again later"
        }
      ]);

    }

    setLoading(false);
    setInput("");

  };

  const handleVoiceInput = async (transcript) => {

    setInput(transcript);

    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: transcript
      }
    ]);

    setLoading(true);

    try {

      setVoiceState("processing");

      const res = await api.post("/ai", {
        message: transcript,
        language,
        llm:llmProvider
      });

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: res.data.message
        }
      ]);

      speakResponse(res.data.message);

    } catch {

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ AI service has reached its free daily limit. Please try again later"
        }
      ]);

      setVoiceState("idle");

    }

    setLoading(false);
    setInput("");

  };

  return (

    <div className="container">

      <div className="header">

        <h1>🏥 AI Medical Assistant</h1>

       <div className="controls">

  <div className="control-group">

    <label>🌐 Language</label>

    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      <option value="en-US">English</option>
      <option value="hi-IN">Hindi</option>
      <option value="kn-IN">Kannada</option>
    </select>

  </div>

  <div className="control-group">

    <label>🎤 STT</label>

    <select
      value={sttProvider}
      onChange={(e) => setSttProvider(e.target.value)}
    >
      <option value="browser">Browser STT</option>
      <option value="deepgram">Deepgram</option>
  
    </select>

  </div>

  <div className="control-group">

    <label>🧠 LLM</label>

    <select
      value={llmProvider}
      onChange={(e) => setLlmProvider(e.target.value)}
    >
      <option value="gemini">Gemini 2.5 Flash</option>
      <option value="gpt">GPT-4o Mini</option>
      <option value="claude">Claude Sonnet</option>
    </select>

  </div>

</div>

      </div>

      {callActive && (

        <div className="voice-status">

          {voiceState === "listening" && "🎤 Listening..."}

          {voiceState === "processing" && "🧠 Processing..."}

          {voiceState === "speaking" && "🔊 Speaking..."}

        </div>

      )}

      <ChatBox
        messages={messages}
        loading={loading}
      />

      <div className="input-area">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button
          className="send-btn"
          onClick={sendMessage}
        >
          Send
        </button>

      </div>

      <div className="call-controls">

        {!callActive ? (

          <button
            className="call-btn start"
            onClick={() => setCallActive(true)}
          >
            📞 Start Call
          </button>

        ) : (

          <button
            className="call-btn end"
            onClick={() => {

              setCallActive(false);

              setVoiceState("idle");

              speechSynthesis.cancel();

              if (window.recognition) {

                window.recognition.stop();

              }

            }}
          >
            ❌ End Call
          </button>

        )}

      </div>

      <VoiceButton
        onTranscript={handleVoiceInput}
        language={language}
        callActive={callActive}
        voiceState={voiceState}
        setVoiceState={setVoiceState}
        sttProvider={sttProvider}
        llmProvider={llmProvider}
      />

    </div>

  );

}

export default App;