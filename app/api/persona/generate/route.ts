import {
  HTTP_STATUS_CODES,
  PersonaCountDto,
  PersonaDto,
  PersonaGeneratorDto,
} from "@/types/index.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePersonas } from "@/lib/services/personaService";

export async function POST(req: Request) {
  if (!req) {
    console.error("No request object received");
    return NextResponse.json(
      { message: "Invalid request" },
      { status: HTTP_STATUS_CODES.BAD_REQUEST }
    );
  }

  try {
    const requestData = (await req.json()) as PersonaCountDto;
    console.log("Received request data:", requestData);

    const files = await prisma.file.findMany();
    console.log("Fetched files:", files);

    const data = { files, ...requestData } as PersonaGeneratorDto;
    console.log("Data for persona generation:", data);

    const generatedPersonas = (await generatePersonas(data)) as PersonaDto[];
    console.log("Generated personas:", generatedPersonas);

    const createdPersonas = await prisma.persona.createMany({
      data: generatedPersonas,
    });
    console.log("Created personas in DB:", createdPersonas);

    return NextResponse.json(
      { message: "Personas generated successfully", createdPersonas },
      { status: HTTP_STATUS_CODES.CREATED }
    );
  } catch (e: any) {
    console.error("Error generating personas:", e);
    return NextResponse.json(
      { message: e.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
