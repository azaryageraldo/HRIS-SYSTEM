import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Person,
  AccountBalance,
  Save,
  Badge,
  Phone,
  Email,
  CreditCard,
  AccountBox
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  telepon: string | null;
  nama_bank: string | null;
  nomor_rekening: string | null;
  nama_pemilik_rekening: string | null;
  divisi: string;
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    telepon: '',
    nama_bank: '',
    nomor_rekening: '',
    nama_pemilik_rekening: ''
  });

  const fetchProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/employee/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
        setFormData({
          nama_lengkap: result.data.nama_lengkap || '',
          telepon: result.data.telepon || '',
          nama_bank: result.data.nama_bank || '',
          nomor_rekening: result.data.nomor_rekening || '',
          nama_pemilik_rekening: result.data.nama_pemilik_rekening || ''
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:8080/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Profil berhasil diperharui');
        fetchProfile(); // Refresh data
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
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
            Akun & Profil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola informasi pribadi dan rekening pembayaran gaji Anda.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Grid container spacing={4}>
          {/* Left Column: Avatar Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'primary.main', 
                  fontSize: '3rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              >
                {profile?.nama_lengkap.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>
                {profile?.nama_lengkap}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.divisi}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ px: 2, py: 0.5, bgcolor: '#eff6ff', borderRadius: 10, color: 'primary.main', fontSize: '0.875rem', fontWeight: 600 }}>
                  Karyawan Tetap
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Forms */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab icon={<Person fontSize="small" />} iconPosition="start" label="Profil Saya" />
                  <Tab icon={<AccountBalance fontSize="small" />} iconPosition="start" label="Rekening Bank" />
                </Tabs>
              </Box>

              <form onSubmit={handleSubmit}>
                <Box sx={{ p: 3 }}>
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
                          Informasi Dasar
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Username"
                          value={profile?.username || ''}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountBox color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={profile?.email || ''}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Nama Lengkap"
                          name="nama_lengkap"
                          value={formData.nama_lengkap}
                          onChange={handleInputChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Badge color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Nomor Telepon"
                          name="telepon"
                          value={formData.telepon}
                          onChange={handleInputChange}
                          placeholder="08123456789"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Pastikan data rekening benar untuk kelancaran proses penggajian.
                        </Alert>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Nama Bank"
                          name="nama_bank"
                          value={formData.nama_bank}
                          onChange={handleInputChange}
                          placeholder="Contoh: BCA, Mandiri"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountBalance color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Nomor Rekening"
                          name="nomor_rekening"
                          value={formData.nomor_rekening}
                          onChange={handleInputChange}
                          placeholder="1234567890"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCard color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Atas Nama Pemilik Rekening"
                          name="nama_pemilik_rekening"
                          value={formData.nama_pemilik_rekening}
                          onChange={handleInputChange}
                          placeholder="Nama sesuai buku tabungan"
                          helperText="Harus sesuai dengan nama di buku tabungan"
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                      disabled={saving}
                      sx={{ minWidth: 150 }}
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </Box>
                </Box>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Profile;
