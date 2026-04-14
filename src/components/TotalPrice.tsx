'use client';

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { formatCurrency } from '@/lib/formatCurrency';

interface TotalPriceProps {
  total: number;
  gradient?: string;
}

export default function TotalPrice({ total, gradient = 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }: TotalPriceProps) {
  return (
    <Paper elevation={0} className="mt-5" sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', background: gradient, overflow: 'hidden' }}>
      <Box className="flex flex-col items-center justify-center py-6 px-5 gap-2">
        <AccountBalanceWalletIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 40 }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: '0.75rem' }}>
          Total Belanja
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
          {formatCurrency(total)}
        </Typography>
      </Box>
    </Paper>
  );
}
