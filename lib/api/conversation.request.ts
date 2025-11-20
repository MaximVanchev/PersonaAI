import { ConversationDto } from "@/types/index.type";

export async function getConversationsByPersonaId(
  id: number
): Promise<ConversationDto[] | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(
    `${baseUrl}/api/conversation/personaConversations/${id}`,
    {
      method: "GET",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch persona by ID");
  }

  return data as ConversationDto[];
}
