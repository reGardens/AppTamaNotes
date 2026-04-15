'use client';

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, AppBar, Toolbar, Typography, Button, Box, CircularProgress, Skeleton,
  Paper, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import { useAuthStore } from '@/store/authStore';
import { useNotesStore } from '@/store/notesStore';
import { useFormStore } from '@/store/formStore';
import { useThemeStore } from '@/store/themeStore';
import { getUserTheme } from '@/lib/userTheme';
import NoteForm from '@/components/NoteForm';
import NoteList from '@/components/NoteList';
import TotalPrice from '@/components/TotalPrice';
import ExportButton from '@/components/ExportButton';
import ScrollToTop from '@/components/ScrollToTop';
import DarkModeToggle from '@/components/DarkModeToggle';
import MonthPicker from '@/components/MonthPicker';
import { downloadBackup, restoreBackup } from '@/lib/api';
import { showSuccess, showError, showConfirm, showInfo, showConfirmHtml } from '@/components/SweetAlertProvider';
import { animateOut } from '@/animations/gsapAnimations';
import { calculateTotal } from '@/lib/calculateTotal';
import type { ShoppingNote } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const checkSession = useAuthStore((s) => s.checkSession);
  const notes = useNotesStore((s) => s.notes);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const editingId = useFormStore((s) => s.editingId);
  const setEditingId = useFormStore((s) => s.setEditingId);
  const clearDraft = useFormStore((s) => s.clearDraft);
  const darkMode = useThemeStore((s) => s.darkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [fetchingNotes, setFetchingNotes] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const theme = getUserTheme(user?.email);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    if (!checkSession()) { showInfo('Sesi Berakhir', 'Silakan login kembali.'); router.push('/login'); return; }
    const iv = setInterval(() => { if (!checkSession()) { showInfo('Sesi Berakhir', 'Silakan login kembali.'); router.push('/login'); } }, 60_000);
    return () => clearInterval(iv);
  }, [hydrated, checkSession, router]);
  useEffect(() => { if (hydrated && !isLoggedIn) router.push('/login'); }, [hydrated, isLoggedIn, router]);
  useEffect(() => { if (user?.id) { setFetchingNotes(true); fetchNotes(user.id).finally(() => setFetchingNotes(false)); } }, [user?.id, fetchNotes]);

  const filteredNotes = useMemo(() => {
    if (!selectedMonth) return notes;
    const [y, m] = selectedMonth.split('-').map(Number);
    return [...notes.filter((n) => { const d = new Date(n.createdAt); return d.getFullYear() === y && d.getMonth() + 1 === m; })].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, selectedMonth]);

  const filteredTotal = useMemo(() => calculateTotal(filteredNotes), [filteredNotes]);

  // Check if selected month is older than 3 months (archived)
  const isArchivedMonth = useMemo(() => {
    if (!selectedMonth) return false;
    const [y, m] = selectedMonth.split('-').map(Number);
    const selected = new Date(y, m - 1, 1);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    cutoff.setDate(1);
    return selected < cutoff;
  }, [selectedMonth]);

  const editingNote: ShoppingNote | undefined = editingId ? filteredNotes.find((n) => n.id === editingId) : undefined;

  const handleSubmit = useCallback(async (data: { itemName: string; quantity: number; unitPrice: number }) => {
    try {
      if (editingId) { await updateNote(editingId, data); setEditingId(null); showSuccess('Berhasil', 'Catatan diperbarui'); }
      else if (user?.id) { await addNote({ userId: user.id, ...data }); showSuccess('Berhasil', 'Catatan ditambahkan'); }
    } catch { showError('Gagal', 'Terjadi kesalahan'); }
  }, [editingId, user?.id, updateNote, addNote, setEditingId]);

  const handleEdit = useCallback((id: string) => { setEditingId(id); }, [setEditingId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!await showConfirmHtml('Hapus Catatan', 'Yakin ingin menghapus?<br/><br/><b>Apakah sudah melakukan export data?</b>')) return;
    try { const el = listContainerRef.current?.querySelector(`[data-note-id="${id}"]`) as HTMLElement | null; if (el) await animateOut(el); await deleteNote(id); showSuccess('Berhasil', 'Catatan dihapus'); }
    catch { showError('Gagal', 'Terjadi kesalahan'); }
  }, [deleteNote]);

  const handleBatchDelete = useCallback(async (ids: string[]) => {
    if (!await showConfirmHtml('Hapus Catatan', `Hapus ${ids.length} catatan?<br/><br/><b>Apakah sudah melakukan export data?</b>`)) return;
    try { for (const id of ids) await deleteNote(id); showSuccess('Berhasil', `${ids.length} catatan dihapus`); }
    catch { showError('Gagal', 'Terjadi kesalahan'); }
  }, [deleteNote]);

  const handleBatchEdit = useCallback(async (updates: { id: string; itemName: string; quantity: number; unitPrice: number }[]) => {
    try { for (const u of updates) await updateNote(u.id, { itemName: u.itemName, quantity: u.quantity, unitPrice: u.unitPrice }); showSuccess('Berhasil', `${updates.length} catatan diperbarui`); }
    catch { showError('Gagal', 'Terjadi kesalahan'); }
  }, [updateNote]);

  const handleCancelEdit = useCallback(() => { setEditingId(null); clearDraft(); }, [setEditingId, clearDraft]);

  const handleBackup = useCallback(() => {
    setMenuAnchor(null);
    downloadBackup();
    showSuccess('Backup berhasil', 'File backup telah diunduh');
  }, []);

  const handleRestore = useCallback(() => {
    setMenuAnchor(null);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const result = restoreBackup(text);
      if (result.success) {
        showSuccess('Restore berhasil', `${result.count} catatan berhasil dipulihkan`);
        if (user?.id) fetchNotes(user.id);
      } else {
        showError('Restore gagal', result.error || 'File tidak valid');
      }
    };
    input.click();
  }, [user?.id, fetchNotes]);

  const handleLogout = useCallback(async () => {
    if (!await showConfirm('Logout', 'Yakin ingin keluar?')) return;
    setLoggingOut(true); await logout(); router.push('/login');
  }, [logout, router]);

  if (!isLoggedIn || !user) return null;

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: darkMode ? '#1e293b' : '#fff', borderBottom: `2px solid ${darkMode ? '#334155' : theme.primary + '20'}` }}>
        <Toolbar className="flex justify-between">
          <Box className="flex items-center gap-2">
            <Typography sx={{ fontSize: 24 }}>🛒</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: theme.primary }}>Pratama Notes</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Typography variant="body2" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>{user.email}</Typography>
            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={handleBackup}><ListItemIcon><BackupIcon fontSize="small" sx={{ color: '#16a34a' }} /></ListItemIcon><ListItemText>Backup Data</ListItemText></MenuItem>
              <MenuItem onClick={handleRestore}><ListItemIcon><RestoreIcon fontSize="small" sx={{ color: '#3b82f6' }} /></ListItemIcon><ListItemText>Restore Data</ListItemText></MenuItem>
            </Menu>
            <Button variant="outlined" size="small" startIcon={loggingOut ? <CircularProgress size={16} /> : <LogoutIcon />} onClick={handleLogout} disabled={loggingOut}
              sx={{ borderRadius: 2, textTransform: 'none', borderColor: darkMode ? '#475569' : '#e2e8f0', color: darkMode ? '#94a3b8' : '#64748b', '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}>
              {loggingOut ? 'Keluar...' : 'Logout'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" className="py-6 px-4 sm:px-6">
        <Typography variant="h6" fontWeight={700} sx={{ color: theme.primary, mb: 3 }}>{theme.greeting}</Typography>

        <Box className="mb-5">
          <NoteForm mode={editingId ? 'edit' : 'create'} initialData={editingNote} onSubmit={handleSubmit} onCancel={editingId ? handleCancelEdit : undefined} themeColor={theme.primary} themeHover={theme.primaryHover} />
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', p: 2, mb: 2 }}>
          <Box className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} themeColor={theme.primary} />
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <ExportButton notes={filteredNotes} disabled={!selectedMonth || filteredNotes.length === 0} themeColor={theme.primary} themeHover={theme.primaryHover} />
            </Box>
          </Box>
        </Paper>

        <div ref={listContainerRef}>
          {fetchingNotes ? (
            <Box className="flex flex-col gap-3"><Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} /><Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} /><Skeleton variant="rounded" height={48} sx={{ borderRadius: 2 }} /></Box>
          ) : (
            <NoteList notes={filteredNotes} onEdit={handleEdit} onDelete={handleDelete} onBatchDelete={handleBatchDelete} onBatchEdit={handleBatchEdit} themeColor={theme.primary} isArchived={isArchivedMonth} />
          )}
        </div>

        <TotalPrice total={filteredTotal} gradient={theme.gradient} />
        <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', mt: 4, display: 'block', pb: 2 }}>Pratama Notes · v1.0.0</Typography>
      </Container>
      <ScrollToTop themeColor={theme.primary} />
    </Box>
  );
}
