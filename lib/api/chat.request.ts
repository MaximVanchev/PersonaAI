import { MessageDto } from "@/types/index.type";

export async function sendChatMessage(
  personaId: number,
  conversationId: number,
  content: string
): Promise<MessageDto[] | null> {
  const res = await fetch(`/api/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personaId, conversationId, content }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send chat message");
  }
  return data.messages as MessageDto[];
}
