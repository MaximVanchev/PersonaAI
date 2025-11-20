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

    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const fd = new FormData(formEl); // includes both "file" and "name"
      await addFile(fd); // ← send the whole FormData
      toast.success("Uploaded!");
    } catch (err) {
      console.log(err);
      toast.error("File upload failed");
    }

    setBusy(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={submitFile}
      className="bg-gray-800 shadow-2xl rounded-xl p-6 flex flex-col gap-6 w-full max-w-md mx-auto border border-gray-600"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="file" className="font-medium text-gray-200">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="block w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2 file:bg-gray-600 file:border-0 file:text-gray-200 file:rounded file:px-3 file:py-1 file:mr-3"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium text-gray-200">
          Name (optional)
        </label>
        <input
          id="name"
          name="name"
          placeholder="Optional name override"
          className="block w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 p-2 placeholder:text-gray-400"
        />
      </div>
      <button
        disabled={busy}
        type="submit"
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
      >
        {busy && (
          <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
        )}
        {busy ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
