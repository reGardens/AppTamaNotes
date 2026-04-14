import { create } from 'zustand';
import type { ShoppingNote, CreateNoteInput, UpdateNoteInput } from '@/types';
import {
  getNotes as apiGetNotes,
  addNote as apiAddNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
} from '@/lib/api';
import { calculateTotal } from '@/lib/calculateTotal';

interface NotesState {
  notes: ShoppingNote[];
  totalPrice: number;
  fetchNotes: (userId: string) => Promise<void>;
  addNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (id: string, data: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  totalPrice: 0,

  fetchNotes: async (userId: string): Promise<void> => {
    const response = await apiGetNotes(userId);
    const notes = response.notes ?? [];
    set({ notes, totalPrice: calculateTotal(notes) });
  },

  addNote: async (note: CreateNoteInput): Promise<void> => {
    const response = await apiAddNote(note);
    if (response.success && response.note) {
      set((state) => {
        const notes = [...state.notes, response.note!];
        return { notes, totalPrice: calculateTotal(notes) };
      });
    }
  },

  updateNote: async (id: string, data: UpdateNoteInput): Promise<void> => {
    const response = await apiUpdateNote(id, data);
    if (response.success && response.note) {
      set((state) => {
        const notes = state.notes.map((n) =>
          n.id === id ? response.note! : n,
        );
        return { notes, totalPrice: calculateTotal(notes) };
      });
    }
  },

  deleteNote: async (id: string): Promise<void> => {
    const response = await apiDeleteNote(id);
    if (response.success) {
      set((state) => {
        const notes = state.notes.filter((n) => n.id !== id);
        return { notes, totalPrice: calculateTotal(notes) };
      });
    }
  },
}));
