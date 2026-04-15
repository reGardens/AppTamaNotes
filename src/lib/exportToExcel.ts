import * as XLSX from "xlsx";
import { ShoppingNote } from "@/types";
import { formatCurrency } from "./formatCurrency";
import { formatAmount } from "./formatAmount";
import { formatDateTime } from "./formatTime";
import { calculateTotal } from "./calculateTotal";

function buildSheetData(notes: ShoppingNote[]) {
  const header = ["No", "Nama Item", "Qty", "Harga Satuan (Rp)", "Subtotal (Rp)", "Waktu"];
  const rows = notes.map((note, index) => [
    index + 1,
    note.itemName,
    formatAmount(note.quantity),
    formatCurrency(note.unitPrice),
    formatCurrency(note.subtotal),
    formatDateTime(note.createdAt),
  ]);
  const total = calculateTotal(notes);
  const totalRow = ["", "", "", "Total", formatCurrency(total), ""];
  return { data: [header, ...rows, totalRow] };
}

const COL_WIDTHS = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 28 }];

export function exportToExcel(notes: ShoppingNote[]): void {
  const { data } = buildSheetData(notes);
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = COL_WIDTHS;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Belanja");
  const t = new Date();
  XLSX.writeFile(wb, `Daftar_Belanja_${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}.xlsx`);
}

export function exportToExcelBase64(notes: ShoppingNote[]): string {
  const { data } = buildSheetData(notes);
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = COL_WIDTHS;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Belanja");
  return XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
}
