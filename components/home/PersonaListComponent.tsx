"use client";

import { Badge } from "@/components/ui/badge";
import { deletePersonaById } from "@/lib/api/persona.request";
import { PersonaListDto } from "@/types/index.type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export function PersonaListComponent({
  personas,
}: {
  personas: PersonaListDto[] | null;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  // Handle case where personas is not an array or is null
  const personaList = Array.isArray(personas) ? personas : [];

  const handleDelete = async (personaId: number) => {
    setBusy(true);
    try {
      await deletePersonaById(personaId);
      toast.success("Persona deleted");
    } catch (error) {
      toast.error("Failed to delete persona");
    } finally {
      setBusy(false);
    }

    router.refresh();
  };
  {
    if (personaList.length === 0) {
      return (
        <div className="w-full max-w-4xl px-4 sm:px-0">
          <h2 className="text-2xl font-bold mb-6 sm:mb-8 text-center text-white">
            No AI Personas Found
          </h2>
          <p className="text-center text-gray-400">
            You haven't created any AI personas yet. Use the form above to
            generate your first persona!
          </p>
        </div>
      );
    }
  }
  return (
    <div className="w-full max-w-4xl px-4 sm:px-0">
      <h2 className="text-2xl font-bold mb-6 sm:mb-8 text-center text-white">
        Your AI Personas
      </h2>
      <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
        {personaList.map((persona, index) => {
          const badgeStyles = [
            "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 hover:from-blue-700 hover:to-blue-800",
            "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 hover:from-purple-700 hover:to-purple-800",
            "bg-gradient-to-r from-pink-600 to-pink-700 text-white border-pink-500 hover:from-pink-700 hover:to-pink-800",
          ];

          return (
            <div key={persona.id} className="flex flex-col items-center gap-3">
              <Link href={`/persona/${persona.id}`}>
                <Badge
                  variant="outline"
                  className={`w-55 h-55 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer active:scale-95 sm:active:scale-100 hover:scale-105 sm:hover:scale-110 transition-all duration-200 sm:duration-300 shadow-lg hover:shadow-xl text-center leading-tight tracking-wide uppercase p-2 sm:p-0 ${badgeStyles[index % badgeStyles.length]}`}
                >
                  <span className="text-center break-words max-w-full overflow-hidden">
                    {persona.name}
                  </span>
                </Badge>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(persona.id);
                }}
                disabled={busy}
                className="flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg group"
                aria-label="Delete persona"
              >
                {busy ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                ) : (
                  <Trash2
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
