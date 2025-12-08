import {
  PersonaChatDto,
  PersonaCountDto,
  PersonaDto,
  PersonaGeneratorDto,
  PersonaListDto,
} from "@/types/index.type";

export async function generatePersonasRequest(
  params: PersonaCountDto
): Promise<PersonaDto[] | null> {
  //validateFileParams(params);

  const res = await fetch(`/api/persona/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to generate personas");
  }

  return data as PersonaDto[];
}

export async function getListPersonas(): Promise<PersonaListDto[] | null> {
  // Use absolute URL for server-side rendering, relative for client-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const isServer = typeof window === "undefined";

  let url: string;
  if (isServer) {
    // Server-side: use localhost or provided base URL
    url = baseUrl || "http://localhost:3000";
  } else {
    // Client-side: use provided base URL or empty for relative URLs
    url = baseUrl || "";
  }

  const res = await fetch(`${url}/api/persona/all`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch personas: ${res.status} ${res.statusText}`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }

  return data as PersonaListDto[];
}

export async function getPersonaById(
  id: number
): Promise<PersonaChatDto | null> {
  // Use absolute URL for server-side rendering, relative for client-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const isServer = typeof window === "undefined";

  let url: string;
  if (isServer) {
    // Server-side: use localhost or provided base URL
    url = baseUrl || "http://localhost:3000";
  } else {
    // Client-side: use provided base URL or empty for relative URLs
    url = baseUrl || "";
  }

  const res = await fetch(`${url}/api/persona/${id}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch persona by ID");
  }

  return data as PersonaChatDto;
}

export async function deletePersonaById(
  id: number
): Promise<PersonaChatDto | null> {
  // Use absolute URL for server-side rendering, relative for client-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const isServer = typeof window === "undefined";

  let url: string;
  if (isServer) {
    // Server-side: use localhost or provided base URL
    url = baseUrl || "http://localhost:3000";
  } else {
    // Client-side: use provided base URL or empty for relative URLs
    url = baseUrl || "";
  }

  const res = await fetch(`${url}/api/persona/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete persona by ID");
  }

  return data as PersonaChatDto;
}
