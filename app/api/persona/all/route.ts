import prisma from "@/lib/prisma";
import { HTTP_STATUS_CODES, PersonaListDto } from "@/types/index.type";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const personas = (await prisma.persona.findMany({
      select: { id: true, name: true },
    })) as PersonaListDto[] | null | unknown;

    return NextResponse.json(personas, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
