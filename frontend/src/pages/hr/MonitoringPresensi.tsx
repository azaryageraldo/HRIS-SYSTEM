import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CalendarMonth,
  Search,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel,
  Warning,
  AccessTime
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface PresensiItem {
  id: number;
  pengguna_id: number;
  nama_lengkap: string;
  divisi: string | null;
  tanggal: string;
  waktu_masuk: string | null;
  waktu_pulang: string | null;
  status: string;
  catatan: string | null;
}

const MonitoringPresensi: React.FC = () => {
  const [data, setData] = useState<PresensiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchPresensi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/hr/presensi?date=${date}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching presensi:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengambil data presensi',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresensi();
  }, [date]);

  const filteredData = data.filter(item => 
    item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.divisi && item.divisi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const columns: GridColDef[] = [
    { field: 'nama_lengkap', headerName: 'Nama Karyawan', flex: 1.5, minWidth: 200 },
    { field: 'divisi', headerName: 'Divisi', flex: 1, minWidth: 150 },
    { 
      field: 'waktu_masuk', 
      headerName: 'Masuk', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {params.value ? <AccessTime fontSize="small" color="success" /> : null}
          <Typography variant="body2">{formatTime(params.value)}</Typography>
        </Box>
      )
    },
    { 
      field: 'waktu_pulang', 
      headerName: 'Pulang', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {params.value ? <AccessTime fontSize="small" color="action" /> : null}
          <Typography variant="body2">{formatTime(params.value)}</Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        let color: 'success' | 'warning' | 'error' | 'default' | 'primary' | 'secondary' | 'info' = 'default';
        let icon = null;
        let label = params.value;

        switch (params.value) {
          case 'hadir':
            color = 'success';
            icon = <CheckCircle fontSize="small" />;
            label = 'Hadir';
            break;
          case 'terlambat':
            color = 'warning';
            icon = <Warning fontSize="small" />;
            label = 'Terlambat';
            break;
          case 'tidak_hadir':
            color = 'error';
            icon = <Cancel fontSize="small" />;
            label = 'Tidak Hadir';
            break;
          case 'izin':
          case 'cuti':
            color = 'info';
            label = params.value === 'izin' ? 'Izin' : 'Cuti';
            break;
        }

        return (
          <Chip 
            icon={icon || undefined}
            label={label} 
            color={color} 
            size="small" 
            variant="outlined" 
            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
          />
        );
      }
    },
    { field: 'catatan', headerName: 'Catatan', flex: 1, minWidth: 200 },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Monitoring Presensi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Pantau kehadiran karyawan secara real-time
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchPresensi}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Tanggal"
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonth color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Cari Karyawan / Divisi"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </Paper>

        <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.pengguna_id}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
          />
        </Box>

        {/* Snackbar Alert */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default MonitoringPresensi;
