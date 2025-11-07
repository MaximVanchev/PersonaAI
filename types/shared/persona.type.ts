import { File, Persona } from "@/generated/prisma";

export interface PersonaGeneratorDto {
    maleCount: number;
    femaleCount: number;
    files: File[];
}

export interface PersonaCountDto {
    maleCount: number;
    femaleCount: number;
}

export interface PersonaListDto {
    personas: Persona[];
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
