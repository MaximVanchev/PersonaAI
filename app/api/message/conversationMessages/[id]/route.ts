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
    const conversationId = Number(tmp.id);

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation ID is required" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: Number(conversationId),
      },
    });

    if (!messages) {
      return NextResponse.json(
        { message: "Messages not found" },
        { status: HTTP_STATUS_CODES.NOT_FOUND }
      );
    }

    return NextResponse.json(messages, { status: HTTP_STATUS_CODES.OK });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
