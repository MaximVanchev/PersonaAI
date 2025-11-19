import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!req) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: HTTP_STATUS_CODES.BAD_REQUEST }
    );
  }

  try {
    const tmp = await params;
    const personaId = Number(tmp.id);

    if (!personaId) {
      return NextResponse.json(
        { message: "Persona ID is required" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const persona = await prisma.persona.findUnique({
      where: {
        id: Number(personaId),
      },
    });

    if (!persona) {
      return NextResponse.json(
        { message: "Persona not found" },
        { status: HTTP_STATUS_CODES.NOT_FOUND }
      );
    }

    return NextResponse.json(persona, { status: HTTP_STATUS_CODES.OK });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
