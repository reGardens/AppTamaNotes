'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { showSuccess, showError } from '@/components/SweetAlertProvider';
import { registerServiceWorker } from '@/lib/registerSW';
import { getLoginBgFromEmail } from '@/lib/userTheme';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const login = useAuthStore((s) => s.login);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const darkMode = useThemeStore((s) => s.darkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);
  const router = useRouter();

  useEffect(() => { registerServiceWorker(); }, []);
  useEffect(() => { if (isLoggedIn) router.replace('/dashboard'); }, [isLoggedIn, router]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setBgGradient(getLoginBgFromEmail(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) { await showSuccess('Login Berhasil'); router.push('/dashboard'); }
      else showError('Login Gagal', 'Email atau password salah');
    } catch { showError('Login Gagal', 'Email atau password salah'); }
    finally { setLoading(false); }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: darkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.9)',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? '#334155' : '#e2e8f0' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? '#475569' : '#cbd5e1' },
    },
    '& .MuiOutlinedInput-input': { py: 1.5, px: 1.5 },
  };

  return (
    <Box className="min-h-screen flex items-center justify-center px-4 py-8" sx={{ background: bgGradient, transition: 'background 0.5s ease' }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box className="text-center mb-10">
          <Box sx={{ width: 80, height: 80, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: 40 }}>🛒</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.5px' }}>Pratama Notes</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>Catat belanjaan dengan mudah</Typography>
        </Box>

        <Box sx={{ bgcolor: darkMode ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 4, p: { xs: 3, sm: 5 }, boxShadow: '0 25px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
          {/* Dark mode toggle - iOS style like dashboard */}
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
          </Box>

          <Typography variant="h6" fontWeight={700} sx={{ color: darkMode ? '#e2e8f0' : '#1e293b', mb: 0.5 }}>Selamat Datang</Typography>
          <Typography variant="body2" sx={{ color: darkMode ? '#94a3b8' : '#64748b', mb: 3 }}>Masuk ke akun Anda untuk melanjutkan</Typography>

          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField label="Email" type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)}
              required fullWidth InputLabelProps={{ shrink: true }} placeholder="nama@email.com"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
              sx={inputSx} />
            <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              required fullWidth InputLabelProps={{ shrink: true }} placeholder="Masukkan password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
              }}
              sx={inputSx} />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
              sx={{ borderRadius: 2, py: 1.5, textTransform: 'uppercase', fontSize: '1rem', fontWeight: 700, letterSpacing: 1, background: bgGradient, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'background 0.5s ease', '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.3)' } }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'MASUK'}
            </Button>
            <Box className="text-center">
              <Link href="/forgot-password" style={{ color: '#7c3aed', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>Lupa Password?</Link>
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', mt: 4, display: 'block' }}>© 2025 Pratama Notes · v1.0.0</Typography>
      </Box>
    </Box>
  );
}
