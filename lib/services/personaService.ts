"use server";

import {
  PersonaDto,
  PersonaDtoArraySchema,
  PersonaGeneratorDto,
  PersonaResponseSchema,
} from "@/types/index.type";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export async function generatePersonas(
  params: PersonaGeneratorDto
): Promise<PersonaDto[]> {
  console.log("Starting persona generation...");

  try {
    console.log("Calling OpenAI API...");

    const apiPromise = generateObject({
      model: openai("gpt-5.1"),
      schema: PersonaResponseSchema,
      prompt: [
        {
          role: "system",
          content: `You are an expert persona generator. You create detailed and diverse personas based on the provided criteria. Return a JSON object with a "personas" property containing an array of PersonaDto objects.`,
        },
        {
          role: "user",
          content: `Generate a total of ${params.maleCount + params.femaleCount} unique personas. ${params.maleCount} should be male and ${params.femaleCount} should be female. Use the following files as reference material to inform the personas you create: ${params.files.map((f) => f.fileName).join(", ")}. `,
        },
      ],
    });

    const result = await apiPromise;

    console.log("Generated personas successfully:", result.object);
    return result.object.personas;
  } catch (error) {
    console.error("Error generating personas:", error);
    throw error;
  }
}
