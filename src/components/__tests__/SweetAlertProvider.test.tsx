import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sweetalert2', () => {
  const fire = vi.fn().mockResolvedValue({ isConfirmed: false });
  return {
    default: {
      fire,
      mixin: vi.fn(() => ({ fire })),
      stopTimer: vi.fn(),
      resumeTimer: vi.fn(),
    },
  };
});

import Swal from 'sweetalert2';
import { showError, showConfirm, showInfo } from '../SweetAlertProvider';

describe('SweetAlertProvider helpers', () => {
  beforeEach(() => { (Swal.fire as ReturnType<typeof vi.fn>).mockClear(); });

  it('showError calls Swal.fire with error icon', async () => {
    await showError('Gagal');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Gagal' }));
  });

  it('showConfirm calls Swal.fire with warning icon', async () => {
    await showConfirm('Hapus?', 'Yakin?');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning', title: 'Hapus?' }));
  });

  it('showInfo calls Swal.fire with info icon', async () => {
    await showInfo('Info');
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'info', title: 'Info' }));
  });
});
