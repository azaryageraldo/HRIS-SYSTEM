import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box
} from '@mui/material';
import { Warning, Delete, CheckCircle, Info } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning'
}) => {
  const variantConfig = {
    danger: {
      icon: <Delete sx={{ fontSize: 48, color: 'error.main' }} />,
      color: 'error' as const
    },
    warning: {
      icon: <Warning sx={{ fontSize: 48, color: 'warning.main' }} />,
      color: 'warning' as const
    },
    success: {
      icon: <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />,
      color: 'success' as const
    },
    info: {
      icon: <Info sx={{ fontSize: 48, color: 'info.main' }} />,
      color: 'info' as const
    }
  };

  const config = variantConfig[variant];

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {config.icon}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText textAlign="center">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center', gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={config.color}
          sx={{ minWidth: 100 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
