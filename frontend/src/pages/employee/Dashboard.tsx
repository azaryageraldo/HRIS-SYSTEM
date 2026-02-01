import { useState } from 'react';
import { Typography, Container, Box, Paper } from '@mui/material';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Employee Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Selamat datang, {user?.nama_lengkap}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Status Presensi Hari Ini
              </Typography>
              <Typography variant="body1">
                Belum Absen
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
              <Typography variant="h6" gutterBottom>
                Sisa Cuti
              </Typography>
              <Typography variant="h3">
                12 Hari
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
