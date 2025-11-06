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
      className="space-y-3"
    >
      <input name="file" type="file" required />
      <input name="name" placeholder="Optional name override" />
      <button disabled={busy} type="submit">Upload</button>
    </form>
  );
}