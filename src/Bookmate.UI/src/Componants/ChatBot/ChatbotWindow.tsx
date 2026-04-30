import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../../Api/aiChat";
import ChatMessage from "../ChatBot/ChatMessage";

interface Props {
  onClose: () => void;
}

type ChatSender = "bot" | "user";

interface ChatMessageType {
  sender: ChatSender;
  text: string;
}

const SUGGESTIONS = [
  "Recommend 3 motivational books",
  "How do I lend a book?",
  "How do I scan an ISBN barcode?",
];

export default function ChatbotWindow({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      sender: "bot",
      text: "Hello. I am Bookmate AI. Ask for book recommendations, app guidance, lending help, or scanning support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) {
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(userMessage);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I could not respond right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <div className="bot-info">
          <span className="bot-avatar">AI</span>
          <span className="bot-name">Bookmate AI Assistant</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close AI assistant">
          Close
        </button>
      </div>

      <div className="chatbot-messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <ChatMessage key={`${message.sender}-${index}`} sender={message.sender} text={message.text} />
        ))}
        {loading ? <div className="chat-message bot">Thinking...</div> : null}
      </div>

      {!loading ? (
        <div className="chatbot-suggestions">
          <span className="suggestion-title">Quick prompts</span>
          <div className="suggestion-buttons">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="chatbot-input">
        <input
          placeholder="Ask for a recommendation or feature walkthrough..."
          value={input}
          disabled={loading}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void sendMessage();
            }
          }}
        />
        <button type="button" onClick={() => sendMessage()} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
