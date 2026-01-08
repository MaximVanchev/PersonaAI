import { File, Persona } from "@/generated/prisma";

export interface GenerationDto {
  name: string;
  startYear: number;
  endYear: number;
  description: string;
}

export interface PersonaGeneratorDto {
  maleCount: number;
  femaleCount: number;
  files: File[];
  generation?: GenerationDto;
}

export interface PersonaGeneratorDataDto {
  maleCount: number;
  femaleCount: number;
  generation?: GenerationDto;
}

export interface PersonaListDto {
  name: string;
  id: number;
}

export interface PersonaDto {
  name: string;
  role: string;
  age: number;
  gender: string;
  tone: string;
  expertise: string;
  biography: string;
  goal: string;
}

export interface PersonaChatDto {
  id: number;
  name: string;
  role: string;
  age: number;
  gender: string;
  tone: string;
  expertise: string;
  biography: string;
  goal: string;
}
