import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  maxWidth = 'sm',
  loading = false
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            disabled={submitting}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          variant="outlined"
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          {submitting || loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            submitLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
