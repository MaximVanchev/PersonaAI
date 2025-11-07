import FileIngestForm from "@/components/settings/FileIngestForm";
import FileListComponent from "@/components/settings/FileListComponent";
import { getFilesNames } from "@/lib/api/files.request";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default async function Settings() {

    const filesNames = await getFilesNames();

        return (
                    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center py-12 px-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 flex flex-col gap-8 relative">
                            <Link href="/" className="absolute top-6 left-6 z-10">
                                <button aria-label="Go to Home" className="p-2 rounded-full bg-white dark:bg-gray-900 shadow hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-gray-200 dark:border-gray-800">
                                    <ArrowLeft className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                </button>
                            </Link>
                            <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Settings</h1>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Uploaded Files</h2>
                                <FileListComponent filesnames={filesNames} />
                            </div>
                            <div>
                                <FileIngestForm />
                            </div>
                        </div>
                    </div>
        );
}