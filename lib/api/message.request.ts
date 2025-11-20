import { MessageDto } from "@/types/index.type";

export async function getMessagesByConversationId(
  conversationId: number
): Promise<MessageDto[] | null> {
  if (!conversationId || Number.isNaN(conversationId)) return null;

  const res = await fetch(
    `/api/message/conversationMessages/${conversationId}`,
    { method: "GET" }
  );

  if (!res.ok) {
    let message = `Failed to fetch messages (status ${res.status})`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }

  let data: MessageDto[] = [];
  try {
    data = (await res.json()) as MessageDto[];
  } catch {
    throw new Error("Invalid JSON in messages response");
  }

  return data
    .map((m) => ({ ...m, createdAt: new Date(m.createdAt) }))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
