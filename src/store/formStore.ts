import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DraftNote } from '@/types';

interface FormState {
  draft: DraftNote | null;
  editingId: string | null;
  setDraft: (draft: DraftNote) => void;
  clearDraft: () => void;
  setEditingId: (id: string | null) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      draft: null,
      editingId: null,

      setDraft: (draft: DraftNote) => set({ draft }),

      clearDraft: () => set({ draft: null, editingId: null }),

      setEditingId: (id: string | null) => set({ editingId: id }),
    }),
    {
      name: 'form-draft-storage',
    },
  ),
);
