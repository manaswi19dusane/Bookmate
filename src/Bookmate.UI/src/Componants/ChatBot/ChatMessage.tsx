interface Props {
  sender: "user" | "bot";
  text: string;
}

export default function ChatMessage({ sender, text }: Props) {
  return (
    <div className={`chat-message ${sender}`}>
      {sender === "user" && <strong>You: </strong>}
      {sender === "bot" && <strong>Bookmate: </strong>}
      {text}
    </div>
  );
}