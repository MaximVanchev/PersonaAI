'use server';

import * as XLSX from "xlsx";
import { ConvertedFileDto, FileFormat } from "@/types/index.type";
import mammoth from "mammoth";

export async function convertFileToJSON(entry: FormDataEntryValue | null): Promise<ConvertedFileDto | null> {
    if (!(entry instanceof File)) {
    throw new Error("Expected a File in form-data field 'file'.");
    }
    const file = entry as File;

    const fileFormat = file.name.split('.').pop()?.toLowerCase();
    console.log("Detected file format:", fileFormat);
    
    const result = { name: file.name , format: fileFormat} as ConvertedFileDto;

    switch (fileFormat) {
        case FileFormat.EXCEL:
            result.content = await convertExcelFileToJson(file);
        //case FileFormat.WORD || FileFormat.WORD2:
            //result.content = await convertWordFileToJson(file);
        case FileFormat.PDF:
        case FileFormat.TEXT:
        // Future cases for WORD, PDF, TEXT can be added here
        default:
            throw new Error("Unsupported file format");
    }
}

async function convertExcelFileToJson(file: File) : Promise<Record<string, any[]>> {
  try {
    // 1️⃣ Read file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2️⃣ Parse workbook from the ArrayBuffer
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // 3️⃣ Iterate over every sheet
    const allSheetsData: Record<string, any[]> = {};

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      // Use header: 1 to keep the raw matrix (no headers parsing)
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      allSheetsData[sheetName] = rows;
    });

    return allSheetsData;
  } catch (error) {
    console.error("Error converting Excel to JSON:", error);
    throw error;
  }
}

async function convertWordFileToJson(file: File) : Promise<Record<string, any[]>> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { value: text } = await mammoth.extractRawText({ buffer });

    // Split into paragraphs
    const paragraphs = text
      .split(/\r?\n\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const maxChars = 2000;
    const chunks: string[] = [];
    let buf = "";

    for (const p of paragraphs) {
      const next = buf ? buf + "\n\n" + p : p;
      if (next.length > maxChars) {
        if (buf) chunks.push(buf);
        if (p.length > maxChars) {
          for (let i = 0; i < p.length; i += maxChars) {
            chunks.push(p.slice(i, i + maxChars));
          }
          buf = "";
        } else {
          buf = p;
        }
      } else {
        buf = next;
      }
    }
    if (buf) chunks.push(buf);

    const result: Record<string, any[]> = {
      paragraphs,
      chunks,
      metadata: [
        {
          filename: file.name,
          textLength: text.length,
          paragraphsCount: paragraphs.length,
          chunksCount: chunks.length,
        },
      ],
    };

    return result;
  } catch (error) {
    console.error("Error converting Word to JSON:", error);
    throw error;
  }
}