import { useState } from "react";
import ChatMessage from "../ChatBot/ChatMessage";
import { sendChatMessage } from "../../Api/aiChat";

interface Props {
  onClose: () => void;
}

type ChatSender = "bot" | "user";

interface ChatMessageType {
  sender: ChatSender;
  text: string;
}

const SUGGESTIONS = [
  "Recommend a book",
  "Find a book",
  "Reading tips",
];

export default function ChatbotWindow({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      sender: "bot",
      text: "Hello! 👋 I’m Bookmate AI. How can I assist you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text?: string) {
    const userMessage = text ?? input;
    if (!userMessage.trim() || loading) return;

    // 1️⃣ Show user message immediately
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      // 2️⃣ Call backend AI API
      const reply = await sendChatMessage(userMessage);

      // 3️⃣ Show AI response
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply },
      ]);
    } catch (error) {
      // 4️⃣ Graceful fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, I couldn’t respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-window">
      {/* HEADER */}
      <div className="chatbot-header">
        <div className="bot-info">
          <span className="bot-avatar">🤖</span>
          <span className="bot-name">Bookmate AI Assistant</span>
        </div>
        <button onClick={onClose}>✖</button>
      </div>

      {/* MESSAGES */}
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} sender={msg.sender} text={msg.text} />
        ))}

        {loading && (
          <div className="chat-message bot">Typing…</div>
        )}
      </div>

      {/* SUGGESTIONS */}
      {!loading && (
        <div className="chatbot-suggestions">
          <span className="suggestion-title">Suggestions:</span>
          <div className="suggestion-buttons">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div className="chatbot-input">
        <input
          placeholder="Type your message..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
