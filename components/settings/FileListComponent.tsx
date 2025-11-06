"use client";

import { deleteFile } from "@/lib/api/files.request";
import { FileListDto } from "@/types/index.type";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function FileListComponent({ filesnames }: { filesnames: FileListDto[] | null }) {
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
    <ul>
      {(!filesnames || filesnames.length === 0) ? 
        <li>No files</li> 
      : filesnames.map((file) => (
        <li key={file.id}>{file.fileName} <button onClick={() => handleDelete(file.id)}>Delete</button></li>
      ))}
    </ul>
  );
}