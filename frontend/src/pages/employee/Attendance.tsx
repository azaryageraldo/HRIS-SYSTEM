import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Card,
  CardContent
} from '@mui/material';
import {
  LocationOn,
  CheckCircle,
  HighlightOff,
  History as HistoryIcon,
  Refresh
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';

interface Presensi {
  id: number;
  tanggal: string;
  waktu_masuk: string | null;
  waktu_pulang: string | null;
  status: string;
}

interface Config {
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
  jam_masuk_maksimal: string;
  jam_pulang_minimal: string;
}

interface AttendanceData {
  today: Presensi | null;
  history: Presensi[];
  office: Config | null;
}

const Attendance: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState('');

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/employee/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Gagal memuat data presensi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAttendanceData();
  }, [token]);

  // Realtime location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung Geolocation');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setError(''); // Clear GPS error on success

        // Calculate distance if office location is known
        if (data?.office) {
          const d = calculateDistance(
            latitude,
            longitude,
            data.office.latitude_kantor,
            data.office.longitude_kantor
          );
          setDistance(d);
        }
      },
      (err) => {
        console.error(err);
        setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [data]);

  // Haversine formula (Client side for UI feedback)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleClockIn = async () => {
    if (!location) return;
    try {
      setProcessing(true);
      setError(''); setSuccess('');
      const response = await fetch('http://localhost:8080/api/employee/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude: location.lat, longitude: location.lng })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchAttendanceData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Gagal melakukan presensi');
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!location) return;
    try {
      setProcessing(true);
      setError(''); setSuccess('');
      const response = await fetch('http://localhost:8080/api/employee/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude: location.lat, longitude: location.lng })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchAttendanceData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Gagal melakukan presensi');
    } finally {
      setProcessing(false);
    }
  };

  const isWithinRadius = distance !== null && data?.office && distance <= data.office.radius_meter;

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
        
        <Box sx={{ mb: 4, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>
              Presensi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Catat kehadiran masuk dan pulang kerja Anda.
            </Typography>
          </div>
          <Button startIcon={<Refresh />} onClick={fetchAttendanceData}>Refresh</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {locationError && <Alert severity="warning" sx={{ mb: 3 }}>{locationError}</Alert>}
        {!data?.office && <Alert severity="warning" sx={{ mb: 3 }}>Konfigurasi lokasi kantor belum diatur oleh admin.</Alert>}

        <Grid container spacing={4}>
          {/* Action Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Status Hari Ini</Typography>
                  <Chip 
                    label={data?.today ? (data.today.waktu_pulang ? 'Sudah Pulang' : 'Sedang Bekerja') : 'Belum Masuk'} 
                    color={data?.today ? (data.today.waktu_pulang ? 'default' : 'success') : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mb: 3, textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" /> Lokasi Anda
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Mencari lokasi...'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">Jarak ke Kantor</Typography>
                  <Typography variant="body2" fontWeight={600} color={isWithinRadius ? 'success.main' : 'error.main'}>
                    {distance !== null ? `${distance.toFixed(0)} meter` : '-'}
                    {isWithinRadius && <span style={{ marginLeft: 8 }}>(Dalam Radius)</span>}
                    {!isWithinRadius && distance !== null && <span style={{ marginLeft: 8 }}>(Diluar Radius)</span>}
                  </Typography>
                  {data?.office && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Max Radius: {data.office.radius_meter} meter
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    disabled={!!data?.today || !isWithinRadius || processing}
                    onClick={handleClockIn}
                    startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    Masuk
                  </Button>
                  <Button 
                    variant="contained" 
                    color="warning" 
                    size="large"
                    disabled={!data?.today || !!data.today.waktu_pulang || !isWithinRadius || processing}
                    onClick={handleClockOut}
                    startIcon={processing ? <CircularProgress size={20} /> : <HighlightOff />}
                  >
                    Pulang
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* History Table */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6" fontWeight={700}>Riwayat Presensi</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Masuk</TableCell>
                        <TableCell>Pulang</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">Belum ada riwayat</TableCell>
                        </TableRow>
                      ) : (
                        data?.history.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{new Date(row.tanggal).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{row.waktu_masuk ? new Date(row.waktu_masuk).toLocaleTimeString('id-ID') : '-'}</TableCell>
                            <TableCell>{row.waktu_pulang ? new Date(row.waktu_pulang).toLocaleTimeString('id-ID') : '-'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status} 
                                size="small" 
                                color={row.status === 'Hadir' ? 'success' : 'warning'} 
                                variant="outlined" 
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Attendance;
