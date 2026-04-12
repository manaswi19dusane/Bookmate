import { aiApi } from "../services/api";

export async function sendChatMessage(message: string): Promise<string> {
  const data = await aiApi.send(message);
  return data.reply;
}
