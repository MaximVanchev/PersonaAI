import { ConvertedFileDto, FileListDto } from "@/types/index.type";

export async function getFilesNames() : Promise<FileListDto[] | null> {

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const res = await fetch(`${baseUrl}/api/file/names`);

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch file names');
    }

    return data.filesNames as FileListDto[];
}

export async function addFile(params: FormData | null) : Promise<ConvertedFileDto | null> {
    //validateFileParams(params);

    const res = await fetch(`/api/file/create`, {
        method: 'POST',
        body: params,
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

function validateFileParams(params: FormDataEntryValue) {
    throw new Error("Function not implemented.");

}
