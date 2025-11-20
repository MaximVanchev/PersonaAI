import { ConversationDto } from "@/types/index.type";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

function apiUrl(path: string) {
  return baseUrl ? `${baseUrl}${path}` : path; // fallback to relative path
}

export async function getConversationsByPersonaId(
  personaId: number
): Promise<ConversationDto[] | null> {
  const res = await fetch(
    apiUrl(`/api/conversation/personaConversations/${personaId}`),
    { method: "GET" }
  );
  if (!res.ok) {
    // Attempt to parse JSON error; if HTML, throw generic
    let message = `Failed to fetch conversations (status ${res.status})`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }
  const data = (await res.json()) as ConversationDto[];
  return data
    .map((c) => ({ ...c }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createConversation(
  personaId: number,
  title?: string
): Promise<ConversationDto | null> {
  const res = await fetch(`/api/conversation/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personaId, title }),
  });
  if (!res.ok) {
    let message = `Failed to create conversation (status ${res.status})`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }
  return (await res.json()) as ConversationDto;
}

export async function deleteConversation(id: number): Promise<boolean> {
  const res = await fetch(`/api/conversation/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let message = `Failed to delete conversation (status ${res.status})`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }
  return true;
}
