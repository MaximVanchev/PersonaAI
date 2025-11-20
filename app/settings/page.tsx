import FileIngestForm from "@/components/settings/FileIngestForm";
import FileListComponent from "@/components/settings/FileListComponent";
import { getFilesNames } from "@/lib/api/files.request";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Settings() {
  const filesNames = await getFilesNames();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-800 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-8 flex flex-col gap-8 relative">
        <Link href="/" className="absolute top-6 left-6 z-10">
          <button
            aria-label="Go to Home"
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-600 shadow-lg"
          >
            <ArrowLeft className="h-6 w-6 text-gray-300 hover:text-white" />
          </button>
        </Link>
        <h1 className="text-4xl font-bold text-center text-gray-100 mb-2">
          Settings
        </h1>
        <div>
          <h2 className="text-2xl font-semibold text-gray-200 mb-4 text-center">
            Uploaded Files
          </h2>
          <FileListComponent filesnames={filesNames} />
        </div>
        <div>
          <FileIngestForm />
        </div>
      </div>
    </div>
  );
}
