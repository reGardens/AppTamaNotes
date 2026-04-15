'use client';

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, AppBar, Toolbar, Typography, Button, Box, CircularProgress, Skeleton,
  Paper, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { downloadBackup, restoreBackup, addUser, getUsers, deleteUser } from '@/lib/api';
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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userList, setUserList] = useState<{ id: string; email: string }[]>([]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const theme = getUserTheme(user?.email);
  const isAdmin = user?.id === 'user-1';

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

  const handleOpenUserDialog = useCallback(() => {
    setMenuAnchor(null);
    setUserList(getUsers());
    setNewEmail(''); setNewPassword('');
    setUserDialogOpen(true);
  }, []);

  const handleAddUser = useCallback(async () => {
    const res = await addUser(newEmail, newPassword);
    if (res.success) { showSuccess('Berhasil', 'User baru ditambahkan'); setUserList(getUsers()); setNewEmail(''); setNewPassword(''); }
    else showError('Gagal', res.error || 'Tidak bisa menambah user');
  }, [newEmail, newPassword]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!await showConfirm('Hapus User', 'Yakin ingin menghapus user ini?')) return;
    const res = await deleteUser(userId);
    if (res.success) { showSuccess('Berhasil', 'User dihapus'); setUserList(getUsers()); }
    else showError('Gagal', res.error || 'Tidak bisa menghapus');
  }, []);

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
              {isAdmin && <MenuItem onClick={handleOpenUserDialog}><ListItemIcon><PersonAddIcon fontSize="small" sx={{ color: '#a855f7' }} /></ListItemIcon><ListItemText>Kelola User</ListItemText></MenuItem>}
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

      {/* User Management Dialog (admin only) */}
      {isAdmin && (
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>👥 Kelola User</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {/* User list */}
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>Daftar User</Typography>
            <Box sx={{ mt: 1, mb: 3 }}>
              {userList.map((u) => (
                <Box key={u.id} sx={(t) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, px: 2, mb: 1, borderRadius: 2, bgcolor: t.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}` })}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{u.email}</Typography>
                    <Typography variant="caption" sx={{ color: u.id === 'user-1' ? '#16a34a' : '#94a3b8' }}>{u.id === 'user-1' ? '👑 Admin' : 'User'}</Typography>
                  </Box>
                  {u.id !== 'user-1' && u.id !== 'user-2' && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}><DeleteIcon fontSize="small" /></IconButton>
                  )}
                </Box>
              ))}
            </Box>

            {/* Add user form */}
            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>Tambah User Baru</Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} placeholder="email@contoh.com" type="email" />
              <TextField label="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} placeholder="Min. 8 karakter" type="password" />
              <Button variant="contained" onClick={handleAddUser} disabled={!newEmail || !newPassword || newPassword.length < 8} fullWidth startIcon={<PersonAddIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: theme.primary, color: '#fff', '&:hover': { bgcolor: theme.primaryHover } }}>
                Tambah User
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setUserDialogOpen(false)} sx={{ textTransform: 'none' }}>Tutup</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
