import { useState } from "react";
import api from "./services/api";
import ChatBox from "./components/ChatBox";
import VoiceButton from "./components/VoiceButton";
import "./App.css";

function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);

    try {

  const res = await api.post("/ai", {
    message: input
  });

  const aiMsg = {
    sender: "ai",
    text: res.data.message || JSON.stringify(res.data)
  };

  setMessages(prev => [...prev, aiMsg]);

  // 🔊 Speak AI response
  const aiResponse = res.data.message;
  const utterance = new SpeechSynthesisUtterance(aiResponse);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);

} catch (err) {

  setMessages(prev => [...prev, {
    sender: "ai",
    text: "Server Error"
  }]);

}

    setInput("");

  };
const handleVoiceInput = async (transcript) => {

  setInput(transcript);

  const userMsg = {
    sender: "user",
    text: transcript
  };

  setMessages(prev => [...prev, userMsg]);

  try {

    const res = await api.post("/ai", {
      message: transcript
    });

    const aiMsg = {
      sender: "ai",
      text: res.data.message || JSON.stringify(res.data)
    };

    setMessages(prev => [...prev, aiMsg]);

    const utterance = new SpeechSynthesisUtterance(res.data.message);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);

  } catch (err) {

    setMessages(prev => [...prev, {
      sender: "ai",
      text: "Server Error"
    }]);

  }

  setInput("");

};
  return (

    <div className="container">

      <h1>🏥 AI Medical Assistant</h1>

      <ChatBox messages={messages} />

      <div className="input-area">

        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Ask something..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

      <VoiceButton onTranscript={handleVoiceInput} />

    </div>

  );

}

export default App;