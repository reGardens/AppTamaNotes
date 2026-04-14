'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from 'next/link';
import { resetPassword } from '@/lib/api';
import { validatePassword } from '@/lib/validatePassword';
import { showSuccess, showError } from '@/components/SweetAlertProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validatePassword(newPassword);
    if (!v.valid) { showError('Validasi Gagal', v.errors[0]); return; }
    if (newPassword !== confirmPassword) { showError('Validasi Gagal', 'Password baru dan konfirmasi tidak cocok'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(email, newPassword);
      if (res.success) { await showSuccess('Password Berhasil Diubah'); router.push('/login'); }
      else showError('Reset Gagal', res.error || 'Terjadi kesalahan');
    } catch { showError('Reset Gagal', 'Terjadi kesalahan jaringan'); }
    finally { setLoading(false); }
  };

  const pwAdornment = (show: boolean, toggle: () => void) => (
    <InputAdornment position="end">
      <IconButton aria-label="toggle password visibility" onClick={toggle} edge="end" size="small">
        {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <Box className="min-h-screen flex items-center justify-center px-4" sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box className="text-center mb-8">
          <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LockResetIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>Reset Password</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>Masukkan email dan password baru</Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 4, p: { xs: 3, sm: 5 }, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} placeholder="nama@email.com" InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }} sx={inputSx} />
            <TextField label="Password Baru" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} placeholder="Min. 8 karakter" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>, endAdornment: pwAdornment(showNew, () => setShowNew(!showNew)) }} sx={inputSx} />
            <TextField label="Konfirmasi Password" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} placeholder="Ulangi password baru" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>, endAdornment: pwAdornment(showConfirm, () => setShowConfirm(!showConfirm)) }} sx={inputSx} />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ borderRadius: 2, py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', '&:hover': { background: 'linear-gradient(135deg, #d97706, #dc2626)' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
            <Box className="text-center">
              <Link href="/login" style={{ color: '#7c3aed', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Kembali ke Login</Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
