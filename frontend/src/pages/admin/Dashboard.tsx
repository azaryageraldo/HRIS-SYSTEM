import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { People, Business, CheckCircle, AttachMoney, TrendingUp } from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';

interface AttendanceTrend {
  date: string;
  hadir: number;
  total: number;
  percentage: number;
}

interface DivisionBreakdown {
  nama: string;
  jumlahKaryawan: number;
  gajiPokok: number;
  totalGaji: number;
}

interface DashboardStats {
  totalKaryawan: number;
  totalDivisi: number;
  presensiHariIni: {
    hadir: number;
    total: number;
    percentage: number;
  };
  totalBebanGaji: number;
  attendanceTrend: AttendanceTrend[];
  divisionBreakdown: DivisionBreakdown[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStats(data.data);
          }
        } else {
          console.error('Failed to fetch stats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <MainLayout>
      {/* Full-Screen Container */}
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f5f7fa',
          pt: 3,
          pb: 3,
          pl: 0, // No gap on left side
          pr: 3  // Keep right padding
        }}
      >
        {/* Header */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight="700"
            gutterBottom
            sx={{
              color: '#1a1a1a',
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Dashboard Admin
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575' }}>
            Selamat datang, <strong>{user?.nama_lengkap}</strong>! Berikut adalah ringkasan sistem HRIS.
          </Typography>
        </Box>

        {/* Stats Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
          }}
        >
          {loading ? (
            <>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
            </>
          ) : (
            <>
              <StatCard
                title="Total Karyawan"
                value={stats?.totalKaryawan || 0}
                icon={<People sx={{ fontSize: 32 }} />}
                color="primary"
                size="large"
              />

              <StatCard
                title="Total Divisi IT"
                value={stats?.totalDivisi || 0}
                icon={<Business sx={{ fontSize: 32 }} />}
                color="info"
                size="large"
              />

              <StatCard
                title="Presensi Hari Ini"
                value={`${stats?.presensiHariIni.hadir || 0}/${stats?.presensiHariIni.total || 0}`}
                icon={<CheckCircle sx={{ fontSize: 32 }} />}
                color="success"
                size="large"
                trend={stats?.presensiHariIni.percentage ? {
                  value: stats.presensiHariIni.percentage,
                  isPositive: stats.presensiHariIni.percentage >= 80
                } : undefined}
              />

              <StatCard
                title="Total Beban Gaji"
                value={stats ? formatCurrency(stats.totalBebanGaji).replace('Rp', 'Rp ') : 'Rp 0'}
                icon={<AttachMoney sx={{ fontSize: 32 }} />}
                color="warning"
                size="large"
              />
            </>
          )}
        </Box>

        {/* Charts and Details Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              lg: 'repeat(12, 1fr)'
            },
            gap: 3
          }}
        >
          {/* Attendance Trend */}
          <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 8' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                height: '100%'
              }}
            >
              <Box display="flex" alignItems="center" mb={3}>
                <TrendingUp sx={{ fontSize: 28, color: '#3498db', mr: 1.5 }} />
                <Typography variant="h6" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                  Tren Kehadiran (7 Hari Terakhir)
                </Typography>
              </Box>

              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <Box>
                  {stats?.attendanceTrend && stats.attendanceTrend.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 200 }}>
                      {stats.attendanceTrend.map((day, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Typography variant="caption" fontWeight="600" sx={{ color: '#424242' }}>
                            {day.hadir}
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              height: `${day.percentage}%`,
                              minHeight: '20px',
                              background: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)',
                              borderRadius: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scaleY(1.05)',
                                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.7rem' }}>
                            {formatDate(day.date)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>
                      Belum ada data presensi
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Division Breakdown */}
          <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 4' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                height: '100%'
              }}
            >
              <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#1a1a1a', mb: 3 }}>
                Distribusi Karyawan
              </Typography>

              {loading ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                  ))}
                </Box>
              ) : (
                <Box>
                  {stats?.divisionBreakdown && stats.divisionBreakdown.length > 0 ? (
                    stats.divisionBreakdown.map((division, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#e9ecef',
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                            {division.nama}
                          </Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#3498db' }}>
                            {division.jumlahKaryawan} orang
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          Gaji Pokok: {formatCurrency(division.gajiPokok)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      Belum ada data divisi
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>

          {/* System Info */}
          <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 6' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#1a1a1a', mb: 3 }}>
                Informasi Sistem
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Role Anda
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                    {user?.peran || 'Admin'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Divisi
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                    {user?.divisi || 'Semua Divisi'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#2ecc71',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                    <Typography variant="body2" fontWeight="600" sx={{ color: '#2ecc71' }}>
                      Aktif
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Quick Summary */}
          <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 6' } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#1a1a1a', mb: 3 }}>
                Ringkasan Cepat
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Tingkat Kehadiran Hari Ini
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#2ecc71' }}>
                    {stats?.presensiHariIni.percentage || 0}%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Rata-rata Gaji per Karyawan
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                    {stats && stats.totalKaryawan > 0
                      ? formatCurrency(stats.totalBebanGaji / stats.totalKaryawan)
                      : 'Rp 0'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#757575' }}>
                    Karyawan per Divisi (Rata-rata)
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                    {stats && stats.totalDivisi > 0
                      ? Math.round(stats.totalKaryawan / stats.totalDivisi)
                      : 0} orang
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Pulse Animation */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </Box>
    </MainLayout>
  );
};

export default AdminDashboard;
