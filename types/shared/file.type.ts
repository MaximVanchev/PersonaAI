export interface FileListDto {
    name: string;
    id: number;
}

export interface ConvertedFileDto {
    name: string;
    content: Record<string, any> | string;
    format: FileFormat
}

export enum FileFormat {
    EXCEL = 'xlsx',
    EXCEL2 = 'xlsb',
    WORD = 'docx',
    WORD2 = 'doc',
    PDF = 'pdf',
    TEXT = 'txt',
}