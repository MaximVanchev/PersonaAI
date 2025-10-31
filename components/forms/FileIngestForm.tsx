"use client";
import { addFile } from "@/lib/api/files.request";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FileIngestForm() {
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
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
      }}
      className="space-y-3"
    >
      <input name="file" type="file" required />
      <input name="name" placeholder="Optional name override" />
      <button disabled={busy} type="submit">Upload</button>
    </form>
  );
}