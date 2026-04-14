import { describe, it, expect, beforeEach } from 'vitest';
import { useFormStore } from '../formStore';
import type { DraftNote } from '@/types';

describe('formStore', () => {
  beforeEach(() => {
    useFormStore.setState({ draft: null, editingId: null });
  });

  it('should have null draft and editingId initially', () => {
    const state = useFormStore.getState();
    expect(state.draft).toBeNull();
    expect(state.editingId).toBeNull();
  });

  it('setDraft should store a draft note', () => {
    const draft: DraftNote = {
      itemName: 'Beras 5kg',
      quantity: '2',
      unitPrice: '65000',
    };

    useFormStore.getState().setDraft(draft);

    const state = useFormStore.getState();
    expect(state.draft).toEqual(draft);
  });

  it('clearDraft should reset draft and editingId to null', () => {
    const draft: DraftNote = {
      itemName: 'Gula 1kg',
      quantity: '3',
      unitPrice: '15000',
    };

    useFormStore.getState().setDraft(draft);
    useFormStore.getState().setEditingId('note-123');
    useFormStore.getState().clearDraft();

    const state = useFormStore.getState();
    expect(state.draft).toBeNull();
    expect(state.editingId).toBeNull();
  });

  it('setEditingId should store the editing note id', () => {
    useFormStore.getState().setEditingId('note-abc');

    expect(useFormStore.getState().editingId).toBe('note-abc');
  });

  it('setEditingId with null should clear the editing id', () => {
    useFormStore.getState().setEditingId('note-abc');
    useFormStore.getState().setEditingId(null);

    expect(useFormStore.getState().editingId).toBeNull();
  });

  it('setDraft should overwrite previous draft', () => {
    const draft1: DraftNote = { itemName: 'Beras', quantity: '1', unitPrice: '50000' };
    const draft2: DraftNote = { itemName: 'Gula', quantity: '2', unitPrice: '15000' };

    useFormStore.getState().setDraft(draft1);
    useFormStore.getState().setDraft(draft2);

    expect(useFormStore.getState().draft).toEqual(draft2);
  });
});
