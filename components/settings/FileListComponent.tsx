"use client";

import { deleteFile } from "@/lib/api/files.request";
import { FileListDto } from "@/types/index.type";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function FileListComponent({
  filesnames,
}: {
  filesnames: FileListDto[] | null;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleDelete = async (fileId: number) => {
    setBusy(true);
    try {
      await deleteFile(fileId);
      toast.success("File deleted");
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setBusy(false);
    }

    router.refresh();
  };

  return (
    <ul className="flex flex-col gap-3 w-full max-w-md mx-auto px-2 sm:px-0">
      {!filesnames || filesnames.length === 0 ? (
        <li className="text-gray-400 bg-gray-800 rounded-lg p-4 text-center border border-gray-600">
          No files uploaded yet
        </li>
      ) : (
        filesnames.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between bg-gray-800 rounded-lg shadow-lg border border-gray-600 p-3 sm:p-4 hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-100 text-sm sm:text-base truncate max-w-[60vw] sm:max-w-none">
              {file.fileName}
            </span>
            <button
              onClick={() => handleDelete(file.id)}
              disabled={busy}
              className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
            >
              {busy ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
              ) : null}
              <span className="block sm:hidden text-xl font-bold">×</span>
              <span className="hidden sm:block">Delete</span>
            </button>
          </li>
        ))
      )}
    </ul>
  );
}
