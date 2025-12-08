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
          content: `You are an expert persona generator. Your task is to create detailed, realistic, and diverse personas strictly based on the provided criteria.
 
Return a JSON object with a "personas" property that contains an array of PersonaDto objects.
 
Each PersonaDto must contain the following properties with the exact meanings described below:
 
- name: A realistic Bulgarian first and last name not the third name, appropriate for the persona’s gender and age. Always use Bulgarian First and Last names.
- role: The persona’s primary job title, profession, or societal role.
- age: A realistic number between 18–65 that aligns logically with their experience, profession, and biography based on the data.
- gender: Either "male" or "female", as requested.
- tone: The communication style and personality tone of the persona (e.g., "friendly and open", "professional and direct", "calm and analytical", "emotional and inspiring").
- expertise: The persona’s core skill areas, knowledge, and practical strengths ).
- biography: A detailed 2–3 sentence background story describing the persona’s personal history, career path, interests, and motivations. The biography must feel human, coherent.
- goal: The persona’s primary motivation or objective in life or work (e.g., "to develop a successful own business", "to build a stable career", "to achieve a work-life balance").
 
REQUIREMENTS:
 
1. Every persona must be unique, well-rounded, and internally consistent across all properties.
2. All details must logically fit together (age ↔ career level, biography ↔ expertise, tone ↔ role, etc.).
3. All names must be Bulgarian.
4. All content must be realistic, culturally appropriate, and believable.
5. Output only valid JSON with no commentary outside the JSON structure..
6. Dont generate personas using any of the file names or internal sheets.`,
        },
        {
          role: "user",
          content: `Generate a total of ${params.maleCount + params.femaleCount} unique personas with properties in English. ${params.maleCount} should be male and ${params.femaleCount} should be female. Use the following files as the only source of information for the personas you create: ${params.files.map((f) => f.content).join(", ")}. `,
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
