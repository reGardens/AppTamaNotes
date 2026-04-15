'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, Chip, Checkbox, Button, Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArchiveIcon from '@mui/icons-material/Archive';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatAmount } from '@/lib/formatAmount';
import { formatDateTime, isOlderThanMonths } from '@/lib/formatTime';
import { exportToExcel } from '@/lib/exportToExcel';
import { animateIn } from '@/animations/gsapAnimations';
import type { ShoppingNote } from '@/types';

interface NoteListProps {
  notes: ShoppingNote[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchEdit?: (updates: { id: string; itemName: string; quantity: number; unitPrice: number }[]) => void;
  themeColor?: string;
  /** If true, show archive download instead of editable table */
  isArchived?: boolean;
}

export default function NoteList({ notes, onEdit, onDelete, onBatchDelete, onBatchEdit, themeColor = '#3b82f6', isArchived = false }: NoteListProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ id: string; itemName: string; quantity: string; unitPrice: string }[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const prevNoteIdsRef = useRef<Set<string>>(new Set());

  const setRowRef = useCallback((id: string, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(id, el); else rowRefs.current.delete(id);
  }, []);

  useEffect(() => {
    const prevIds = prevNoteIdsRef.current;
    for (const note of notes) { if (!prevIds.has(note.id)) { const el = rowRefs.current.get(note.id); if (el) animateIn(el); } }
    prevNoteIdsRef.current = new Set(notes.map((n) => n.id));
  }, [notes]);

  useEffect(() => { const maxPage = Math.max(0, Math.ceil(notes.length / rowsPerPage) - 1); if (page > maxPage) setPage(maxPage); }, [notes.length, rowsPerPage, page]);

  useEffect(() => { const ids = new Set(notes.map((n) => n.id)); setSelected((prev) => { const next = new Set<string>(); prev.forEach((id) => { if (ids.has(id)) next.add(id); }); return next; }); }, [notes]);

  const paginatedNotes = notes.length > 0 ? notes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];
  const pageIds = paginatedNotes.map((n) => n.id);

