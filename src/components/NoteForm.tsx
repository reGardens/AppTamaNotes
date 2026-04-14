'use client';

import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Paper, Typography, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useFormStore } from '@/store/formStore';
import { validateNote } from '@/lib/validateNote';
import { showError } from '@/components/SweetAlertProvider';
import { formatAmount, parseAmount } from '@/lib/formatAmount';
import type { ShoppingNote } from '@/types';

interface NoteFormProps {
  mode: 'create' | 'edit';
  initialData?: ShoppingNote;
  onSubmit: (data: { itemName: string; quantity: number; unitPrice: number }) => void;
  onCancel?: () => void;
  themeColor?: string;
  themeHover?: string;
}

export default function NoteForm({ mode, initialData, onSubmit, onCancel, themeColor = '#3b82f6', themeHover = '#2563eb' }: NoteFormProps) {
  const { draft, setDraft, clearDraft } = useFormStore();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setItemName(initialData.itemName);
      setQuantity(formatAmount(initialData.quantity));
      setUnitPrice(formatAmount(initialData.unitPrice));
    } else if (mode === 'create' && draft) {
      setItemName(draft.itemName);
      setQuantity(draft.quantity);
      setUnitPrice(draft.unitPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData]);

  const updateDraft = (name: string, qty: string, price: string) => {
    if (mode === 'create') setDraft({ itemName: name, quantity: qty, unitPrice: price });
  };

  const handleAmountChange = (raw: string, setter: (v: string) => void, field: 'qty' | 'price') => {
    const digits = raw.replace(/\D/g, '');
    const num = parseInt(digits, 10);
    const formatted = isNaN(num) || num === 0 ? '' : formatAmount(num);
    setter(formatted);
    if (field === 'qty') updateDraft(itemName, formatted, unitPrice);
    else updateDraft(itemName, quantity, formatted);
  };

  const handleReset = () => { setItemName(''); setQuantity(''); setUnitPrice(''); clearDraft(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseAmount(quantity);
    const parsedPrice = parseAmount(unitPrice);
    const validation = validateNote({ userId: '', itemName, quantity: parsedQty, unitPrice: parsedPrice });
    if (!validation.valid) { showError('Validasi Gagal', validation.errors.join('\n')); return; }
    setSaving(true);
    try {
      await onSubmit({ itemName: itemName.trim(), quantity: parsedQty, unitPrice: parsedPrice });
      setItemName(''); setQuantity(''); setUnitPrice(''); clearDraft();
    } finally { setSaving(false); }
  };

  const hasContent = itemName || quantity || unitPrice;

  return (
    <Paper elevation={0} sx={(t) => ({ borderRadius: 3, boxShadow: t.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)', border: mode === 'edit' ? `2px solid ${themeColor}` : 'none', overflow: 'hidden' })}>
      <Box sx={(t) => ({ px: 3, py: 1.5, bgcolor: mode === 'edit' ? themeColor : 'transparent', borderBottom: mode === 'edit' ? 'none' : `1px solid ${t.palette.mode === 'dark' ? '#334155' : '#e2e8f0'}` })}>
        <Typography variant="subtitle1" fontWeight={600} sx={(t) => ({ color: mode === 'edit' ? '#fff' : t.palette.text.primary })}>
          {mode === 'edit' ? '✏️ Edit Catatan' : '➕ Tambah Catatan Baru'}
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, pt: 2.5 }} className="flex flex-col gap-4">
        <TextField label="Nama Item" placeholder="Contoh: Beras 5kg" value={itemName} onChange={(e) => { setItemName(e.target.value); updateDraft(e.target.value, quantity, unitPrice); }} fullWidth variant="outlined" size="small" InputLabelProps={{ shrink: true }} />
        <Box className="flex flex-col sm:flex-row gap-3">
          <TextField label="Qty" placeholder="0" value={quantity} onChange={(e) => handleAmountChange(e.target.value, setQuantity, 'qty')} fullWidth variant="outlined" size="small" InputLabelProps={{ shrink: true }} inputMode="numeric" />
          <TextField label="Harga Satuan (Rp)" placeholder="0" value={unitPrice} onChange={(e) => handleAmountChange(e.target.value, setUnitPrice, 'price')} fullWidth variant="outlined" size="small" InputLabelProps={{ shrink: true }} inputMode="numeric" />
        </Box>
        <Box className="flex gap-3 justify-end">
          {mode === 'edit' && onCancel && (
            <Button type="button" variant="outlined" onClick={onCancel} startIcon={<CloseIcon />} sx={{ borderRadius: 2, textTransform: 'none' }}>Batal</Button>
          )}
          {mode === 'create' && hasContent && (
            <Button type="button" variant="outlined" onClick={handleReset} startIcon={<RestartAltIcon />} sx={{ borderRadius: 2, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, color: '#94a3b8', borderColor: '#cbd5e1' }}>
              RESET
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : mode === 'edit' ? <EditIcon /> : <SaveIcon />} sx={{ borderRadius: 2, textTransform: 'uppercase', fontWeight: 700, bgcolor: themeColor, color: '#fff', '&:hover': { bgcolor: themeHover }, letterSpacing: 1 }}>
            {saving ? 'MENYIMPAN...' : mode === 'create' ? 'SIMPAN' : 'UPDATE'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
