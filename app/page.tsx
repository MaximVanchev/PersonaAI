import { GenerateForm } from "@/components/home/GenerateForm";
import { PersonaListComponent } from "@/components/home/PersonaListComponent";
import { getListPersonas } from "@/lib/api/persona.request";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const personas = await getListPersonas();
  const personaList = Array.isArray(personas) ? personas : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="flex p-8 sm:p-20">
        <div className="text-4xl justify-start font-bold tracking-tight">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            PersonaAI
          </Link>
        </div>
        <div className="justify-end ml-auto right-0">
          <Link href="/settings">
            <button
              aria-label="Settings"
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors shadow-lg"
            >
              <Settings color="white" size="2rem"></Settings>
            </button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 sm:p-20">
        <div className="flex flex-col gap-[40px] items-center sm:items-start">
          {personaList.length > 0 ? (
            <PersonaListComponent personas={personaList} />
          ) : (
            <GenerateForm />
          )}
        </div>
      </main>
      <footer className="flex gap-[24px] p-8 sm:p-20 items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-300 hover:text-white transition-colors"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            className="filter invert opacity-70"
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-300 hover:text-white transition-colors"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
            className="filter invert opacity-70"
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-300 hover:text-white transition-colors"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="filter invert opacity-70"
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