  const toggleSelect = (id: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  // Unselect all clears ALL selected (visible + non-visible)
  const toggleSelectAll = () => {
    const allPageSelected = pageIds.every((id) => selected.has(id));
    if (allPageSelected) {
      // Clear ALL selections, not just current page
      setSelected(new Set());
    } else {
      setSelected((prev) => { const next = new Set(prev); pageIds.forEach((id) => next.add(id)); return next; });
    }
  };

  const handleOpenEdit = (ids: string[]) => {
    const items = ids.map((id) => { const n = notes.find((x) => x.id === id); return n ? { id: n.id, itemName: n.itemName, quantity: String(n.quantity), unitPrice: String(n.unitPrice) } : null; }).filter(Boolean) as { id: string; itemName: string; quantity: string; unitPrice: string }[];
    setEditingNotes(items); setEditModalOpen(true);
  };
  const handleEditChange = (idx: number, field: string, value: string) => setEditingNotes((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      if (onBatchEdit) { await onBatchEdit(editingNotes.map((e) => ({ id: e.id, itemName: e.itemName, quantity: Number(e.quantity), unitPrice: Number(e.unitPrice) }))); }
      else { const e = editingNotes[0]; if (e) onEdit(e.id); }
      setEditModalOpen(false); setSelected(new Set());
    } finally { setEditSaving(false); }
  };

  if (notes.length === 0) {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} className="p-8">
        <Box className="flex flex-col items-center gap-3 text-center">
          <ShoppingBagIcon sx={{ fontSize: 48, color: '#94a3b8' }} />
          <Typography variant="body1" color="text.secondary">Belum ada catatan belanja</Typography>
          <Typography variant="body2" color="text.secondary">Tambahkan item pertama Anda di form di atas</Typography>
        </Box>
      </Paper>
    );
  }

  // Archived months: show download prompt instead of full table
  if (isArchived && notes.length > 0) {
    return (
      <Paper elevation={0} sx={(t) => ({ borderRadius: 3, boxShadow: t.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' })} className="p-6">
        <Box className="flex flex-col items-center gap-4 text-center">
          <ArchiveIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
          <Typography variant="body1" fontWeight={600}>Data bulan ini telah diarsipkan</Typography>
          <Typography variant="body2" color="text.secondary">
            Terdapat {notes.length} catatan pada bulan ini. Data yang lebih dari 3 bulan otomatis diarsipkan untuk menjaga performa aplikasi.
          </Typography>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportToExcel(notes)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: themeColor, color: '#fff', '&:hover': { bgcolor: themeColor, opacity: 0.9 } }}
          >
            Unduh Data Excel (.xlsx)
          </Button>
          <Typography variant="caption" color="text.secondary">
            Silakan unduh file Excel untuk melihat detail catatan bulan ini
          </Typography>
        </Box>
      </Paper>
    );
  }

  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const totalPages = Math.ceil(notes.length / rowsPerPage);
  const from = page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, notes.length);
  const nw = { whiteSpace: 'nowrap' } as const;
  const hd = { fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' as const, ...nw };

  return (
    <>
    <Paper elevation={0} sx={(t) => ({ borderRadius: 3, boxShadow: t.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' })}>
      <Box className="px-4 py-3 flex items-center justify-between flex-wrap gap-2" sx={(t) => ({ borderBottom: `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}` })}>
        <Box className="flex items-center gap-2">
          <Typography variant="subtitle1" fontWeight={600}>📋 Daftar Belanja</Typography>
          <Chip label={`${notes.length} item`} size="small" sx={{ bgcolor: `${themeColor}15`, color: themeColor, fontWeight: 600 }} />
        </Box>
        {selected.size > 0 && (
          <Box className="flex gap-2">
            <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => handleOpenEdit(Array.from(selected))} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: themeColor, color: themeColor }}>Edit {selected.size}</Button>
            {onBatchDelete && <Button size="small" variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => onBatchDelete(Array.from(selected))} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Hapus {selected.size}</Button>}
          </Box>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={(t) => ({ bgcolor: t.palette.mode === 'dark' ? '#1a2332' : '#f8fafc' })}>
              <TableCell padding="checkbox"><Checkbox checked={allPageSelected} indeterminate={somePageSelected && !allPageSelected} onChange={toggleSelectAll} size="small" sx={{ color: themeColor, '&.Mui-checked': { color: themeColor }, '&.MuiCheckbox-indeterminate': { color: themeColor } }} /></TableCell>
              <TableCell sx={hd}>No</TableCell>
              <TableCell sx={hd}>Nama Item</TableCell>
              <TableCell align="center" sx={hd}>Qty</TableCell>
              <TableCell align="right" sx={hd}>Harga</TableCell>
              <TableCell align="right" sx={hd}>Subtotal</TableCell>
              <TableCell align="center" sx={hd}>Waktu</TableCell>
              <TableCell align="center" sx={hd}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedNotes.map((note, index) => (
              <TableRow key={note.id} data-note-id={note.id} ref={(el) => setRowRef(note.id, el)} hover selected={selected.has(note.id)} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell padding="checkbox"><Checkbox checked={selected.has(note.id)} onChange={() => toggleSelect(note.id)} size="small" sx={{ color: themeColor, '&.Mui-checked': { color: themeColor } }} /></TableCell>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem', ...nw }}>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 500, ...nw }}>{note.itemName}</TableCell>
                <TableCell align="center" sx={nw}>{formatAmount(note.quantity)}</TableCell>
                <TableCell align="right" sx={{ color: '#64748b', ...nw }}>{formatCurrency(note.unitPrice)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: themeColor, ...nw }}>{formatCurrency(note.subtotal)}</TableCell>
                <TableCell align="center" sx={{ color: '#94a3b8', fontSize: '0.8rem', ...nw }}>{formatDateTime(note.createdAt)}</TableCell>
                <TableCell align="center" sx={nw}>
                  <IconButton size="small" onClick={() => handleOpenEdit([note.id])} aria-label="edit" sx={{ color: themeColor }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete(note.id)} aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={(t) => ({ borderTop: `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}`, px: 2, py: 1.5 })} className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <Box className="flex items-center gap-2">
          <Typography variant="body2" sx={{ color: '#64748b', ...nw }}>Per halaman:</Typography>
          <FormControl size="small" variant="standard">
            <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} disableUnderline sx={{ fontSize: '0.875rem' }}>
              {[5, 10, 25].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box className="flex items-center gap-2">
          <Typography variant="body2" sx={{ color: '#64748b' }}>{from}-{to} dari {notes.length}</Typography>
          <IconButton size="small" disabled={page === 0} onClick={() => setPage(page - 1)}><NavigateBeforeIcon fontSize="small" /></IconButton>
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><NavigateNextIcon fontSize="small" /></IconButton>
        </Box>
      </Box>
    </Paper>

    <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth scroll="paper" disableScrollLock={false}>
      <DialogTitle sx={{ fontWeight: 700 }}>✏️ Edit Catatan {editingNotes.length > 1 ? `(${editingNotes.length} item)` : ''}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {editingNotes.map((item, idx) => (
          <Box key={item.id} sx={{ mb: editingNotes.length > 1 ? 3 : 0, pb: editingNotes.length > 1 ? 2 : 0, borderBottom: idx < editingNotes.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
            {editingNotes.length > 1 && <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1, display: 'block' }}>Item {idx + 1}</Typography>}
            <Box className="flex flex-col gap-3">
              <TextField label="Nama Item" value={item.itemName} onChange={(e) => handleEditChange(idx, 'itemName', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
              <Box className="flex gap-3">
                <TextField label="Qty" type="number" value={item.quantity} onChange={(e) => handleEditChange(idx, 'quantity', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
                <TextField label="Harga Satuan (Rp)" type="number" value={item.unitPrice} onChange={(e) => handleEditChange(idx, 'unitPrice', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} />
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => setEditModalOpen(false)} sx={{ textTransform: 'none' }}>Batal</Button>
        <Button variant="contained" onClick={handleEditSave} disabled={editSaving} startIcon={editSaving ? <CircularProgress size={16} color="inherit" /> : <EditIcon />} sx={{ textTransform: 'none', bgcolor: themeColor, '&:hover': { bgcolor: themeColor }, color: '#fff' }}>
          {editSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
