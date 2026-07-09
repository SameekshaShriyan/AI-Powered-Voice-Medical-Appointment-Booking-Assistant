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
  const [voiceMode, setVoiceMode] = useState(false);

  const speakResponse = (text) => {

    if (!text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = language;

    utterance.onend = () => {

      if (voiceMode && window.recognition) {

        try {
          window.recognition.start();
        } catch {}

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
        language
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
          text: "Server Error"
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

      const res = await api.post("/ai", {
        message: transcript,
        language
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
          text: "Server Error"
        }
      ]);

    }

    setLoading(false);
    setInput("");

  };

  return (

    <div className="container">

      <div className="header">

        <h1>🏥 AI Medical Assistant</h1>

        <div className="language-selector">

          <label>🌐</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="kn-IN">Kannada</option>
          </select>

        </div>

      </div>

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

      <VoiceButton
        onTranscript={handleVoiceInput}
        language={language}
        voiceMode={voiceMode}
        setVoiceMode={setVoiceMode}
      />

    </div>

  );

}

export default App;