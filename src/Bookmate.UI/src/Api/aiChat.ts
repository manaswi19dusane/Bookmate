export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch("http://127.0.0.1:8000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data.reply;
}
