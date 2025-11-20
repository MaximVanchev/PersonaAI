import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personaId, title } = body as { personaId?: number; title?: string };

    if (!personaId) {
      return NextResponse.json(
        { message: "personaId is required" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        personaId,
        title: title || null,
      },
    });

    return NextResponse.json(conversation, {
      status: HTTP_STATUS_CODES.CREATED,
    });
  } catch (error) {
    console.error("Error creating conversation", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
