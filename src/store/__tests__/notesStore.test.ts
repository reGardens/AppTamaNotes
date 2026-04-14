import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotesStore } from '../notesStore';
import type { ShoppingNote } from '@/types';

vi.mock('@/lib/api', () => ({
  getNotes: vi.fn(),
  addNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

import {
  getNotes as apiGetNotes,
  addNote as apiAddNote,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
} from '@/lib/api';

const mockedGetNotes = vi.mocked(apiGetNotes);
const mockedAddNote = vi.mocked(apiAddNote);
const mockedUpdateNote = vi.mocked(apiUpdateNote);
const mockedDeleteNote = vi.mocked(apiDeleteNote);

const sampleNote: ShoppingNote = {
  id: 'note-1',
  userId: 'user-1',
  itemName: 'Beras 5kg',
  quantity: 2,
  unitPrice: 65000,
  subtotal: 130000,
  createdAt: '2025-01-15T10:30:00.000Z',
  updatedAt: '2025-01-15T10:30:00.000Z',
};

const sampleNote2: ShoppingNote = {
  id: 'note-2',
  userId: 'user-1',
  itemName: 'Gula 1kg',
  quantity: 3,
  unitPrice: 15000,
  subtotal: 45000,
  createdAt: '2025-01-15T11:00:00.000Z',
  updatedAt: '2025-01-15T11:00:00.000Z',
};

describe('notesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotesStore.setState({ notes: [], totalPrice: 0 });
  });

  it('should have correct initial state', () => {
    const state = useNotesStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.totalPrice).toBe(0);
  });

  describe('fetchNotes', () => {
    it('should set notes and recalculate totalPrice', async () => {
      mockedGetNotes.mockResolvedValue({ notes: [sampleNote, sampleNote2] });

      await useNotesStore.getState().fetchNotes('user-1');

      const state = useNotesStore.getState();
      expect(state.notes).toEqual([sampleNote, sampleNote2]);
      expect(state.totalPrice).toBe(175000);
      expect(mockedGetNotes).toHaveBeenCalledWith('user-1');
    });

    it('should handle empty notes array', async () => {
      mockedGetNotes.mockResolvedValue({ notes: [] });

      await useNotesStore.getState().fetchNotes('user-1');

      const state = useNotesStore.getState();
      expect(state.notes).toEqual([]);
      expect(state.totalPrice).toBe(0);
    });
  });

  describe('addNote', () => {
    it('should append note and recalculate totalPrice', async () => {
      useNotesStore.setState({ notes: [sampleNote], totalPrice: 130000 });
      mockedAddNote.mockResolvedValue({ success: true, note: sampleNote2 });

      await useNotesStore.getState().addNote({
        userId: 'user-1',
        itemName: 'Gula 1kg',
        quantity: 3,
        unitPrice: 15000,
      });

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(2);
      expect(state.notes[1]).toEqual(sampleNote2);
      expect(state.totalPrice).toBe(175000);
    });

    it('should not update state on failed addNote', async () => {
      useNotesStore.setState({ notes: [sampleNote], totalPrice: 130000 });
      mockedAddNote.mockResolvedValue({ success: false, error: 'Gagal menyimpan' });

      await useNotesStore.getState().addNote({
        userId: 'user-1',
        itemName: 'Gula 1kg',
        quantity: 3,
        unitPrice: 15000,
      });

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(1);
      expect(state.totalPrice).toBe(130000);
    });
  });

  describe('updateNote', () => {
    it('should replace note and recalculate totalPrice', async () => {
      const updatedNote: ShoppingNote = {
        ...sampleNote,
        quantity: 5,
        subtotal: 325000,
        updatedAt: '2025-01-16T10:00:00.000Z',
      };
      useNotesStore.setState({ notes: [sampleNote, sampleNote2], totalPrice: 175000 });
      mockedUpdateNote.mockResolvedValue({ success: true, note: updatedNote });

      await useNotesStore.getState().updateNote('note-1', {
        itemName: 'Beras 5kg',
        quantity: 5,
        unitPrice: 65000,
      });

      const state = useNotesStore.getState();
      expect(state.notes[0]).toEqual(updatedNote);
      expect(state.totalPrice).toBe(370000);
    });

    it('should not update state on failed updateNote', async () => {
      useNotesStore.setState({ notes: [sampleNote], totalPrice: 130000 });
      mockedUpdateNote.mockResolvedValue({ success: false, error: 'Not found' });

      await useNotesStore.getState().updateNote('note-1', {
        itemName: 'Beras 5kg',
        quantity: 5,
        unitPrice: 65000,
      });

      const state = useNotesStore.getState();
      expect(state.notes[0]).toEqual(sampleNote);
      expect(state.totalPrice).toBe(130000);
    });
  });

  describe('deleteNote', () => {
    it('should remove note and recalculate totalPrice', async () => {
      useNotesStore.setState({ notes: [sampleNote, sampleNote2], totalPrice: 175000 });
      mockedDeleteNote.mockResolvedValue({ success: true });

      await useNotesStore.getState().deleteNote('note-1');

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(1);
      expect(state.notes[0]).toEqual(sampleNote2);
      expect(state.totalPrice).toBe(45000);
    });

    it('should not update state on failed deleteNote', async () => {
      useNotesStore.setState({ notes: [sampleNote, sampleNote2], totalPrice: 175000 });
      mockedDeleteNote.mockResolvedValue({ success: false, error: 'Gagal menghapus' });

      await useNotesStore.getState().deleteNote('note-1');

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(2);
      expect(state.totalPrice).toBe(175000);
    });
  });
});
