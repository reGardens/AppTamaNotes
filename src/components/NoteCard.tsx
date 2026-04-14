'use client';

import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatCurrency } from '@/lib/formatCurrency';
import type { ShoppingNote } from '@/types';

interface NoteCardProps {
  note: ShoppingNote;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card elevation={2} className="mb-4">
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Box className="flex-1 min-w-0">
          <Typography variant="h6" component="div">
            {note.itemName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jumlah: {note.quantity} &times; {formatCurrency(note.unitPrice)}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            Subtotal: {formatCurrency(note.subtotal)}
          </Typography>
        </Box>
        <Box className="flex gap-1 self-end sm:self-center">
          <IconButton aria-label="edit" color="primary" onClick={() => onEdit(note.id)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="delete" color="error" onClick={() => onDelete(note.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
