'use server';

import * as XLSX from "xlsx";
import { ConvertedFileDto, FileFormat } from "@/types/index.type";
import mammoth from "mammoth";
import { PDFParse, TextResult } from "pdf-parse";

function sanitizeForJson<T>(value: T): any {
  if (value === undefined) return null; // in arrays it becomes null; for objects we’ll drop keys below
  if (Array.isArray(value)) {
    return value.map(v => (v === undefined ? null : sanitizeForJson(v)));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = sanitizeForJson(v);
      // note: undefined object properties are omitted
    }
    return out;
  }
  return value;
}

export async function convertFileToJSON(entry: FormDataEntryValue | null): Promise<ConvertedFileDto | null> {
    if (!(entry instanceof File)) {
    throw new Error("Expected a File in form-data field 'file'.");
    }
    const file = entry as File;

    const fileFormat = file.name.split('.').pop()?.toLowerCase();
    console.log("Detected file format:", fileFormat);
    
    const result = { name: file.name , format: fileFormat} as ConvertedFileDto;

    switch (fileFormat) {
        case FileFormat.EXCEL || FileFormat.EXCEL2:
            result.content = await convertExcelFileToJson(file);
            break;
        case FileFormat.WORD || FileFormat.WORD2:
            result.content = await convertWordFileToJson(file);
            break;
        case FileFormat.PDF:
            result.content = await convertPdfFileToJson(file);
            break;
        case FileFormat.TEXT:
            result.content = await convertTextFileToJson(file);
            break;
        default:
            throw new Error("Unsupported file format");
    }

    result.content = sanitizeForJson(result.content);

    return result;
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
      const rows = XLSX.utils.sheet_to_json(sheet, { 
        header: 1,
        defval: null,
        blankrows: false,
      }) as any[][];
      allSheetsData[sheetName] = rows;
    });

    console.log(allSheetsData);

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

async function convertPdfFileToJson(file: File): Promise<Record<string, any>> {
  const buffer = Buffer.from(await file.arrayBuffer());
    
  const parser = new PDFParse({ data: buffer });
    
    // Get text content
    const textResult: TextResult = await parser.getText();
    
    // Get metadata/info
    const infoResult = await parser.getInfo();
    
    // Clean up
    await parser.destroy();
    
    // Return structured JSON with parsed data
    return {
      totalPages: infoResult.total,
      info: infoResult.info,
      text: textResult.text,
      pages: textResult.pages,
    };
}

async function convertTextFileToJson(file: File): Promise<Record<string, any>> {
    
  const text = await file.text();
    
    // Return structured JSON with file data
    return {
      filename: file.name,
      filesize: file.size,
      type: file.type,
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified).toISOString(),
      text: text,
      lineCount: text.split('\n').length,
      characterCount: text.length,
      wordCount: text.trim().split(/\s+/).filter(word => word.length > 0).length,
    };
}