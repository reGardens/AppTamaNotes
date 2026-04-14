import * as XLSX from "xlsx";
import { ShoppingNote } from "@/types";
import { formatCurrency } from "./formatCurrency";
import { formatAmount } from "./formatAmount";
import { calculateTotal } from "./calculateTotal";

function buildSheetData(notes: ShoppingNote[]) {
  // Column order matches web table: No, Nama Item, Qty, Harga Satuan, Subtotal
  const header = ["No", "Nama Item", "Qty", "Harga Satuan (Rp)", "Subtotal (Rp)"];
  const rows = notes.map((note, index) => [
    index + 1,
    note.itemName,
    formatAmount(note.quantity),
    formatCurrency(note.unitPrice),
    formatCurrency(note.subtotal),
  ]);
  const total = calculateTotal(notes);
  const totalRow = ["", "", "", "Total", formatCurrency(total)];
  return { data: [header, ...rows, totalRow] };
}

export function exportToExcel(notes: ShoppingNote[]): void {
  const { data } = buildSheetData(notes);
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Belanja");
  const today = new Date();
  const fileName = `Daftar_Belanja_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToExcelBase64(notes: ShoppingNote[]): string {
  const { data } = buildSheetData(notes);
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Belanja");
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
}
