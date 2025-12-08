import { ConvertedFileDto, FileListDto } from "@/types/index.type";

export async function getFilesNames(): Promise<FileListDto[] | null> {
  // Use absolute URL for server-side rendering, relative for client-side
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const isServer = typeof window === "undefined";

  let url: string;
  if (isServer) {
    // Server-side: use localhost or provided base URL
    url = baseUrl || "http://localhost:3000";
  } else {
    // Client-side: use provided base URL or empty for relative URLs
    url = baseUrl || "";
  }

  const res = await fetch(`${url}/api/file/names`);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch file names: ${res.status} ${res.statusText}`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }

  return data.filesNames as FileListDto[];
}

export async function addFile(
  params: FormData | null
): Promise<ConvertedFileDto | null> {
  //validateFileParams(params);

  const res = await fetch(`/api/file/create`, {
    method: "POST",
    body: params,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to add file");
  }

  return data as ConvertedFileDto;
}

export async function deleteFile(fileId: number): Promise<void> {
  const res = await fetch(`/api/file/${fileId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to delete file");
  }
}

function validateFileParams(params: FormDataEntryValue) {
  throw new Error("Function not implemented.");
}
