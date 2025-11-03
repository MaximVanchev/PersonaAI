import { convertFileToJSON } from "@/lib/services/fileConverter";
import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    if (!req) {
        return NextResponse.json(
            { message: "Invalid request" },
            { status: HTTP_STATUS_CODES.BAD_REQUEST }
        );
    }

    try {
    const form = await req.formData();
    const file = form.get("file");

    const convertedFile = await convertFileToJSON(file);
    console.log(convertedFile);
    const addedFile = await prisma.file.create({
      data: {
        fileName: convertedFile?.name || "Unnamed",
        content: convertedFile?.content || {},
      },
    });

    return NextResponse.json(
      { message: "File created successfully", addedFile },
      { status: HTTP_STATUS_CODES.CREATED }
    );
  } catch(e : any) {
    return NextResponse.json(
      { message: e.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}