import { z } from "zod";

export const PersonaDtoSchema = z.object({
  name: z.string(),
  role: z.string(),
  age: z.number(),
  gender: z.string(),
  tone: z.string(),
  expertise: z.string(),
  biography: z.string(),
  goal: z.string(),
});

export const PersonaDtoArraySchema = z.array(PersonaDtoSchema);

// Wrapper schema for OpenAI API (requires object, not array)
export const PersonaResponseSchema = z.object({
  personas: z.array(PersonaDtoSchema),
});
