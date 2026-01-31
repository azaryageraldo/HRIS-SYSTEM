import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface SalaryConfig {
  divisi_id: number;
  nama_divisi: string;
  gaji_pokok: number;
  tanggal_berlaku: string;
  config_id: number | null;
}

interface DeductionRule {
  id: number;
  nama: string;
  tipe_potongan: 'tetap' | 'persentase';
  nilai_potongan: number;
  deskripsi: string;
  aktif: boolean;
}

const SalaryConfigPage: React.FC = () => {
  const location = useLocation();
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    return tabParam ? parseInt(tabParam) : 0;
  };

  const [tabValue, setTabValue] = useState(getInitialTab());
  const [salaryConfigs, setSalaryConfigs] = useState<SalaryConfig[]>([]);
  const [deductionRules, setDeductionRules] = useState<DeductionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Update tab when location changes (e.g. clicking sidebar while on page)
  useEffect(() => {
    setTabValue(getInitialTab());
  }, [location.search]);
  
  // Dialog States
  const [openDeductionDialog, setOpenDeductionDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<DeductionRule>>({});

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        const res = await fetch('http://localhost:5000/api/konfigurasi-gaji/base-salary');
        const data = await res.json();
        if (data.success) setSalaryConfigs(data.data);
      } else {
        const res = await fetch('http://localhost:5000/api/konfigurasi-gaji/deductions');
        const data = await res.json();
        if (data.success) setDeductionRules(data.data);
      }
    } catch (error) {
      showNotification('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  // --- Base Salary Logic ---
  const handleSaveSalary = async (row: SalaryConfig, newValue: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/konfigurasi-gaji/base-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisi_id: row.divisi_id,
          gaji_pokok: newValue
        })
      });
      const data = await response.json();
      if (data.success) {
        showNotification('Gaji pokok berhasil diperbarui', 'success');
        fetchData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan', 'error');
    }
  };

  const salaryColumns: GridColDef[] = [
    { field: 'divisi_id', headerName: 'ID', width: 70 },
    { field: 'nama_divisi', headerName: 'Divisi', flex: 1, minWidth: 200 },
    { 
      field: 'gaji_pokok', 
      headerName: 'Gaji Pokok (IDR)', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <TextField
          type="number"
          size="small"
          fullWidth
          defaultValue={params.value}
          InputProps={{
            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            sx: { borderRadius: 2 }
          }}
          onBlur={(e) => {
            const val = parseFloat(e.target.value);
            if (val !== params.value) {
              handleSaveSalary(params.row as SalaryConfig, val);
            }
          }}
        />
      )
    },
    { 
      field: 'tanggal_berlaku', 
      headerName: 'Berlaku Sejak', 
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString('id-ID')
    }
  ];

  // --- Deduction Rules Logic ---
  const handleOpenDeductionDialog = (rule?: DeductionRule) => {
    setCurrentRule(rule || { nama: '', tipe_potongan: 'tetap', nilai_potongan: 0, deskripsi: '' });
    setOpenDeductionDialog(true);
  };

  const handleSaveRule = async () => {
    try {
      const url = currentRule.id
        ? `http://localhost:5000/api/konfigurasi-gaji/deductions/${currentRule.id}`
        : 'http://localhost:5000/api/konfigurasi-gaji/deductions';
      const method = currentRule.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRule)
      });
      const data = await res.json();

      if (data.success) {
        showNotification('Aturan potongan berhasil disimpan', 'success');
        setOpenDeductionDialog(false);
        fetchData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan', 'error');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus aturan ini?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/konfigurasi-gaji/deductions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification('Aturan berhasil dihapus', 'success');
        fetchData();
      }
    } catch (error) {
      showNotification('Gagal menghapus', 'error');
    }
  };

  const deductionColumns: GridColDef[] = [
    { field: 'nama', headerName: 'Nama Aturan', flex: 1.5, minWidth: 200 },
    { 
      field: 'tipe_potongan', 
      headerName: 'Tipe', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'persentase' ? 'Persentase' : 'Nominal Tetap'} 
          color={params.value === 'persentase' ? 'info' : 'success'}
          size="small"
        />
      )
    },
    { 
      field: 'nilai_potongan', 
      headerName: 'Nilai Potongan', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.row.tipe_potongan === 'persentase' 
            ? `${params.value}%` 
            : `Rp ${Number(params.value).toLocaleString('id-ID')}`}
        </Typography>
      )
    },
    { field: 'deskripsi', headerName: 'Deskripsi', flex: 2, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDeductionDialog(params.row as DeductionRule)}>
            <EditIcon color="primary" fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteRule(params.row.id)}>
            <DeleteIcon color="error" fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs links={[{ label: 'Konfigurasi Gaji', href: '/admin/salary-config' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Konfigurasi Penggajian
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Atur gaji pokok, tunjangan, dan potongan otomatis
            </Typography>
          </Box>
          {tabValue === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDeductionDialog()}
              sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}
            >
              Tambah Aturan
            </Button>
          )}
        </Box>

        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<MoneyIcon />} iconPosition="start" label="Gaji Pokok per Divisi" sx={{ textTransform: 'none' }} />
            <Tab icon={<GavelIcon />} iconPosition="start" label="Aturan Potongan" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Paper>

        <Paper sx={{ height: 600, width: '100%', borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <DataGrid
            rows={tabValue === 0 ? salaryConfigs : deductionRules}
            columns={tabValue === 0 ? salaryColumns : deductionColumns}
            getRowId={(row) => tabValue === 0 ? row.divisi_id : row.id}
            loading={loading}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
          />
        </Paper>

        {/* Deduction Rule Dialog */}
        <Dialog open={openDeductionDialog} onClose={() => setOpenDeductionDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {currentRule.id ? 'Edit Aturan Potongan' : 'Tambah Aturan Potongan Baru'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Nama Aturan" 
                fullWidth 
                value={currentRule.nama} 
                onChange={(e) => setCurrentRule({...currentRule, nama: e.target.value})}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipe Potongan</InputLabel>
                    <Select
                      value={currentRule.tipe_potongan}
                      label="Tipe Potongan"
                      onChange={(e) => setCurrentRule({...currentRule, tipe_potongan: e.target.value as any})}
                    >
                      <MenuItem value="tetap">Nominal Tetap (Rp)</MenuItem>
                      <MenuItem value="persentase">Persentase (%)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField 
                    label="Nilai" 
                    type="number" 
                    fullWidth
                    value={currentRule.nilai_potongan}
                    onChange={(e) => setCurrentRule({...currentRule, nilai_potongan: parseFloat(e.target.value)})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        {currentRule.tipe_potongan === 'persentase' ? '%' : 'Rp'}
                      </InputAdornment>
                    }}
                  />
                </Box>
              </Box>
              <TextField 
                label="Deskripsi" 
                multiline 
                rows={3} 
                fullWidth
                value={currentRule.deskripsi}
                onChange={(e) => setCurrentRule({...currentRule, deskripsi: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDeductionDialog(false)}>Batal</Button>
            <Button variant="contained" onClick={handleSaveRule} sx={{ bgcolor: '#0f172a' }}>Simpan</Button>
          </DialogActions>
        </Dialog>

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

export default SalaryConfigPage;
