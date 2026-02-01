import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney,
  People,
  TrendingUp,
  AccountBalanceWallet
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface MonthlyExpense {
  bulan: number;
  tahun: number;
  total: number;
}

interface FinanceStats {
  total_gaji_harus_dibayar: number;
  karyawan_sudah_dibayar: number;
  karyawan_belum_dibayar: number;
  total_pengeluaran_bulan: number;
  periode: string;
}

const FinanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/finance/dashboard');
        const result = await response.json();
        if (result.success) {
          setStats(result.data.stats);
          setExpenses(result.data.expenses);
        }
      } catch (error) {
        console.error('Error fetching finance dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subValue }: any) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
      <Box 
        sx={{ 
          position: 'absolute', 
          right: -20, 
          top: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          bgcolor: `${color}10`, // 10% opacity
          zIndex: 0 
        }} 
      />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b' }}>
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" sx={{ color: color, fontWeight: 600, mt: 1, display: 'block' }}>
                {subValue}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48, borderRadius: 2 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const totalEmployees = (stats?.karyawan_sudah_dibayar || 0) + (stats?.karyawan_belum_dibayar || 0);
  const paymentProgress = totalEmployees > 0 
    ? ((stats?.karyawan_sudah_dibayar || 0) / totalEmployees) * 100 
    : 0;

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>
            Dashboard Keuangan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ringkasan pembayaran gaji dan pengeluaran {stats?.periode}.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
            <StatCard 
              title="Tagihan Gaji (Pending)" 
              value={formatCurrency(stats?.total_gaji_harus_dibayar || 0)} 
              icon={<AttachMoney fontSize="large" />} 
              color="#eab308"
              subValue={`${stats?.karyawan_belum_dibayar || 0} Karyawan belum dibayar`}
            />
             <StatCard 
              title="Pengeluaran Bulan Ini" 
              value={formatCurrency(stats?.total_pengeluaran_bulan || 0)} 
              icon={<AccountBalanceWallet fontSize="large" />} 
              color="#3b82f6"
              subValue={`${stats?.karyawan_sudah_dibayar || 0} Karyawan sudah lunas`}
            />
             <StatCard 
              title="Total Karyawan (Payroll)" 
              value={totalEmployees} 
              icon={<People fontSize="large" />} 
              color="#64748b"
              subValue="Periode ini"
            />
             <StatCard 
              title="Progres Pembayaran" 
              value={`${Math.round(paymentProgress)}%`} 
              icon={<TrendingUp fontSize="large" />} 
              color={paymentProgress === 100 ? "#22c55e" : "#f43f5e"}
               subValue={paymentProgress === 100 ? "Selesai" : "Sedang berjalan"}
            />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Progress Section */}
          <Box sx={{ flex: 1, minWidth: { md: 350 } }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
                  Status Pembayaran
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                   <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress variant="determinate" value={100} size={160} sx={{ color: '#f1f5f9' }} />
                      <CircularProgress 
                        variant="determinate" 
                        value={paymentProgress} 
                        size={160} 
                        sx={{ 
                          color: paymentProgress === 100 ? '#22c55e' : '#3b82f6',
                          position: 'absolute',
                          left: 0,
                        }} 
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="h4" component="div" fontWeight={800} color="text.primary">
                          {Math.round(paymentProgress)}%
                        </Typography>
                        <Typography variant="caption" component="div" color="text.secondary">
                          Selesai
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                       <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            {stats?.karyawan_sudah_dibayar}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Sudah</Typography>
                       </Box>
                       <Box sx={{ borderRight: '1px solid #e2e8f0' }} />
                       <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} color="warning.main">
                            {stats?.karyawan_belum_dibayar}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Belum</Typography>
                       </Box>
                    </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* History Chart Placeholder */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#0f172a', mb: 3 }}>
                  Tren Pengeluaran Gaji (6 Bulan Terakhir)
                </Typography>
                {/* Simple Bar Chart Visualization using Box */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 250, gap: 2, pt: 2 }}>
                  {expenses.length > 0 ? expenses.map((exp, index) => {
                    // Normalize height (assuming max 100jt for scale roughly)
                    const maxVal = Math.max(...expenses.map(e => e.total)) || 1;
                    const height = (exp.total / maxVal) * 80 + 20; // min 20%
                    
                    return (
                      <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" fontWeight={600} sx={{ mb: 1, color: '#64748b' }}>
                          {(exp.total / 1000000).toFixed(1)}jt
                        </Typography>
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: `${height}%`, 
                            bgcolor: index === 0 ? '#3b82f6' : '#94a3b8', 
                            borderRadius: '8px 8px 0 0',
                            transition: 'height 1s',
                            '&:hover': { bgcolor: '#2563eb' }
                          }} 
                        />
                         <Typography variant="caption" sx={{ mt: 1, color: '#64748b' }}>
                          {new Date(exp.tahun, exp.bulan - 1).toLocaleDateString('id-ID', { month: 'short' })}
                        </Typography>
                      </Box>
                    )
                  }) : (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                      Belum ada data historis
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default FinanceDashboard;
