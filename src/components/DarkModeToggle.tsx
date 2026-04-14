'use client';

import React from 'react';
import { Box } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface Props { darkMode: boolean; onToggle: () => void }

export default function DarkModeToggle({ darkMode, onToggle }: Props) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        width: 56, height: 28, borderRadius: 14, position: 'relative', cursor: 'pointer',
        bgcolor: darkMode ? '#4338ca' : '#e2e8f0',
        transition: 'background-color 0.3s ease',
        display: 'flex', alignItems: 'center', px: '3px',
        '&:hover': { opacity: 0.9 },
      }}
      role="switch"
      aria-checked={darkMode}
      aria-label="Toggle dark mode"
    >
      <Box sx={{
        width: 22, height: 22, borderRadius: '50%', bgcolor: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: darkMode ? 'translateX(28px)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}>
        {darkMode
          ? <DarkModeIcon sx={{ fontSize: 14, color: '#4338ca' }} />
          : <LightModeIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
        }
      </Box>
    </Box>
  );
}
