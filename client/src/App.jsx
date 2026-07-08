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
  
  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);

    try {
setLoading(true);
  const res = await api.post("/ai", {
    message: input,language
  });

  const aiMsg = {
    sender: "ai",
    text: res.data.message || JSON.stringify(res.data)
  };

  setMessages(prev => [...prev, aiMsg]);

  // 🔊 Speak AI response
  const aiResponse = res.data.message;
  const utterance = new SpeechSynthesisUtterance(aiResponse);
  utterance.lang = language;
  speechSynthesis.speak(utterance);

} catch (err) {
setLoading(false);
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
      message: transcript,language
    });

    const aiMsg = {
      sender: "ai",
      text: res.data.message || JSON.stringify(res.data)
    };

    setMessages(prev => [...prev, aiMsg]);

    const utterance = new SpeechSynthesisUtterance(res.data.message);
    utterance.lang = language;
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
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Ask something..."
        />

       <button
    className="send-btn"
    onClick={sendMessage}
>
        </button>

      </div>

      <VoiceButton
    onTranscript={handleVoiceInput}
    language={language}
/>

    </div>

  );

}

export default App;