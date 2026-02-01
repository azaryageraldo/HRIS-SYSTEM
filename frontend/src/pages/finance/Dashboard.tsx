import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney,
  People,
  TrendingUp,
  AccountBalanceWallet
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';

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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subValue }: any) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        borderRadius: 3, 
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: `${color}40`, // 25% opacity
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}15` // 10% opacity colored shadow
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: `${color}10`, // 10% opacity bg
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {subValue}
            </Typography>
          )}
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
          <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.025em' }}>
              Dashboard Keuangan
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ringkasan periode <Typography component="span" fontWeight={600} color="primary">{stats?.periode}</Typography>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="caption" color="text.secondary" display="block">Terakhir diperbarui</Typography>
            <Typography variant="body2" fontWeight={600}>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
            <StatCard 
              title="Tagihan Gaji (Pending)" 
              value={formatCurrency(stats?.total_gaji_harus_dibayar || 0)} 
              icon={<AttachMoney fontSize="medium" />} 
              color="#f59e0b" // Amber
              gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              subValue={
                <>
                  <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b', display: 'inline-block' }} />
                  {stats?.karyawan_belum_dibayar || 0} Karyawan belum dibayar
                </>
              }
            />
             <StatCard 
              title="Pengeluaran Bulan Ini" 
              value={formatCurrency(stats?.total_pengeluaran_bulan || 0)} 
              icon={<AccountBalanceWallet fontSize="medium" />} 
              color="#3b82f6" // Blue
              gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
              subValue={
                <>
                  <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6', display: 'inline-block' }} />
                  {stats?.karyawan_sudah_dibayar || 0} Karyawan lunas
                </>
              }
            />
             <StatCard 
              title="Perkiraan Total Gaji" 
              value={formatCurrency((stats?.total_pengeluaran_bulan || 0) + (stats?.total_gaji_harus_dibayar || 0))} 
              icon={<TrendingUp fontSize="medium" />} 
              color="#6366f1" // Indigo
              gradient="linear-gradient(135deg, #6366f1 0%, #818cf8 100%)"
              subValue="Estimasi total pengeluaran"
            />
              <StatCard 
              title="Efisiensi Pembayaran" 
              value={`${Math.round(paymentProgress)}%`} 
              icon={<People fontSize="medium" />} 
              color={paymentProgress === 100 ? "#10b981" : "#ec4899"} // Emerald or Pink
              gradient={paymentProgress === 100 ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)" : "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"}
              subValue={paymentProgress === 100 ? "Seluruh gaji terbayarkan" : "Sedang dalam proses"}
            />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Progress Section */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>
                  Status Pembayaran
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Monitor kelengkapan pembayaran gaji karyawan
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={100} 
                        size={200} 
                        thickness={4}
                        sx={{ color: '#f1f5f9' }} 
                      />
                      <CircularProgress 
                        variant="determinate" 
                        value={paymentProgress} 
                        size={200}
                        thickness={4} 
                        sx={{ 
                          color: paymentProgress === 100 ? '#10b981' : '#3b82f6',
                          position: 'absolute',
                          left: 0,
                          strokeLinecap: 'round'
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
                        <Typography variant="h3" component="div" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.05em' }}>
                          {Math.round(paymentProgress)}%
                        </Typography>
                        <Typography variant="button" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                          SELESAI
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                       <Box sx={{ flex: 1, p: 2, bgcolor: '#f0fdf4', borderRadius: 3, border: '1px solid #dcfce7' }}>
                          <Typography variant="h6" fontWeight={800} color="success.main">
                            {stats?.karyawan_sudah_dibayar}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color="success.dark">Sudah Dibayar</Typography>
                       </Box>
                       <Box sx={{ flex: 1, p: 2, bgcolor: '#fff7ed', borderRadius: 3, border: '1px solid #ffedd5' }}>
                          <Typography variant="h6" fontWeight={800} color="warning.main">
                            {stats?.karyawan_belum_dibayar}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color="warning.dark">Belum Dibayar</Typography>
                       </Box>
                    </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* History Chart */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0f172a' }}>
                      Tren Pengeluaran
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Statistik gaji 6 bulan terakhir
                    </Typography>
                  </Box>
                   <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Last 6 Months</Typography>
                   </Box>
                </Box>
                
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 3 }, minHeight: 250, pb: 2 }}>
                  {expenses.length > 0 ? expenses.map((exp, index) => {
                    // Scaling logic
                    const maxVal = Math.max(...expenses.map(e => e.total)) || 1;
                    const heightPercent = (exp.total / maxVal) * 75 + 15; // min 15% height
                    const isMax = exp.total === maxVal;
                    
                    return (
                      <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', group: 'true' }}>
                        <Box sx={{ 
                            opacity: 0, 
                            transform: 'translateY(10px)', 
                            transition: 'all 0.3s', 
                            mb: 1,
                            '.MuiBox-root:hover &': { opacity: 1, transform: 'translateY(0)' } 
                          }}>
                           <Typography variant="caption" fontWeight={700} sx={{ color: '#0f172a', bgcolor: 'white', px: 1, py: 0.5, borderRadius: 1, boxShadow: 2 }}>
                             {(exp.total / 1000000).toFixed(1)}jt
                           </Typography>
                        </Box>
                        
                        <Box 
                          sx={{ 
                            width: '100%', 
                            maxWidth: 60,
                            height: `${heightPercent}%`, 
                            background: isMax ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' : '#cbd5e1', 
                            borderRadius: '12px 12px 4px 4px',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            '&:hover': { 
                               background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                               transform: 'scaleY(1.05)',
                               boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }
                          }} 
                        />
                         <Typography variant="caption" fontWeight={600} sx={{ mt: 2, color: '#64748b' }}>
                          {new Date(exp.tahun, exp.bulan - 1).toLocaleDateString('id-ID', { month: 'short' })}
                        </Typography>
                      </Box>
                    )
                  }) : (
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', flexDirection: 'column', gap: 1 }}>
                       <TrendingUp sx={{ fontSize: 40, opacity: 0.5 }} />
                       <Typography variant="body2">Belum ada data historis</Typography>
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
