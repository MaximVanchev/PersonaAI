import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req: Request) {
    try {
    const filesNames = await prisma.file.findMany({ select: { id: true, fileName: true },
    });

    return NextResponse.json({ filesNames }, { status: HTTP_STATUS_CODES.OK });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}