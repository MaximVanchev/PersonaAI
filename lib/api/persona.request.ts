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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const safeBase = baseUrl && baseUrl.length > 0 ? baseUrl : "";

  const res = await fetch(`${safeBase}/api/persona/all`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch personas");
  }

  return data as PersonaListDto[];
}

export async function getPersonaById(
  id: number
): Promise<PersonaChatDto | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const safeBase = baseUrl && baseUrl.length > 0 ? baseUrl : "";

  const res = await fetch(`${safeBase}/api/persona/${id}`, {
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`/api/persona/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete persona by ID");
  }

  return data as PersonaChatDto;
}
