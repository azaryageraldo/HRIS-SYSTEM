import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  LocationOn,
  AccessTime,
  Radar,
  MyLocation
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface AttendanceConfig {
  jam_masuk_maksimal: string;
  jam_pulang_minimal: string;
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
}

const AttendanceConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AttendanceConfig>({
    jam_masuk_maksimal: '09:00:00',
    jam_pulang_minimal: '17:00:00',
    latitude_kantor: -6.200000,
    longitude_kantor: 106.816666,
    radius_meter: 100
  });
  // const [loading, setLoading] = useState(false); // Unused
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchData = async () => {
    // setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/konfigurasi-presensi');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (error) {
      showNotification('Gagal memuat data', 'error');
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/konfigurasi-presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Konfigurasi presensi berhasil disimpan', 'success');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan', 'error');
    }
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs links={[{ label: 'Konfigurasi Presensi', href: '/admin/config/presensi' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Konfigurasi Presensi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Atur jam kerja dan lokasi kantor untuk presensi
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}
          >
            Simpan Perubahan
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Jam Kerja Section */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 3, height: '100%', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#eff6ff', color: '#2563eb' }}>
                        <AccessTime />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>Jam Kerja</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Jam Masuk Maksimal"
                    type="time"
                    fullWidth
                    value={config.jam_masuk_maksimal}
                    onChange={(e) => setConfig({ ...config, jam_masuk_maksimal: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    helperText="Lewat jam ini dianggap terlambat"
                  />
                  <TextField
                    label="Jam Pulang Minimal"
                    type="time"
                    fullWidth
                    value={config.jam_pulang_minimal}
                    onChange={(e) => setConfig({ ...config, jam_pulang_minimal: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    helperText="Sebelum jam ini dianggap pulang cepat"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Lokasi Section */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ borderRadius: 3, height: '100%', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#f0fdf4', color: '#16a34a' }}>
                          <LocationOn />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>Lokasi Kantor</Typography>
                   </Box>
                   <Button 
                      size="small" 
                      startIcon={<MyLocation />} 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              setConfig({
                                ...config,
                                latitude_kantor: position.coords.latitude,
                                longitude_kantor: position.coords.longitude
                              });
                              showNotification('Lokasi berhasil diperbarui', 'success');
                            },
                            (error) => {
                              showNotification('Gagal mendapatkan lokasi: ' + error.message, 'error');
                            }
                          );
                        } else {
                          showNotification('Browser tidak mendukung geolocation', 'error');
                        }
                      }}
                   >
                     Gunakan Lokasi Saat Ini
                   </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Latitude Kantor"
                      type="number"
                      fullWidth
                      value={config.latitude_kantor}
                      onChange={(e) => setConfig({ ...config, latitude_kantor: parseFloat(e.target.value) })}
                    />
                    <TextField
                      label="Longitude Kantor"
                      type="number"
                      fullWidth
                      value={config.longitude_kantor}
                      onChange={(e) => setConfig({ ...config, longitude_kantor: parseFloat(e.target.value) })}
                    />
                  </Box>
                  
                  <TextField
                    label="Radius Presensi"
                    type="number"
                    fullWidth
                    value={config.radius_meter}
                    onChange={(e) => setConfig({ ...config, radius_meter: parseInt(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Meter</InputAdornment>,
                    }}
                    helperText="Jarak maksimal karyawan dari titik kantor untuk bisa presensi"
                  />
                  
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Radar sx={{ color: '#64748b' }} />
                    <Typography variant="body2" color="text.secondary">
                        Pastikan koordinat akurat sesuai Google Maps untuk menghindari masalah presensi.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={() => setNotification({...notification, open: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default AttendanceConfigPage;
