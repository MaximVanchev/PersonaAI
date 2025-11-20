import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = Number(id);
    if (!conversationId) {
      return NextResponse.json(
        { message: "Invalid conversation id" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    // Delete messages first (no cascade defined)
    await prisma.message.deleteMany({ where: { conversationId } });

    const deleted = await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json(deleted, { status: HTTP_STATUS_CODES.OK });
  } catch (error) {
    console.error("Error deleting conversation", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
