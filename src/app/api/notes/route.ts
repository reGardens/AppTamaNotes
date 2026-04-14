import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { ShoppingNote, CreateNoteInput, UpdateNoteInput } from '@/types';
import { validateNote } from '@/lib/validateNote';
import { calculateSubtotal } from '@/lib/calculateSubtotal';

const notesFilePath = path.join(process.cwd(), 'data', 'notes.json');

async function readNotes(): Promise<ShoppingNote[]> {
  try {
    const data = await fs.readFile(notesFilePath, 'utf-8');
    return JSON.parse(data) as ShoppingNote[];
  } catch {
    return [];
  }
}

async function writeNotes(notes: ShoppingNote[]): Promise<void> {
  await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId wajib disertakan' },
        { status: 400 }
      );
    }

    const notes = await readNotes();
    const userNotes = notes.filter((n) => n.userId === userId);

    return NextResponse.json({ notes: userNotes });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateNoteInput;
    const { userId, itemName, quantity, unitPrice } = body;

    const validation = validateNote({ userId, itemName, quantity, unitPrice });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const subtotal = calculateSubtotal(quantity, unitPrice);
    const now = new Date().toISOString();

    const newNote: ShoppingNote = {
      id: `note-${Date.now()}`,
      userId,
      itemName: itemName.trim(),
      quantity,
      unitPrice,
      subtotal,
      createdAt: now,
      updatedAt: now,
    };

    const notes = await readNotes();
    notes.push(newNote);
    await writeNotes(notes);

    return NextResponse.json({ success: true, note: newNote });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan catatan' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateNoteInput & { id: string };
    const { id, itemName, quantity, unitPrice } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID catatan wajib disertakan' },
        { status: 400 }
      );
    }

    const validation = validateNote({
      userId: 'placeholder',
      itemName,
      quantity,
      unitPrice,
    });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const notes = await readNotes();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Catatan tidak ditemukan' },
        { status: 404 }
      );
    }

    const subtotal = calculateSubtotal(quantity, unitPrice);

    notes[index] = {
      ...notes[index],
      itemName: itemName.trim(),
      quantity,
      unitPrice,
      subtotal,
      updatedAt: new Date().toISOString(),
    };

    await writeNotes(notes);

    return NextResponse.json({ success: true, note: notes[index] });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui catatan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID catatan wajib disertakan' },
        { status: 400 }
      );
    }

    const notes = await readNotes();
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Catatan tidak ditemukan' },
        { status: 404 }
      );
    }

    notes.splice(index, 1);
    await writeNotes(notes);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus catatan' },
      { status: 500 }
    );
  }
}
