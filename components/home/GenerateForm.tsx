"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import toster from "react-hot-toast";
import { generatePersonasRequest } from "@/lib/api/persona.request";
import {
  PersonaCountDto,
  PersonaGeneratorDto,
} from "@/types/shared/persona.type";
import { useRouter } from "next/navigation";

export function GenerateForm() {
  const [maleCount, setMaleCount] = useState(1);
  const [femaleCount, setFemaleCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      await generatePersonasRequest({
        maleCount,
        femaleCount,
      } as PersonaCountDto);

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
    <div>
      <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
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
            <Label className="text-sm font-medium text-white">Male</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
                disabled={maleCount <= 0}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="w-12 h-10 flex items-center justify-center bg-muted rounded-md border">
                <span className="text-lg font-semibold text-black">
                  {maleCount}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setMaleCount(Math.min(10, maleCount + 1))}
                disabled={maleCount >= 6}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <Label className="text-sm font-medium text-white">Female</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
                disabled={femaleCount <= 0}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <div className="w-12 h-10 flex items-center justify-center bg-muted rounded-md border">
                <span className="text-lg font-semibold text-black">
                  {femaleCount}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setFemaleCount(Math.min(10, femaleCount + 1))}
                disabled={femaleCount >= 6}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
        <div className="rounded-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-[1.3rem] font-medium h-15 px-4 mx-auto">
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
