import {
  PersonaCountDto,
  PersonaDto,
  PersonaGeneratorDto,
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

export async function getListPersonas(): Promise<PersonaDto[] | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${baseUrl}/api/persona/all`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch personas");
  }

  return data as PersonaDto[];
}
