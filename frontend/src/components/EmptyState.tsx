import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Inbox, Add, Search, Error as ErrorIcon } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'error';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction
}) => {
  const iconMap = {
    inbox: <Inbox sx={{ fontSize: 80, color: 'text.disabled' }} />,
    search: <Search sx={{ fontSize: 80, color: 'text.disabled' }} />,
    error: <ErrorIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        textAlign: 'center'
      }}
    >
      {iconMap[icon]}
      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
          {message}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAction}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
