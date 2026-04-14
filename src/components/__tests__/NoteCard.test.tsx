import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteCard from '../NoteCard';
import type { ShoppingNote } from '@/types';

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

describe('NoteCard', () => {
  it('renders item name', () => {
    render(<NoteCard note={sampleNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Beras 5kg')).toBeInTheDocument();
  });

  it('renders quantity and formatted unit price', () => {
    render(<NoteCard note={sampleNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Jumlah: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 65\.000/)).toBeInTheDocument();
  });

  it('renders formatted subtotal', () => {
    render(<NoteCard note={sampleNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Subtotal:.*Rp 130\.000/)).toBeInTheDocument();
  });

  it('renders edit and delete icon buttons', () => {
    render(<NoteCard note={sampleNote} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onEdit with note id when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<NoteCard note={sampleNote} onEdit={onEdit} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('note-1');
  });

  it('calls onDelete with note id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<NoteCard note={sampleNote} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('note-1');
  });
});
