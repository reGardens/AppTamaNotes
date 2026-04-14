'use client';

import React from 'react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function showSuccess(title: string, text?: string) {
  return Toast.fire({ icon: 'success', title, text });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    customClass: { popup: 'rounded-2xl' },
  });
}

export async function showConfirm(title: string, text: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#94a3b8',
    customClass: { popup: 'rounded-2xl' },
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function showInfo(title: string, text?: string) {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    customClass: { popup: 'rounded-2xl' },
  });
}

export async function showConfirmHtml(title: string, html: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    html,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    customClass: { popup: 'rounded-2xl' },
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export default function SweetAlertProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
