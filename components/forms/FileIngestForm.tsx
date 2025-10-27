"use client";
import { useState } from "react";

export default function FileIngestForm() {
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const fd = new FormData(e.currentTarget as HTMLFormElement);
        const r = await fetch("/api/ingest", { method: "POST", body: fd });
        alert(await r.text());
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