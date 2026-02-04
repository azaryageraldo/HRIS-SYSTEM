import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import {
  Visibility,
  ReceiptLong,
  MonetizationOn,
  AccountBalanceWallet
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';

interface SalaryRecord {
  id: number;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  total_potongan: number;
  gaji_bersih: number;
  status: string;
  dibayar_pada: string;
}

interface SalaryDetail extends SalaryRecord {
  pengguna_id: number;
  dibuat_pada: string;
}

const Salary: React.FC = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/employee/salary/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setHistory(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Gagal memuat riwayat gaji');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      setOpenDetail(true);
      const response = await fetch(`http://localhost:8080/api/employee/salary/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSelectedSalary(result.data);
      } else {
        alert(result.message);
        setOpenDetail(false);
      }
    } catch (err) {
      alert('Gagal memuat detail gaji');
      setOpenDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedSalary(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Breadcrumbs />
        
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>
            Slip Gaji
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lihat dan unduh slip gaji bulanan Anda.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell>Periode</TableCell>
                  <TableCell>Gaji Bersih</TableCell>
                  <TableCell>Tanggal Bayar</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">Belum ada riwayat gaji yang dibayarkan.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {getMonthName(row.bulan)} {row.tahun}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {formatCurrency(row.gaji_bersih)}
                      </TableCell>
                      <TableCell>
                        {new Date(row.dibayar_pada).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="DIBAYAR" 
                          color="success" 
                          size="small" 
                          sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton onClick={() => handleViewDetail(row.id)} color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Detail Modal (Simple Payslip) */}
        <Dialog 
          open={openDetail} 
          onClose={handleCloseDetail}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          {loadingDetail ? (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : selectedSalary && (
            <>
              <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>SLIP GAJI</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Periode: {getMonthName(selectedSalary.bulan)} {selectedSalary.tahun}
                  </Typography>
                </Box>
                <Chip icon={<ReceiptLong />} label="PAID" color="success" variant="outlined" sx={{ fontWeight: 'bold' }} />
              </DialogTitle>
              <DialogContent sx={{ py: 3 }}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Penerima</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.nama_lengkap || user?.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="text.secondary">Pendapatan</Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                   <Grid size={{ xs: 1 }}>
                      <MonetizationOn color="primary" />
                   </Grid>
                   <Grid size={{ xs: 7 }}>
                      <Typography>Gaji Pokok</Typography>
                   </Grid>
                   <Grid size={{ xs: 4 }} textAlign="right">
                      <Typography fontWeight={600}>{formatCurrency(selectedSalary.gaji_pokok)}</Typography>
                   </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 6 }}>
                    <Typography color="text.error">Potongan</Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                   <Grid size={{ xs: 1 }}>
                      <AccountBalanceWallet color="error" />
                   </Grid>
                   <Grid size={{ xs: 7 }}>
                      <Typography>Total Potongan</Typography>
                   </Grid>
                   <Grid size={{ xs: 4 }} textAlign="right">
                      <Typography fontWeight={600} color="error.main">-{formatCurrency(selectedSalary.total_potongan)}</Typography>
                   </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderWidth: 2, borderColor: '#e2e8f0' }} />

                <Grid container spacing={2} alignItems="center">
                   <Grid size={{ xs: 6 }}>
                      <Typography variant="h6" fontWeight={800}>TOTAL DITERIMA</Typography>
                   </Grid>
                   <Grid size={{ xs: 6 }} textAlign="right">
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        {formatCurrency(selectedSalary.gaji_bersih)}
                      </Typography>
                   </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                   Dibayar pada: {new Date(selectedSalary.dibayar_pada).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </Typography>
                <Button onClick={handleCloseDetail} variant="outlined">Tutup</Button>
                {/* Add Print/PDF button here if needed later */}
              </DialogActions>
            </>
          )}
        </Dialog>

      </Box>
    </MainLayout>
  );
};

export default Salary;
