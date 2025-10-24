import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex p-8 sm:p-20">
        <div className="text-4xl justify-start font-bold tracking-tight">
          <Link href="/">
            PersonaAI
          </Link>
        </div>
        <div className="justify-end ml-auto right-0">
          <Link href="/settings">
            <button aria-label="Settings" className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <Settings color="white" size="2rem"></Settings>
            </button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 sm:p-20">
        <div className="flex flex-col gap-[40px] items-center sm:items-start">
          <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
            <li className="mb-2 tracking-[-.01em]">
              Generate your AI personas.
            </li>
            <li className="tracking-[-.01em]">
              Start a chat with your AI personas and explore their unique perspectives.
            </li>
          </ol>
          <div className="rounded-full border border-solid border-transparent transition-colors flex items-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-[1.3rem] font-medium h-15 px-4 mx-auto">
            <button>
              Generate
            </button>
          </div>
        </div>
      </main>
      <footer className="flex gap-[24px] p-8 sm:p-20 items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
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
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
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
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
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
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
