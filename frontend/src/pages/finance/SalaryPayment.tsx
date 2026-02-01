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
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Payment as PaymentIcon,
  AccountBalance,
  CheckCircle,
  AccountBalanceWallet
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';

interface EmployeePayment {
  id: number;
  pengguna_id: number;
  nama_lengkap: string;
  divisi: string;
  bulan: number;
  tahun: number;
  gaji_bersih: number;
  status: string;
  nomor_rekening: string | null;
  nama_pemilik_rekening: string | null;
}

const SalaryPayment: React.FC = () => {
  const [payments, setPayments] = useState<EmployeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<EmployeePayment | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/finance/payments');
      const result = await response.json();
      if (result.success) {
        setPayments(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setSnackbar({ open: true, message: 'Gagal mengambil data tagihan', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePayClick = (payment: EmployeePayment) => {
    setSelectedPayment(payment);
    setConfirmDialogOpen(true);
  };

  const processPayment = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:8080/api/finance/payments/${selectedPayment.id}/pay`, {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        setSnackbar({ open: true, message: 'Pembayaran berhasil diproses!', severity: 'success' });
        setConfirmDialogOpen(false);
        fetchPayments(); // Refresh list
      } else {
        setSnackbar({ open: true, message: 'Gagal memproses: ' + result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Terjadi kesalahan sistem', severity: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const columns: GridColDef[] = [
    { field: 'nama_lengkap', headerName: 'Karyawan', flex: 1, minWidth: 200 },
    { field: 'divisi', headerName: 'Divisi', width: 150 },
    { 
      field: 'periode', 
      headerName: 'Periode', 
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.row.tahun, params.row.bulan - 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      }
    },
    { 
      field: 'gaji_bersih', 
      headerName: 'Total Transfer', 
      width: 180,
      renderCell: (params) => (
        <Typography fontWeight={700} color="primary">
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'rekening',
      headerName: 'Rekening',
      width: 200,
      renderCell: (params) => (
        <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.bank || 'BCA'}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.nomor_rekening || '-'}</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 150,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          color="success" 
          size="small" 
          startIcon={<PaymentIcon />}
          onClick={() => handlePayClick(params.row)}
          sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
        >
          Proses Bayar
        </Button>
      )
    }
  ];

  const totalTagihan = payments.reduce((acc, curr) => acc + curr.gaji_bersih, 0);

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.025em' }}>
              Pembayaran Gaji
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Daftar tagihan gaji yang perlu diproses bulan ini.
            </Typography>
          </Box>
        </Box>

        {/* Summary Card */}
        <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
             <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 56, height: 56 }}>
                <AccountBalanceWallet fontSize="large" />
             </Avatar>
             <Box>
               <Typography variant="body2" color="text.secondary" fontWeight={600}>Total yang harus dibayar</Typography>
               <Typography variant="h4" fontWeight={800} color="#0f172a">
                 {formatCurrency(totalTagihan)}
               </Typography>
               <Typography variant="caption" color="text.secondary">
                 {payments.length} Karyawan masuk dalam daftar tagihan
               </Typography>
             </Box>
          </CardContent>
        </Card>

        <Paper sx={{ width: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden' }}>
           <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={payments}
                columns={columns}
                loading={loading}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                pageSizeOptions={[10, 25]}
                disableRowSelectionOnClick
                sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
              />
           </Box>
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog 
          open={confirmDialogOpen} 
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
             <AccountBalance color="disabled" />
             Konfirmasi Transfer
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedPayment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Alert severity="info" sx={{ mb: 1, borderRadius: 2 }}>
                  Pastikan Anda telah melakukan transfer bank sebelum mengkonfirmasi di sistem.
                </Alert>

                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detail Transfer:</Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Nama Penerima</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedPayment.nama_pemilik_rekening || selectedPayment.nama_lengkap}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Bank & Rekening</Typography>
                    <Typography variant="body2" fontWeight={600}>BCA - {selectedPayment.nomor_rekening || 'Belum diatur'}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={600}>Jumlah</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary">
                       {formatCurrency(selectedPayment.gaji_bersih)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Tindakan ini akan mengubah status menjadi <strong style={{color: '#10b981'}}>Dibayar</strong> dan tidak dapat dibatalkan.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setConfirmDialogOpen(false)} disabled={processing} sx={{ borderRadius: 2 }}>
              Batal
            </Button>
            <Button 
              onClick={processPayment} 
              variant="contained" 
              color="success" 
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {processing ? 'Memproses...' : 'Konfirmasi Sudah Transfer'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </MainLayout>
  );
};

export default SalaryPayment;
