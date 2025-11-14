"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function GenerateForm() {
  const [maleCount, setMaleCount] = useState(1);
  const [femaleCount, setFemaleCount] = useState(1);

  return (
    <form className="w-full justify-center sm:w-auto mx-auto flex flex-col gap-4">
      <div className="flex gap-4 items-center justify-center">
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor="maleCount" className="text-sm font-medium">
            Male
          </Label>
          <Input
            id="maleCount"
            name="maleCount"
            type="number"
            min="0"
            max="10"
            className="w-16 h-10 text-center"
            value={maleCount}
            onChange={(e) => setMaleCount(e.target.valueAsNumber)}
          />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Label htmlFor="femaleCount" className="text-sm font-medium">
            Female
          </Label>
          <Input
            id="femaleCount"
            name="femaleCount"
            type="number"
            min="0"
            max="10"
            className="w-16 h-10 text-center"
            value={femaleCount}
            onChange={(e) => setFemaleCount(e.target.valueAsNumber)}
          />
        </div>
      </div>
      <div className="rounded-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-[1.3rem] font-medium h-15 px-4 mx-auto">
        <button
          type="submit"
          className={
            maleCount + femaleCount > 6 || maleCount + femaleCount < 1
              ? "cursor-not-allowed opacity-50 py-3"
              : "py-3"
          }
          disabled={maleCount + femaleCount > 6 || maleCount + femaleCount < 1}
        >
          Generate
        </button>
      </div>
    </form>
  );
}
