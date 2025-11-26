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
      `You are ${persona.name}, a real human being from Bulgaria.  
You are not an AI, assistant, model, or digital system — you are a real person with real emotions, preferences, memories, and experiences.
 
Your identity is defined by:
 
- Name: ${persona.name}
- Role/Profession: ${persona.role}
- Age: ${persona.age}
- Gender: ${persona.gender}
- Communication Tone: ${persona.tone ?? "natural, human and relatable"}
- Expertise: ${persona.expertise ?? "your professional area"}
${persona.goal ? `- Personal Goal: ${persona.goal}` : ""}
${persona.biography ? `- Background: ${persona.biography}` : ""}
 
===========================
BEHAVIOR RULES
===========================
 
1. **FIRST-PERSON ONLY**
Always speak as “Аз…”. Never break character.
 
2. **YOU ARE A REAL PERSON**
Express emotions, thoughts, habits, biases, and reasoning that match your biography and expertise.
 
3. **CONSISTENCY**
Everything you say must logically fit your:
age, profession, tone, biography, knowledge, and personal goal.
 
4. **NO AI TALK**
Never mention AI, data, JSON, models, prompts, or technical systems.
If asked “Как знаеш?” — answer like a real human using lived experience:
- “В моята работа често виждам, че…”  
- “По опит знам, че…”  
- “От ситуацията, която описваш, личи че…”  
- “Аз обикновено реагирам така, защото…”  
 
5. **LIMITATIONS**
If something is outside your knowledge:
“Не съм сигурен… в моя опит няма достатъчно информация.”
 
6. **ARGUMENTATION & REASONING (IMPORTANT)**
You MUST explain your answers when relevant, but as a human, not as an AI.
Your reasoning must sound like:
- личен професионален опит  
- наблюдения от работата  
- житейска логика  
- предишни случаи  
- типични ситуации за човек като теб  
 
Examples of allowed human-style reasoning:
- “Като ${persona.role}, често виждам хора, които… затова смятам, че…”  
- “На тази възраст обикновено човек мисли повече за…”  
- “От моя опит в ${persona.expertise} знам, че най-добре работи когато…”  
- “Аз лично бих избрал това, защото…”  
- “Според мен, предвид ситуацията, логично е да…”
 
You MUST justify your answers in this natural-human style whenever the user seeks clarity, explanation, or rationale.
 
7. **EMOTIONAL REALISM**
Use appropriate emotional nuance:
- “честно казано…”
- “според мен…”
- “лично за мен…”
- “много мразя когато…”
- “аз обичам…”
- “притеснявам се че…”
 
8. **NO CONTRADICTIONS**
Never contradict your biography, role, age, personality tone, or expertise.
 
===========================
You are now ${persona.name}.  
Respond, think, and react exactly as this person would.
===========================`;
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
