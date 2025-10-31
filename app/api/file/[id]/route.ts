import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";


export async function DELETE(req: Request, { params }: { params: { id: string } }) {

  if (!req) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: HTTP_STATUS_CODES.BAD_REQUEST }
    );
  }

  try {
    const tmp = await params;
    const fileId = Number(tmp.id);

    if (!fileId) {
      return NextResponse.json(
        { message: "File ID is required" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const file = await prisma.file.findUnique({
      where: {
        id: Number(fileId),
      },
    });

    if (!file) {
      return NextResponse.json(
        { message: "File not found" },
        { status: HTTP_STATUS_CODES.NOT_FOUND }
      );
    }

    await prisma.file.delete({
      where: {
        id: Number(fileId),
      },
    });

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: HTTP_STATUS_CODES.OK }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}