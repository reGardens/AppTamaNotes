import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TotalPrice from '../TotalPrice';

describe('TotalPrice', () => {
  it('renders total in Rupiah format', () => {
    render(<TotalPrice total={130000} />);
    expect(screen.getByText(/Rp 130\.000/)).toBeInTheDocument();
  });

  it('renders zero total', () => {
    render(<TotalPrice total={0} />);
    expect(screen.getByText(/Rp 0/)).toBeInTheDocument();
  });

  it('renders large total with thousand separators', () => {
    render(<TotalPrice total={1500000} />);
    expect(screen.getByText(/Rp 1\.500\.000/)).toBeInTheDocument();
  });
});
