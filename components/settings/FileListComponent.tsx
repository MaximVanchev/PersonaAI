"use client";

import { FileListDto } from "@/types/index.type";

export default function FileListComponent({ filesnames }: { filesnames: FileListDto[] | null }) {
    return (
    <ul>
      {(!filesnames || filesnames.length === 0) ? 
        <li>No files</li> 
      : filesnames.map((file) => (
        <li key={file.id}>{file.fileName}</li>
      ))}
    </ul>
  );
}