import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteList from '../NoteList';
import type { ShoppingNote } from '@/types';

vi.mock('@/animations/gsapAnimations', () => ({
  animateIn: vi.fn(),
  animateOut: vi.fn(() => Promise.resolve()),
}));

const { animateIn } = await import('@/animations/gsapAnimations');

function makeNote(overrides: Partial<ShoppingNote> = {}): ShoppingNote {
  return { id: 'note-1', userId: 'user-1', itemName: 'Beras 5kg', quantity: 2, unitPrice: 65000, subtotal: 130000, createdAt: '2025-01-15T10:30:00.000Z', updatedAt: '2025-01-15T10:30:00.000Z', ...overrides };
}

describe('NoteList', () => {
  beforeEach(() => { vi.clearAllMocks(); cleanup(); });

  it('shows empty state message when notes array is empty', () => {
    render(<NoteList notes={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Belum ada catatan belanja')).toBeInTheDocument();
  });

  it('renders rows for each note', () => {
    const notes = [makeNote({ id: 'note-1', itemName: 'Beras 5kg' }), makeNote({ id: 'note-2', itemName: 'Gula 1kg' })];
    render(<NoteList notes={notes} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Beras 5kg')).toBeInTheDocument();
    expect(screen.getByText('Gula 1kg')).toBeInTheDocument();
  });

  it('calls animateIn for new notes on mount', async () => {
    render(<NoteList notes={[makeNote({ id: 'note-1' })]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    await vi.waitFor(() => { expect(animateIn).toHaveBeenCalled(); });
  });

  it('has edit and delete buttons', () => {
    render(<NoteList notes={[makeNote({ id: 'note-1' })]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('opens edit modal when edit button clicked', async () => {
    render(<NoteList notes={[makeNote({ id: 'note-1' })]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    screen.getByRole('button', { name: /edit/i }).click();
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<NoteList notes={[makeNote({ id: 'note-1' })]} onEdit={vi.fn()} onDelete={onDelete} />);
    screen.getByRole('button', { name: /delete/i }).click();
    expect(onDelete).toHaveBeenCalledWith('note-1');
  });
});
