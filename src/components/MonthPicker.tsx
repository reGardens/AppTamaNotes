'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Popover, ButtonBase } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface MonthPickerProps {
  /** Format: "YYYY-MM" */
  value: string;
  onChange: (value: string) => void;
  themeColor?: string;
}

export default function MonthPicker({ value, onChange, themeColor = '#3b82f6' }: MonthPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [viewYear, setViewYear] = useState(() => {
    const [y] = value.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  const [selYear, selMonth] = value.split('-').map(Number);
  const open = Boolean(anchorEl);

  // Sync viewYear when value changes externally
  useEffect(() => {
    const [y] = value.split('-').map(Number);
    if (y) setViewYear(y);
  }, [value]);

  const handleSelect = (month: number) => {
    const val = `${viewYear}-${String(month).padStart(2, '0')}`;
    onChange(val);
    setAnchorEl(null);
  };

  const displayLabel = `${MONTHS_LONG[selMonth - 1]} ${selYear}`;

  return (
    <>
      <ButtonBase
        ref={btnRef}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={(t) => ({
          display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
          borderRadius: 2,
          border: `1px solid ${t.palette.mode === 'dark' ? '#475569' : '#cbd5e1'}`,
          bgcolor: t.palette.mode === 'dark' ? '#1e293b' : '#fff',
          color: t.palette.text.primary,
          fontSize: '0.875rem', fontWeight: 500,
          width: { xs: '100%', sm: 220 },
          justifyContent: 'flex-start',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: themeColor },
        })}
      >
        <CalendarMonthIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{displayLabel}</Typography>
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: (t) => ({ borderRadius: 3, mt: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}`, overflow: 'hidden', width: 280 }) } }}
      >
        {/* Year navigation */}
        <Box sx={(t) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}` })}>
          <IconButton size="small" onClick={() => setViewYear((y) => y - 1)}><ChevronLeftIcon fontSize="small" /></IconButton>
          <Typography variant="subtitle2" fontWeight={700}>{viewYear}</Typography>
          <IconButton size="small" onClick={() => setViewYear((y) => y + 1)}><ChevronRightIcon fontSize="small" /></IconButton>
        </Box>

        {/* Month grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5, p: 1.5 }}>
          {MONTHS_SHORT.map((label, idx) => {
            const m = idx + 1;
            const isSelected = viewYear === selYear && m === selMonth;
            const isCurrentMonth = viewYear === new Date().getFullYear() && m === new Date().getMonth() + 1;
            return (
              <ButtonBase
                key={m}
                onClick={() => handleSelect(m)}
                sx={{
                  py: 1, px: 0.5, borderRadius: 2, fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? themeColor : 'transparent',
                  color: isSelected ? '#fff' : 'inherit',
                  border: isCurrentMonth && !isSelected ? `1px solid ${themeColor}` : '1px solid transparent',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: isSelected ? themeColor : `${themeColor}15` },
                }}
              >
                {label}
              </ButtonBase>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
