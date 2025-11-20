import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personaId, conversationId, content } = body as {
      personaId?: number;
      conversationId?: number;
      content?: string;
    };

    if (!personaId || !conversationId || !content) {
      return NextResponse.json(
        { message: "personaId, conversationId and content are required" },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });
    if (!persona) {
      return NextResponse.json(
        { message: "Persona not found" },
        { status: HTTP_STATUS_CODES.NOT_FOUND }
      );
    }

    // Store user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content,
      },
    });

    const systemPrompt =
      persona.systemPrompt ||
      `You are persona ${persona.name}. Role: ${persona.role}. Tone: ${persona.tone ?? "neutral"}. Expertise: ${persona.expertise ?? "general"}. Goal: ${persona.goal ?? ""}. Biography: ${persona.biography ?? ""}. Respond in a way consistent with tone and expertise.`;

    const completion = await generateText({
      model: openai("gpt-5.1"),
      prompt: `${systemPrompt}\nUser: ${content}`,
    });

    const assistantContent = completion.text.trim();

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: assistantContent,
      },
    });

    return NextResponse.json(
      { messages: [userMessage, assistantMessage] },
      { status: HTTP_STATUS_CODES.OK }
    );
  } catch (error) {
    console.error("Chat send error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
