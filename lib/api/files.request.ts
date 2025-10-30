import { ConvertedFileDto, FileListDto } from "@/types/index.type";

export async function getFilesNames() : Promise<FileListDto[] | null> {

    const res = await fetch('/api/file/names');

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch file names');
    }

    return data as FileListDto[];
}

export async function addFile(params: File) : Promise<ConvertedFileDto | null> {
    //validateFileParams(params);

    const res = await fetch('/api/file/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Failed to add file');
    }

    return data as ConvertedFileDto;
}

export async function deleteFile(fileId: number) : Promise<void> {
    const res = await fetch(`/api/file/${fileId}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete file');
    }
}

function validateFileParams(params: File) {
    throw new Error("Function not implemented.");

}
