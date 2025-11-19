"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function PersonaListComponent({ personas }: { personas: any[] | null }) {
  // Handle case where personas is not an array or is null
  const personaList = Array.isArray(personas) ? personas : [];

  const badgeVariants = ["default", "secondary", "outline"] as const;

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <h2 className="text-2xl font-bold mb-8 sm:mb-20 text-center">
        Your AI Personas
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
        {personaList.map((persona, index) => (
          <Badge
            key={persona.id}
            variant={badgeVariants[index % badgeVariants.length]}
            className="w-55 h-55 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer active:scale-95 sm:active:scale-100 hover:scale-105 sm:hover:scale-110 transition-all duration-200 sm:duration-300 shadow-lg hover:shadow-xl text-center leading-tight tracking-wide uppercase p-2 sm:p-0"
          >
            <span className="text-center break-words max-w-full overflow-hidden">
              {persona.name}
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
