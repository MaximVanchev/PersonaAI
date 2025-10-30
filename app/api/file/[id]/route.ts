import { convertFileToJSON } from "@/lib/services/fileConverter";
import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    if (!req) {
        return NextResponse.json(
            { message: "Invalid request" },
            { status: HTTP_STATUS_CODES.BAD_REQUEST }
        );
    }

    try {
    const body = (await req.json()) as File;

    const convertedFile = convertFileToJSON(body);

    const file = await prisma.file.create({
      data: {
        fileName: convertedFile?.name || "Unnamed",
        content: convertedFile?.content || {},
      },
    });

    return NextResponse.json(
      { message: "File created successfully", file },
      { status: HTTP_STATUS_CODES.CREATED }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}

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