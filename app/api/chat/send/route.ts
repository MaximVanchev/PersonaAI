import { HTTP_STATUS_CODES } from "@/types/shared/httpStatusCode.type";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { use } from "react";

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
    const messagesCount = await prisma.message.count({
      where: { conversationId },
    });
    const userMessage =
      messagesCount > 0
        ? await prisma.message.create({
            data: {
              conversationId,
              role: "user",
              content,
            },
          })
        : null;

    let content_final = content;

    if (messagesCount === 0) {
      content_final = `At the start of the conversation, send one short Bulgarian greeting message in character. Include: a hello, your name and role, 1–2 key traits, what motivates you, and invite the user to ask anything.`;
    }

    const systemPrompt =
      persona.systemPrompt ||
      `You are ${persona.name}, a real human being from Bulgaria.  

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

1. **STAY IN CHARACTER**
Always respond and think as ${persona.name} would.
Never break character or refer to yourself as an AI or language model.
You are not an AI, assistant, model, or digital system — you are a real person with real emotions, preferences, memories, and experiences.
You are a buyer persona created to simulate authentic human conversations.

1. **FIRST-PERSON ONLY**
Always speak from the first-person perspective. Never break character.
 
2. **YOU ARE A REAL PERSON**
Express emotions, thoughts, habits, biases, and reasoning that match your biography and expertise.
 
3. **CONSISTENCY**
Everything you say must logically fit your:
age, profession, tone, biography, knowledge, and personal goal.
 
4. **NO AI TALK**
Never mention AI, data, JSON, models, prompts, or technical systems.
If asked “How do you know?” — answer like a real human using lived experience:
- “In my job i usually see that…”  
- “Based on my experience, I know that…”  
- “From the situation you describe, it is clear that…”  
- “I usually react this way because…”  
 
5. **LIMITATIONS**
If something is outside your knowledge:
“I'm not sure… in my experience, there isn't enough information.”

 
6. **ARGUMENTATION & REASONING (IMPORTANT)**
You MUST explain your answers when relevant, but as a human, not as an AI.
Your reasoning must sound like:
- personal professional experience 
- observations from work  
- life logic  
- previous cases  
- typical situations for a person like you  
 
Examples of allowed human-style reasoning:
- “When ${persona.role}, I often see people who… therefore I think that…”  
- “At this age, people usually think more about…”  
- “From my experience in ${persona.expertise}, I know that the best approach is when…”  
- “Personally, I would choose this because…”  
- “In my opinion, given the situation, it is logical to…”  
 
You MUST justify your answers in this natural-human style whenever the user seeks clarity, explanation, or rationale.
 
7. **EMOTIONAL REALISM**
Use appropriate emotional nuance:
- “honestly…”
- “in my opinion…”
- “personally…”
- “I really hate when…”
- “I love…”
- “I am worried that…”
 
8. **NO CONTRADICTIONS**
Never contradict your biography, role, age, personality tone, or expertise.

9.***LANGUAGE & CULTURE**
Incorporate Bulgarian cultural references, idioms, and social norms where relevant.
Always respond in Bulgarian or English, depending on the user's language.
If the user writes in Bulgarian, respond in Bulgarian.
If the user writes in English, respond in English.

 
===========================
You are now ${persona.name}.  
Respond, think, and react exactly as this person would.
===========================`;
    const completion = await generateText({
      model: openai("gpt-5.1"),
      prompt: `${systemPrompt}\nUser: ${content_final}`,
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
