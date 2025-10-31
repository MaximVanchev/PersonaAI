'use server';

import * as XLSX from "xlsx";

import { ConvertedFileDto, FileFormat } from "@/types/index.type";

export async function convertFileToJSON(entry: FormDataEntryValue | null): Promise<ConvertedFileDto | null> {
    if (!(entry instanceof File)) {
    throw new Error("Expected a File in form-data field 'file'.");
    }
    const file = entry as File;

    const fileFormat = file.name.split('.').pop()?.toLowerCase();
    console.log("Detected file format:", fileFormat);
    switch (fileFormat) {
        case FileFormat.EXCEL:
            return { name: file.name , content: convertExcelFileToJson(file) , format: fileFormat} as ConvertedFileDto;
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
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

      if (jsonData.length === 0) {
        allSheetsData[sheetName] = [];
        return;
      }

      // Convert rows to objects using the header row
      const headers = jsonData[0];
      const rows = jsonData.slice(1).map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((key: string, i: number) => {
          obj[key] = row[i];
        });
        return obj;
      });

      allSheetsData[sheetName] = rows;
    });

    return allSheetsData;
  } catch (error) {
    console.error("Error converting Excel to JSON:", error);
    throw error;
  }
}