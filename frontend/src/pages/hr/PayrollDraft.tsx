import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface PayrollDraft {
  id: number;
  pengguna_id: number;
  nama_lengkap: string;
  divisi: string | null;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  total_potongan: number;
  gaji_bersih: number;
  status: string;
}

const PayrollDraft: React.FC = () => {
  const [drafts, setDrafts] = useState<PayrollDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  
  const currentDate = new Date();
  const [month] = useState(currentDate.getMonth() + 1);
  const [year] = useState(currentDate.getFullYear());

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/hr/gaji/draft?bulan=${month}&tahun=${year}`);
      const result = await response.json();
      if (result.success) {
        setDrafts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching payroll drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [month, year]);

  const handleSendToFinance = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/hr/gaji/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan: month, tahun: year })
      });
      
      const result = await response.json();
      if (result.success) {
        setOpenDialog(false);
        fetchDrafts(); // Refresh list (should be empty now)
        fetchHistory(); // Refresh history
        setSnackbar({
          open: true,
          message: 'Draft gaji berhasil dikirim ke bagian keuangan',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Gagal mengirim draft: ' + result.message,
          severity: 'error'
        });
      }
    } catch (error) {
       setSnackbar({
        open: true,
        message: 'Terjadi kesalahan koneksi',
        severity: 'error'
      });
    }
  };

  // --- History Feature ---
  interface PayrollHistory {
    bulan: number;
    tahun: number;
    status: string;
    total_karyawan: number;
    total_gaji: number;
  }

  const [tabValue, setTabValue] = useState(0);
  const [historyData, setHistoryData] = useState<PayrollHistory[]>([]);
  
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/hr/gaji/history');
      const result = await response.json();
      if (result.success) {
        setHistoryData(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const [openHistoryDetail, setOpenHistoryDetail] = useState(false);
  const [historyDetailData, setHistoryDetailData] = useState<PayrollDraft[]>([]);

  const handleViewHistoryDetail = async (row: PayrollHistory) => {
    try {
      const response = await fetch(`http://localhost:8080/api/hr/gaji/details?bulan=${row.bulan}&tahun=${row.tahun}&status=${row.status}`);
      const result = await response.json();
      if (result.success) {
        setHistoryDetailData(result.data || []);
        setOpenHistoryDetail(true);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
       setSnackbar({
        open: true,
        message: 'Gagal mengambil detail data',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (tabValue === 1) {
      fetchHistory();
    }
  }, [tabValue]);

  const historyColumns: GridColDef[] = [
    { 
      field: 'periode', 
      headerName: 'Periode', 
      flex: 1,
      renderCell: (params) => {
        const date = new Date(params.row.tahun, params.row.bulan - 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      }
    },
    { 
      field: 'total_karyawan', 
      headerName: 'Total Karyawan', 
      width: 150,
      align: 'right',
      headerAlign: 'right',
    },
    { 
      field: 'total_gaji', 
      headerName: 'Total Penggajian', 
      flex: 1,
      minWidth: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => <Typography fontWeight={700}>{formatCurrency(params.value)}</Typography>
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 180, // Increased width
      renderCell: (params) => (
        <Chip 
          label={params.value.replace(/_/g, ' ')} 
          size="small" 
          color={params.value === 'dibayar' ? 'success' : 'warning'}
          sx={{ textTransform: 'capitalize' }} 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 100,
      renderCell: (params) => (
        <Button size="small" variant="text" onClick={() => handleViewHistoryDetail(params.row)}>
          Lihat
        </Button>
      )
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const columns: GridColDef[] = [
    { field: 'nama_lengkap', headerName: 'Nama Karyawan', flex: 1.5, minWidth: 200 },
    { field: 'divisi', headerName: 'Divisi', flex: 1, minWidth: 150 },
    { 
      field: 'gaji_pokok', 
      headerName: 'Gaji Pokok', 
      width: 150, 
      renderCell: (params) => formatCurrency(params.value)
    },
    { 
      field: 'total_potongan', 
      headerName: 'Potongan', 
      width: 150, 
      renderCell: (params) => <Typography color="error">{formatCurrency(params.value)}</Typography>
    },
    { 
      field: 'gaji_bersih', 
      headerName: 'Gaji Bersih', 
      width: 150, 
      renderCell: (params) => <Typography fontWeight={700} color="success.main">{formatCurrency(params.value)}</Typography>
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => <Chip label={params.value ? params.value.replace(/_/g, ' ') : ''} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
    },
  ];

  const totalGaji = drafts.reduce((sum, item) => sum + item.gaji_bersih, 0);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Rekap Gaji (Draft Payroll)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Periode: {new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
             <Button 
              startIcon={<RefreshIcon />} 
              onClick={fetchDrafts}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Refresh
            </Button>
            <Button 
              startIcon={<SendIcon />} 
              onClick={() => setOpenDialog(true)}
              variant="contained"
              disabled={drafts.length === 0}
              sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}
            >
              Kirim ke Keuangan
            </Button>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue)}>
            <Tab label="Draft Gaji (Saat Ini)" />
            <Tab label="Riwayat Penggajian" />
          </Tabs>
        </Box>

        {tabValue === 0 ? (
          // DRAFT VIEW
          drafts.length > 0 ? (
            <Paper sx={{ width: '100%', mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                   Total {drafts.length} Karyawan
                 </Typography>
                 <Typography variant="h6" fontWeight={700} color="success.main">
                   Total: {formatCurrency(totalGaji)}
                 </Typography>
              </Box>
              <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={drafts}
                  columns={columns}
                  loading={loading}
                  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                  pageSizeOptions={[10, 25]}
                  disableRowSelectionOnClick
                  sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
                />
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px dashed #cbd5e1', boxShadow: 'none' }}>
              <MoneyIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tidak ada draft gaji ditemukan
              </Typography>
              <Typography variant="body2" color="#64748b">
                Mungkin semua gaji sudah dikirim ke keuangan atau belum dihitung sistem.
              </Typography>
            </Paper>
          )
        ) : (
          // HISTORY VIEW
          <Paper sx={{ width: '100%', mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
             <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={historyData.map((item, index) => ({ ...item, id: index }))} // History might not have ID, use index
                  columns={historyColumns}
                  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                  pageSizeOptions={[10, 25]}
                  disableRowSelectionOnClick
                  sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
                />
             </Box>
          </Paper>
        )}

        {/* History Detail Dialog */}
        <Dialog open={openHistoryDetail} onClose={() => setOpenHistoryDetail(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
            Detail Riwayat Penggajian
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
             <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={historyDetailData}
                  columns={columns.filter(c => c.field !== 'actions')} // Reuse columns but hide actions if any
                  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                  pageSizeOptions={[10, 25]}
                  disableRowSelectionOnClick
                  sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
                />
             </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setOpenHistoryDetail(false)} variant="outlined">Tutup</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Kirim Draft Gaji?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Anda akan mengirimkan draft gaji untuk <b>{drafts.length} karyawan</b> dengan total <b>{formatCurrency(totalGaji)}</b> ke bagian Keuangan.
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              Data yang sudah dikirim tidak dapat diubah kembali oleh HR.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button variant="contained" onClick={handleSendToFinance} sx={{ bgcolor: '#0f172a' }}>
              Ya, Kirim Sekarang
            </Button>
          </DialogActions>
        </Dialog>

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
export default PayrollDraft;
