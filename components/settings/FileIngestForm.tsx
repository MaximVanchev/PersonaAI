"use client";
import { addFile } from "@/lib/api/files.request";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FileIngestForm() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submitFile = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
        setBusy(true);

        try{
          const formEl = e.currentTarget as HTMLFormElement;
          const fd = new FormData(formEl); // includes both "file" and "name"
          await addFile(fd);                // ← send the whole FormData
          toast.success("Uploaded!");
        }
        catch(err){
          console.log(err);
          toast.error("File upload failed");
        }
        
        setBusy(false);
        router.refresh();
};

  return (
    <form
      onSubmit={submitFile}
      className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 flex flex-col gap-6 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="font-medium text-gray-700 dark:text-gray-200">File</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-2"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium text-gray-700 dark:text-gray-200">Name (optional)</label>
        <input
          id="name"
          name="name"
          placeholder="Optional name override"
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-2"
        />
      </div>
      <button
        disabled={busy}
        type="submit"
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy && (
          <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
        )}
        {busy ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}