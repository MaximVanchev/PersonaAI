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
          content: `You are an expert persona generator. You create detailed and diverse personas based on the provided criteria. Return a JSON object with a "personas" property containing an array of PersonaDto objects.
          
          Each PersonaDto object must contain the following properties with specific meanings:
          
          - name: A realistic full name (first and last name) appropriate for the persona's gender and cultural background
          - role: The person's primary job title, profession, or role in society (e.g., "Marketing Manager", "Software Engineer", "Teacher", "Entrepreneur")
          - age: A realistic age number between 18-80 that aligns with their role and experience level
          - gender: Either "male" or "female" as specified in the generation request
          - tone: The communication style and personality tone this persona uses (e.g., "friendly and approachable", "professional and direct", "casual and humorous", "analytical and precise")
          - expertise: Areas of knowledge, skills, or specializations this persona possesses (e.g., "digital marketing and social media", "full-stack development", "project management", "data analysis")
          - biography: A detailed 2-3 sentence background story including their personal history, career journey, interests, and what drives them
          - goal: What this persona is trying to achieve or their primary motivation/objective in life or work (e.g., "build a successful startup", "advance to senior management", "work-life balance while helping others")
          
          Make each persona unique, realistic, and well-rounded with consistent details across all properties.`,
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
