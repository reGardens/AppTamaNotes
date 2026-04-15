import { describe, it, expect, vi, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import { ShoppingNote } from "@/types";
import { exportToExcel } from "../exportToExcel";

vi.mock("xlsx", async () => {
  const actual = await vi.importActual<typeof import("xlsx")>("xlsx");
  return { ...actual, writeFile: vi.fn() };
});

function makeNote(overrides: Partial<ShoppingNote> & { itemName: string; quantity: number; unitPrice: number; subtotal: number }): ShoppingNote {
  return { id: "note-1", userId: "user-1", createdAt: "2025-01-15T10:00:00.000Z", updatedAt: "2025-01-15T10:00:00.000Z", ...overrides };
}

describe("exportToExcel", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z")); });

  it("should generate an xlsx file with correct columns and total row", () => {
    const notes: ShoppingNote[] = [
      makeNote({ itemName: "Beras 5kg", quantity: 2, unitPrice: 65000, subtotal: 130000 }),
      makeNote({ id: "note-2", itemName: "Gula 1kg", quantity: 3, unitPrice: 15000, subtotal: 45000 }),
    ];
    exportToExcel(notes);
    expect(XLSX.writeFile).toHaveBeenCalledOnce();
    const [workbook, fileName] = (XLSX.writeFile as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fileName).toBe("Daftar_Belanja_2025-06-15.xlsx");
    const sheet = workbook.Sheets["Daftar Belanja"];
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    // New column order: No, Nama Item, Harga Satuan, Qty, Subtotal
    expect(data[0]).toEqual(["No", "Nama Item", "Qty", "Harga Satuan (Rp)", "Subtotal (Rp)", "Waktu"]);
    expect(data[1][0]).toBe(1);
    expect(data[1][1]).toBe("Beras 5kg");
    expect(data[1][2]).toBe("2");
    expect(data[1][3]).toBe("Rp 65.000");
    expect(data[1][4]).toBe("Rp 130.000");
    expect(data[1][5]).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
    expect(data[3][4]).toBe("Rp 175.000");
  });

  it("should use correct date in file name", () => {
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
    exportToExcel([makeNote({ itemName: "Test", quantity: 1, unitPrice: 1000, subtotal: 1000 })]);
    const [, fileName] = (XLSX.writeFile as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fileName).toBe("Daftar_Belanja_2024-01-01.xlsx");
  });

  it("should handle a single note", () => {
    exportToExcel([makeNote({ itemName: "Sabun", quantity: 5, unitPrice: 8000, subtotal: 40000 })]);
    const [workbook] = (XLSX.writeFile as ReturnType<typeof vi.fn>).mock.calls[0];
    const data = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets["Daftar Belanja"], { header: 1 });
    expect(data).toHaveLength(3);
    expect(data[1][1]).toBe("Sabun");
    expect(data[1][4]).toBe("Rp 40.000");
    expect(data[2][3]).toBe("Total");
    expect(data[2][4]).toBe("Rp 40.000");
  });

  it("should handle empty notes array", () => {
    exportToExcel([]);
    const [workbook] = (XLSX.writeFile as ReturnType<typeof vi.fn>).mock.calls[0];
    const data = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets["Daftar Belanja"], { header: 1 });
    expect(data).toHaveLength(2);
    expect(data[1][3]).toBe("Total");
  });
});
