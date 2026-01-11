interface Props {
  onClick: () => void;
}

export default function ChatbotButton({ onClick }: Props) {
  return (
    <button className="chatbot-button" onClick={onClick}>
      💬
    </button>
  );
}
