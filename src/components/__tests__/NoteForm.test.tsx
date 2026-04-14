import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteForm from '../NoteForm';
import type { ShoppingNote } from '@/types';

// Mock formStore
const mockSetDraft = vi.fn();
const mockClearDraft = vi.fn();
let mockDraft: { itemName: string; quantity: string; unitPrice: string } | null = null;

vi.mock('@/store/formStore', () => ({
  useFormStore: () => ({
    draft: mockDraft,
    setDraft: mockSetDraft,
    clearDraft: mockClearDraft,
  }),
}));

// Mock SweetAlert
const mockShowError = vi.fn();
vi.mock('@/components/SweetAlertProvider', () => ({
  showError: (...args: unknown[]) => mockShowError(...args),
}));

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

describe('NoteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraft = null;
  });

  it('renders three input fields and submit button in create mode', () => {
    render(<NoteForm mode="create" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/nama item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/qty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/harga satuan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
  });

  it('does not show cancel button in create mode', () => {
    render(<NoteForm mode="create" onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /batal/i })).not.toBeInTheDocument();
  });

  it('shows cancel button in edit mode', () => {
    const onCancel = vi.fn();
    render(
      <NoteForm mode="edit" initialData={sampleNote} onSubmit={vi.fn()} onCancel={onCancel} />,
    );
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
  });

  it('shows "Update" button text in edit mode', () => {
    render(
      <NoteForm mode="edit" initialData={sampleNote} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('pre-fills form with initialData in edit mode', () => {
    render(
      <NoteForm mode="edit" initialData={sampleNote} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByLabelText(/nama item/i)).toHaveValue('Beras 5kg');
    expect(screen.getByLabelText(/qty/i)).toHaveValue('2');
    expect(screen.getByLabelText(/harga satuan/i)).toHaveValue('65.000');
  });

  it('loads draft in create mode', () => {
    mockDraft = { itemName: 'Susu', quantity: '3', unitPrice: '15000' };
    render(<NoteForm mode="create" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/nama item/i)).toHaveValue('Susu');
    expect(screen.getByLabelText(/qty/i)).toHaveValue('3');
    expect(screen.getByLabelText(/harga satuan/i)).toHaveValue('15000');
  });

  it('calls setDraft on field change in create mode', () => {
    render(<NoteForm mode="create" onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nama item/i), { target: { value: 'Telur' } });
    expect(mockSetDraft).toHaveBeenCalledWith({
      itemName: 'Telur',
      quantity: '',
      unitPrice: '',
    });
  });

  it('does not call setDraft on field change in edit mode', () => {
    render(
      <NoteForm mode="edit" initialData={sampleNote} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/nama item/i), { target: { value: 'Gula' } });
    expect(mockSetDraft).not.toHaveBeenCalled();
  });

  it('calls showError when validation fails on submit', () => {
    render(<NoteForm mode="create" onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));
    expect(mockShowError).toHaveBeenCalledWith('Validasi Gagal', expect.any(String));
  });

  it('calls onSubmit with valid data and clears draft', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NoteForm mode="create" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nama item/i), { target: { value: 'Beras' } });
    fireEvent.change(screen.getByLabelText(/qty/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/harga satuan/i), { target: { value: '50000' } });

    fireEvent.click(screen.getByRole('button', { name: /simpan/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        itemName: 'Beras',
        quantity: 2,
        unitPrice: 50000,
      });
      expect(mockClearDraft).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked in edit mode', () => {
    const onCancel = vi.fn();
    render(
      <NoteForm mode="edit" initialData={sampleNote} onSubmit={vi.fn()} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /batal/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
