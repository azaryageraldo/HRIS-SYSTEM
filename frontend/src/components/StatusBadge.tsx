import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  EventBusy,
  EventAvailable,
  HourglassEmpty
} from '@mui/icons-material';

type StatusType =
  | 'hadir'
  | 'terlambat'
  | 'tidak_hadir'
  | 'izin'
  | 'cuti'
  | 'menunggu'
  | 'disetujui'
  | 'ditolak'
  | 'aktif'
  | 'nonaktif';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const statusConfig: Record<
    StatusType,
    { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: React.ReactElement }
  > = {
    hadir: {
      label: 'Hadir',
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 16 }} />
    },
    terlambat: {
      label: 'Terlambat',
      color: 'warning',
      icon: <Schedule sx={{ fontSize: 16 }} />
    },
    tidak_hadir: {
      label: 'Tidak Hadir',
      color: 'error',
      icon: <Cancel sx={{ fontSize: 16 }} />
    },
    izin: {
      label: 'Izin',
      color: 'info',
      icon: <EventAvailable sx={{ fontSize: 16 }} />
    },
    cuti: {
      label: 'Cuti',
      color: 'info',
      icon: <EventBusy sx={{ fontSize: 16 }} />
    },
    menunggu: {
      label: 'Menunggu',
      color: 'warning',
      icon: <HourglassEmpty sx={{ fontSize: 16 }} />
    },
    disetujui: {
      label: 'Disetujui',
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 16 }} />
    },
    ditolak: {
      label: 'Ditolak',
      color: 'error',
      icon: <Cancel sx={{ fontSize: 16 }} />
    },
    aktif: {
      label: 'Aktif',
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 16 }} />
    },
    nonaktif: {
      label: 'Nonaktif',
      color: 'default',
      icon: <Warning sx={{ fontSize: 16 }} />
    }
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          marginLeft: '8px'
        }
      }}
    />
  );
};

export default StatusBadge;
