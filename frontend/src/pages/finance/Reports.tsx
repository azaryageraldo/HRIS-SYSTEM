import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Download
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface ReportRow {
    ID: number;
    NamaLengkap: string;
    Divisi: string;
    GajiBersih: number;
    NamaBank: string;
    NomorRekening: string;
    DibayarPada: string;
}

const Reports: React.FC = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchReportData();
  }, [month, year]);

  const fetchReportData = async () => {
    try {
        console.log(`Fetching report data for ${month}/${year}`);
        const response = await fetch(`http://localhost:8080/api/finance/reports/data?month=${month}&year=${year}`);
        
        if (!response.ok) {
           console.error(`Fetch failed with status: ${response.status} ${response.statusText}`);
           setSnackbar({ open: true, message: 'Gagal mengambil data laporan', severity: 'error' });
           return;
        }

        const result = await response.json();
        console.log("Report data result:", result);
        
        if (result.success) {
            setReportData(result.data || []);
        }
    } catch (error) {
        console.error("Failed to fetch report data", error);
        setSnackbar({ open: true, message: 'Terjadi kesalahan sistem', severity: 'error' });
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/finance/reports/export?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/csv',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Gaji_${month}_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Laporan berhasil diunduh!', severity: 'success' });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({ open: true, message: 'Gagal mengunduh laporan', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Breadcrumbs />
        <Box sx={{ mb: 5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.025em' }}>
              Laporan Keuangan
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Unduh laporan riwayat pembayaran gaji karyawan dalam format CSV/Excel.
            </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
                <Box sx={{ width: { xs: '100%', md: '33%' }, flexGrow: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Bulan</InputLabel>
                        <Select
                            value={month}
                            label="Bulan"
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33%' }, flexGrow: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Tahun</InputLabel>
                        <Select
                            value={year}
                            label="Tahun"
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {years.map((y) => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33%' }, flexGrow: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                        onClick={handleDownload}
                        disabled={loading}
                        sx={{ 
                            height: 48, 
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#3b82f6',
                            '&:hover': { bgcolor: '#2563eb' }
                        }}
                    >
                        {loading ? 'Mengunduh...' : 'Export ke CSV'}
                    </Button>
                </Box>
            </Box>

            {/* Data Table */}
            <Box sx={{ mt: 4 }}>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Nama Karyawan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Divisi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Bank</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Gaji Bersih</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Tanggal Bayar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        Tidak ada data gaji yang dibayarkan pada periode ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reportData.map((row) => (
                                    <TableRow key={row.ID} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e2e8f0', color: '#64748b', fontSize: 14 }}>
                                                    {row.NamaLengkap.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>{row.NamaLengkap}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{row.Divisi}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" display="block" fontWeight={600}>{row.NamaBank || '-'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{row.NomorRekening || '-'}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600} color="#059669">
                                                Rp {row.GajiBersih.toLocaleString('id-ID')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.DibayarPada ? new Date(row.DibayarPada).toLocaleDateString('id-ID') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>

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

export default Reports;
