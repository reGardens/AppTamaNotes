'use client';

import React, { useState } from 'react';
import { Button, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableChartIcon from '@mui/icons-material/TableChart';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { showInfo, showSuccess, showError } from '@/components/SweetAlertProvider';
import { exportToExcel, exportToExcelBase64 } from '@/lib/exportToExcel';
import type { ShoppingNote } from '@/types';

interface ExportButtonProps {
  notes: ShoppingNote[];
  disabled: boolean;
  themeColor?: string;
  themeHover?: string;
}

export default function ExportButton({ notes, disabled, themeColor = '#10b981', themeHover = '#059669' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || notes.length === 0) { showInfo('Pilih bulan terlebih dahulu atau belum ada data'); return; }
    setAnchorEl(e.currentTarget);
  };

  const handleExcel = async () => {
    setAnchorEl(null); setExporting(true);
    try { await new Promise((r) => setTimeout(r, 300)); exportToExcel(notes); showSuccess('Berhasil', 'File Excel berhasil diunduh'); }
    finally { setExporting(false); }
  };

  const handleWhatsApp = async () => {
    setAnchorEl(null); setExporting(true);
    try {
      // Generate and download Excel first
      const base64 = exportToExcelBase64(notes);
      const byteChars = atob(base64);
      const byteArray = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const today = new Date();
      const fileName = `Daftar_Belanja_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;
      const file = new File([blob], fileName, { type: blob.type });

      // Try native share (works on mobile)
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Daftar Belanja' });
          showSuccess('Berhasil', 'File berhasil dibagikan');
          return;
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
          // Fall through to desktop fallback
        }
      }

      // Desktop fallback: download file, then open WhatsApp Web
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Small delay then open WhatsApp Web
      await new Promise((r) => setTimeout(r, 500));
      window.open('https://web.whatsapp.com/', '_blank');
      showSuccess('File diunduh', 'Lampirkan file Excel yang sudah diunduh di WhatsApp');
    } catch {
      showError('Gagal', 'Tidak dapat membagikan file');
    } finally { setExporting(false); }
  };

  return (
    <>
      <Button variant="contained" startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />} endIcon={<ArrowDropDownIcon />} disabled={disabled || exporting} onClick={handleOpen}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: themeColor, color: '#fff', '&:hover': { bgcolor: themeHover }, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}>
        {exporting ? 'Memproses...' : 'Ekspor / Bagikan'}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleExcel}><ListItemIcon><TableChartIcon fontSize="small" sx={{ color: '#16a34a' }} /></ListItemIcon><ListItemText>Unduh Excel (.xlsx)</ListItemText></MenuItem>
        <MenuItem onClick={handleWhatsApp}><ListItemIcon><WhatsAppIcon fontSize="small" sx={{ color: '#25d366' }} /></ListItemIcon><ListItemText>Kirim via WhatsApp</ListItemText></MenuItem>
      </Menu>
    </>
  );
}
