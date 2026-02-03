import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import { 
  AccessTime, 
  EventAvailable, 
  AttachMoney, 
  WorkHistory 
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  leave_balance: number;
  last_salary_amount: number;
  last_salary_period: string | null;
}

const EmployeeDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        // Direct fetch to Golang API (8080) because apiClient points to Express (5000)
        const response = await fetch('http://localhost:8080/api/employee/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data dashboard');
        }

        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
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
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>
            Dashboard Karyawan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selamat datang kembali, {user?.nama_lengkap}! Berikut ringkasan hari ini.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Attendance Status */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', mr: 2 }}>
                    <AccessTime />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>Presensi Hari Ini</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" fontWeight={800} color={stats?.attendance_status === 'Hadir' ? 'success.main' : 'warning.main'} sx={{ mb: 1 }}>
                    {stats?.attendance_status || 'Belum Absen'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Masuk</Typography>
                      <Typography variant="body1" fontWeight={600}>{stats?.check_in_time || '--:--'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pulang</Typography>
                      <Typography variant="body1" fontWeight={600}>{stats?.check_out_time || '--:--'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Leave Balance */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e', mr: 2 }}>
                    <EventAvailable />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>Sisa Cuti Tahunan</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h2" fontWeight={800} color="#0f172a">
                    {stats?.leave_balance ?? 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hari Tersedia
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Last Salary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#f97316', mr: 2 }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>Gaji Terakhir</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
                    {formatCurrency(stats?.last_salary_amount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <WorkHistory fontSize="small" />
                    {stats?.last_salary_period || 'Belum ada data'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Box>
    </MainLayout>
  );
};

export default EmployeeDashboard;
