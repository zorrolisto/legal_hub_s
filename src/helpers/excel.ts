import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export const formatArrayToExport = <T>(data: T[], schema: any[]) => {
  return data.map((item: T) => {
    const newItem: any = {};
    schema.forEach((field: any) => {
      if (!field.hiddenFromExcel) {
        newItem[field.label] = item[field.name as keyof T];
      }
    });
    return newItem;
  });
};

export const exportToExcel = (data: any, fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}_${new Date().toISOString()}.xlsx`);
};
