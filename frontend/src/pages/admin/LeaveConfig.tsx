import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface LeaveConfig {
  divisi_id: number;
  nama_divisi: string;
  jatah_cuti_tahunan: number;
  tahun_berlaku: number;
  config_id: number | null;
}

const LeaveConfigPage: React.FC = () => {
  const [leaveConfigs, setLeaveConfigs] = useState<LeaveConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [currentYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/konfigurasi-cuti?year=${currentYear}`);
      const data = await res.json();
      if (data.success) {
        setLeaveConfigs(data.data);
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentYear]);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleSaveQuota = async (row: LeaveConfig, newValue: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/konfigurasi-cuti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisi_id: row.divisi_id,
          jatah_cuti_tahunan: newValue,
          tahun_berlaku: currentYear
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Jatah cuti berhasil diperbarui', 'success');
        fetchData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'divisi_id', headerName: 'ID', width: 70 },
    { field: 'nama_divisi', headerName: 'Divisi', flex: 1, minWidth: 200 },
    { 
      field: 'jatah_cuti_tahunan', 
      headerName: `Jatah Cuti Tahun ${currentYear}`, 
      flex: 1, 
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <TextField
          type="number"
          size="small"
          fullWidth
          defaultValue={params.value}
          InputProps={{
            endAdornment: <InputAdornment position="end">Hari</InputAdornment>,
            sx: { borderRadius: 2 }
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (val !== params.value) {
              handleSaveQuota(params.row as LeaveConfig, val);
            }
          }}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: () => (
        <Typography variant="body2" color="success.main" fontWeight={600}>
          Aktif
        </Typography>
      )
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs links={[{ label: 'Konfigurasi Cuti', href: '/admin/config/cuti' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Konfigurasi Cuti Tahunan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Atur jatah cuti tahunan (per tahun {currentYear}) untuk setiap divisi
            </Typography>
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
           <CardContent sx={{ p: 0 }}>
             <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={leaveConfigs}
                columns={columns}
                getRowId={(row) => row.divisi_id}
                loading={loading}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                pageSizeOptions={[10, 25]}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
              />
            </Box>
           </CardContent>
        </Card>

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={() => setNotification({...notification, open: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default LeaveConfigPage;
