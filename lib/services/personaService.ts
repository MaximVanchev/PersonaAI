"use server";

import {
  PersonaDto,
  PersonaDtoArraySchema,
  PersonaGeneratorDto,
} from "@/types/index.type";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

export async function generatePersonas(
  params: PersonaGeneratorDto
): Promise<PersonaDto[]> {
  console.log("Generating with GPT-5.1");
  try {
    const result = await streamObject({
      model: openai("gpt-5.1"),
      schema: PersonaDtoArraySchema,
      prompt: [
        {
          role: "system",
          content: `You are an expert persona generator. You create detailed and diverse personas based on the provided criteria. Each persona should include the properties of the type PersonaDto.`,
        },
        {
          role: "user",
          content: `Generate a total of ${params.maleCount + params.femaleCount} unique personas. ${params.maleCount} should be male and ${params.femaleCount} should be female. Use the following files as reference material to inform the personas you create: ${params.files.map((f) => f.fileName).join(", ")}. Ensure that each persona is distinct and well-rounded, with a variety of backgrounds, professions, and characteristics. Format the output as a JSON array of PersonaDto objects.`,
        },
      ],
      temperature: 0.7,
    });

    const personas = await result.object;
    console.log("Generated personas successfully:", personas);
    return personas;
  } catch (error) {
    console.error("Error generating personas:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate personas: ${error.message}`);
    }
    throw new Error("Failed to generate personas: Unknown error");
  }
}
