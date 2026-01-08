"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Minus, Plus, ChevronDown } from "lucide-react";
import toster from "react-hot-toast";
import { generatePersonasRequest } from "@/lib/api/persona.request";
import {
  PersonaGeneratorDto,
  PersonaGeneratorDataDto,
  GenerationDto,
} from "@/types/shared/persona.type";
import { useRouter } from "next/navigation";

const GENERATIONS: GenerationDto[] = [
  {
    name: "Gen Z",
    startYear: 1997,
    endYear: 2012,
    description: "Born 1997-2012",
  },
  {
    name: "Millennials",
    startYear: 1981,
    endYear: 1996,
    description: "Born 1981-1996",
  },
  {
    name: "Gen X",
    startYear: 1965,
    endYear: 1980,
    description: "Born 1965-1980",
  },
  {
    name: "Baby Boomers",
    startYear: 1946,
    endYear: 1964,
    description: "Born 1946-1964",
  },
  {
    name: "Silent Generation",
    startYear: 1928,
    endYear: 1945,
    description: "Born 1928-1945",
  },
];

export function GenerateForm(params: { personaCount: number }) {
  const [maleCount, setMaleCount] = useState(1);
  const [femaleCount, setFemaleCount] = useState(1);
  const [selectedGeneration, setSelectedGeneration] =
    useState<GenerationDto | null>(null); // No default selection

  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    if (maleCount + femaleCount + params.personaCount > 6) {
      toster.error("You can generate a maximum of 6 personas");
      setBusy(false);
      return;
    }

    try {
      const requestData: PersonaGeneratorDataDto = {
        maleCount,
        femaleCount,
        generation: selectedGeneration || undefined,
      };

      if (selectedGeneration) {
        requestData.generation = selectedGeneration;
      }

      await generatePersonasRequest(requestData);

      console.log("Personas generated successfully");
      toster.success("Personas generated successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toster.error("Failed to generate personas. Please try again.");
    }

    setBusy(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <ol className="font-mono list-inside list-decimal text-sm/6 text-center text-gray-300 mb-6">
        <li className="mb-2 tracking-[-.01em]">Generate your AI personas.</li>
        <li className="tracking-[-.01em]">
          Start a chat with your AI personas and explore their unique
          perspectives.
        </li>
      </ol>
      <form
        onSubmit={handleSubmit}
        className="w-full justify-center sm:w-auto mx-auto flex flex-col gap-4"
      >
        <div className="flex gap-8 items-center justify-center my-10">
          <div className="flex flex-col gap-3 items-center">
            <Label className="text-sm font-medium text-gray-200">Male</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
                disabled={maleCount <= 0}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="w-12 h-10 flex items-center justify-center bg-gray-700 rounded-md border border-gray-600">
                <span className="text-lg font-semibold text-white">
                  {maleCount}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setMaleCount(Math.min(10, maleCount + 1))}
                disabled={maleCount >= 6}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Label className="text-sm font-medium text-gray-200">Female</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
                disabled={femaleCount <= 0}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="w-12 h-10 flex items-center justify-center bg-gray-700 rounded-md border border-gray-600">
                <span className="text-lg font-semibold text-white">
                  {femaleCount}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white"
                onClick={() => setFemaleCount(Math.min(10, femaleCount + 1))}
                disabled={femaleCount >= 6}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 mb-6">
          <Label className="text-sm font-medium text-gray-200">
            Generation
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-32 h-10 flex items-center justify-center bg-gray-700 rounded-md border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {selectedGeneration ? selectedGeneration.name : "Any"}
                  </span>
                  {selectedGeneration && (
                    <span className="text-xs text-gray-400 leading-tight">
                      {selectedGeneration.startYear}-
                      {selectedGeneration.endYear}
                    </span>
                  )}
                  {!selectedGeneration && (
                    <span className="text-xs text-gray-400 leading-tight">
                      Optional
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-800 border-gray-600">
              <DropdownMenuItem
                onClick={() => setSelectedGeneration(null)}
                className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Any Generation</span>
                  <span className="text-xs text-gray-400">No preference</span>
                </div>
              </DropdownMenuItem>
              {GENERATIONS.map((generation) => (
                <DropdownMenuItem
                  key={generation.name}
                  onClick={() => setSelectedGeneration(generation)}
                  className="text-gray-200 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{generation.name}</span>
                    <span className="text-xs text-gray-400">
                      {generation.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-full border border-gray-600 bg-gradient-to-r from-blue-600 to-purple-600 transition-colors flex items-center text-white gap-2 hover:from-blue-700 hover:to-purple-700 text-[1.3rem] font-medium h-15 px-4 mx-auto shadow-lg">
          <button
            type="submit"
            className={
              maleCount + femaleCount > 6 || maleCount + femaleCount < 1 || busy
                ? "cursor-not-allowed opacity-50 py-3"
                : "py-3"
            }
            disabled={
              maleCount + femaleCount > 6 || maleCount + femaleCount < 1 || busy
            }
          >
            {busy ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
