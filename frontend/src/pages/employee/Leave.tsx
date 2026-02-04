import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Add,
  History as HistoryIcon,
  DateRange,
  FlightTakeoff
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveBalance {
  total_hari: number;
  hari_terpakai: number;
  sisa_hari: number;
}

interface LeaveRequest {
  id: number;
  tipe_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  alasan: string;
  status: string;
  dibuat_pada: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Leave: React.FC = () => {
  const { token } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    tipe_cuti: 'cuti',
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Balance
      const balanceRes = await fetch('http://localhost:8080/api/employee/leave/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const balanceData = await balanceRes.json();
      if (balanceData.success) setBalance(balanceData.data);

      // Fetch History
      const historyRes = await fetch('http://localhost:8080/api/employee/leave/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const historyData = await historyRes.json();
      if (historyData.success) setHistory(historyData.data || []);
      
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data cuti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      setError(''); setSuccess('');

      const response = await fetch('http://localhost:8080/api/employee/leave/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Pengajuan berhasil dikirim');
        setFormData({ tipe_cuti: 'cuti', tanggal_mulai: '', tanggal_selesai: '', alasan: '' });
        fetchData(); // Refresh data
        setTabValue(0); // Switch to history tab
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Gagal mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disetujui': return 'success';
      case 'ditolak': return 'error';
      default: return 'warning';
    }
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
            Izin & Cuti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola pengajuan izin dan cuti kerja Anda.
          </Typography>
        </Box>

        {/* Balance Card */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlightTakeoff sx={{ mr: 1, opacity: 0.8 }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ opacity: 0.9 }}>Sisa Cuti Tahunan</Typography>
                </Box>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                  {balance?.sisa_hari || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Hari tersedia dari total {balance?.total_hari || 0} hari
                </Typography>
                 <LinearProgress 
                  variant="determinate" 
                  value={(balance ? (balance.sisa_hari / balance.total_hari) * 100 : 0)} 
                  sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} 
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', alignItems: 'center', p: 2 }}>
             <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                     <Typography variant="h5" fontWeight={700} color="primary">{balance?.hari_terpakai || 0}</Typography>
                     <Typography variant="caption" color="text.secondary">Hari Terpakai</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                     <Typography variant="h5" fontWeight={700} color="text.secondary">{history.filter(h => h.status === 'menunggu').length}</Typography>
                     <Typography variant="caption" color="text.secondary">Menunggu Persetujuan</Typography>
                  </Box>
                </Grid>
             </Grid>
            </Card>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="leave tabs">
              <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Riwayat Pengajuan" />
              <Tab icon={<Add fontSize="small" />} iconPosition="start" label="Buat Pengajuan Baru" />
            </Tabs>
          </Box>

          <Box sx={{ p: 0 }}>
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tanggal Pengajuan</TableCell>
                      <TableCell>Tipe</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell>Total Hari</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Alasan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Belum ada riwayat pengajuan</TableCell>
                      </TableRow>
                    ) : (
                      history.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{new Date(row.dibuat_pada).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{row.tipe_cuti}</TableCell>
                          <TableCell>
                            {new Date(row.tanggal_mulai).toLocaleDateString('id-ID')} s/d {new Date(row.tanggal_selesai).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>{row.total_hari} Hari</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.status} 
                              color={getStatusColor(row.status)} 
                              size="small" 
                              variant="outlined" 
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} className="truncate">
                            {row.alasan}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        select
                        fullWidth
                        label="Tipe Pengajuan"
                        name="tipe_cuti"
                        value={formData.tipe_cuti}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="cuti">Cuti Tahunan</MenuItem>
                        <MenuItem value="izin">Izin (Tidak Potong Saldo)</MenuItem>
                        <MenuItem value="sakit">Sakit</MenuItem>
                      </TextField>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Tanggal Mulai"
                        type="date"
                        name="tanggal_mulai"
                        value={formData.tanggal_mulai}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Tanggal Selesai"
                        type="date"
                        name="tanggal_selesai"
                        value={formData.tanggal_selesai}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Alasan"
                        name="alasan"
                        value={formData.alasan}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        required
                        placeholder="Jelaskan alasan pengajuan Anda..."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <DateRange />}
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default Leave;
