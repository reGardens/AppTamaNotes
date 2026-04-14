import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportButton from '../ExportButton';
import type { ShoppingNote } from '@/types';

vi.mock('@/lib/exportToExcel', () => ({ exportToExcel: vi.fn() }));
vi.mock('@/lib/formatCurrency', () => ({ formatCurrency: vi.fn((n: number) => `Rp ${n}`) }));
vi.mock('@/components/SweetAlertProvider', () => ({ showInfo: vi.fn(), showSuccess: vi.fn() }));

import { exportToExcel } from '@/lib/exportToExcel';
import { showInfo } from '@/components/SweetAlertProvider';

beforeEach(() => { vi.clearAllMocks(); });

const sampleNotes: ShoppingNote[] = [{
  id: 'note-1', userId: 'user-1', itemName: 'Beras 5kg', quantity: 2, unitPrice: 65000, subtotal: 130000,
  createdAt: '2025-01-15T10:30:00.000Z', updatedAt: '2025-01-15T10:30:00.000Z',
}];

describe('ExportButton', () => {
  it('renders button', () => {
    render(<ExportButton notes={sampleNotes} disabled={false} />);
    expect(screen.getByRole('button', { name: /ekspor/i })).toBeInTheDocument();
  });

  it('button is disabled when disabled prop is true', () => {
    render(<ExportButton notes={sampleNotes} disabled={true} />);
    expect(screen.getByRole('button', { name: /ekspor/i })).toBeDisabled();
  });

  it('opens menu and exports excel when clicked', async () => {
    vi.useRealTimers();
    render(<ExportButton notes={sampleNotes} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /ekspor/i }));
    const excelItem = await screen.findByText(/unduh excel/i);
    fireEvent.click(excelItem);
    await waitFor(() => { expect(exportToExcel).toHaveBeenCalledWith(sampleNotes); });
  });

  it('shows info when notes is empty', () => {
    render(<ExportButton notes={[]} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /ekspor/i }));
    expect(showInfo).toHaveBeenCalled();
    expect(exportToExcel).not.toHaveBeenCalled();
  });

  it('renders FileDownload icon', () => {
    render(<ExportButton notes={sampleNotes} disabled={false} />);
    expect(screen.getByTestId('FileDownloadIcon')).toBeInTheDocument();
  });
});
