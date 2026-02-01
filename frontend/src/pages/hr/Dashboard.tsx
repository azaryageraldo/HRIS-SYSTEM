import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  EventNote as EventIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  PeopleAlt
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';


interface DashboardStats {
  kehadiran: {
    hadir: number;
    terlambat: number;
    tidak_hadir: number;
    total_karyawan: number;
  };
  pengajuan: {
    menunggu: number;
  };
  gaji: {
    bulan: string;
    tahun: number;
    total_estimasi: number;
    jumlah_karyawan_terhitung: number;
  };
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => (
  <Card 
    sx={{ 
      height: '100%', 
      borderRadius: 2, 
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        borderColor: color,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        transition: 'all 0.2s ease-in-out'
      }
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 48, 
            height: 48, 
            borderRadius: '50%', // Circle icons
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      
      <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/hr/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Gagal memuat data statistik');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Gagal menghubungkan ke server Golang. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
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
      <Box sx={{ p: 3 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Dashboard HR Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ringkasan aktivitas dan operasional hari ini
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchStats}
            variant="contained"
            sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}
          >
            Refresh Data
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {stats && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Kehadiran Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleAlt fontSize="small" /> Kehadiran Hari Ini
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
                <StatCard
                  title="Hadir Tepat Waktu"
                  value={stats.kehadiran.hadir}
                  subtitle={`Dari total ${stats.kehadiran.total_karyawan} karyawan`}
                  icon={<CheckIcon />}
                  color="#10b981" // emerald-500
                />
                <StatCard
                  title="Terlambat Masuk"
                  value={stats.kehadiran.terlambat}
                  subtitle="Perlu tinjauan"
                  icon={<WarningIcon />}
                  color="#f59e0b" // amber-500
                />
                <StatCard
                  title="Tidak Hadir / Absen"
                  value={stats.kehadiran.tidak_hadir}
                  subtitle="Termasuk Izin & Alpha"
                  icon={<CancelIcon />}
                  color="#ef4444" // red-500
                />
              </Box>
            </Box>

            {/* Operasional Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" /> Operasional & Keuangan
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 2 }}>
                <StatCard
                  title="Pengajuan Cuti Menunggu"
                  value={stats.pengajuan.menunggu}
                  subtitle="Permintaan butuh persetujuan"
                  icon={<EventIcon />}
                  color="#3b82f6" // blue-500
                />
                <StatCard
                  title={`Estimasi Gaji (${stats.gaji.bulan} ${stats.gaji.tahun})`}
                  value={`Rp ${stats.gaji.total_estimasi.toLocaleString('id-ID')}`}
                  subtitle={`${stats.gaji.jumlah_karyawan_terhitung} Karyawan telah dihitung`}
                  icon={<MoneyIcon />}
                  color="#8b5cf6" // violet-500
                />
              </Box>
            </Box>

          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default HRDashboard;
