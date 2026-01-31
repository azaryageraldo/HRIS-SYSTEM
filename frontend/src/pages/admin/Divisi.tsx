import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface Divisi {
  id: number;
  nama: string;
  deskripsi: string;
  aktif: boolean;
  dibuat_pada: string;
}

const DivisiPage: React.FC = () => {
  const [divisions, setDivisions] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentDivision, setCurrentDivision] = useState<Partial<Divisi>>({});
  const [formData, setFormData] = useState({ nama: '', deskripsi: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/divisi');
      const data = await response.json();
      if (data.success) {
        setDivisions(data.data);
      } else {
        showNotification(data.message || 'Failed to fetch data', 'error');
      }
    } catch (error) {
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenDialog = (division?: Divisi) => {
    if (division) {
      setCurrentDivision(division);
      setFormData({ nama: division.nama, deskripsi: division.deskripsi || '' });
    } else {
      setCurrentDivision({});
      setFormData({ nama: '', deskripsi: '' });
    }
    setOpenDialog(true);
  };

  const handleDeleteClick = (division: Divisi) => {
    setCurrentDivision(division);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nama) {
        showNotification('Nama divisi wajib diisi', 'error');
        return;
      }

      const url = currentDivision.id 
        ? `http://localhost:5000/api/divisi/${currentDivision.id}` 
        : 'http://localhost:5000/api/divisi';
      
      const method = currentDivision.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(
          currentDivision.id ? 'Divisi berhasil diperbarui' : 'Divisi berhasil ditambahkan',
          'success'
        );
        fetchDivisions();
        setOpenDialog(false);
      } else {
        showNotification(data.message || 'Gagal menyimpan data', 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDelete = async () => {
    if (!currentDivision.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/divisi/${currentDivision.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        showNotification('Divisi berhasil dihapus', 'success');
        fetchDivisions();
        setOpenDeleteDialog(false);
      } else {
        showNotification(data.message || 'Gagal menghapus data', 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan sistem', 'error');
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'nama', 
      headerName: 'Nama Divisi', 
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            sx={{ 
              p: 0.5, 
              borderRadius: 1, 
              bgcolor: 'primary.lighter', 
              color: 'primary.main',
              display: 'flex' 
            }}
          >
            <BusinessIcon fontSize="small" />
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'deskripsi', 
      headerName: 'Deskripsi', 
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 120,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleOpenDialog(params.row as Divisi)}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(params.row as Divisi)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs links={[{ label: 'Divisi', href: '/admin/divisi' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Manajemen Divisi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Kelola data divisi dan departemen perusahaan
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#334155' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Tambah Divisi
          </Button>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            height: 600, 
            width: '100%', 
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          <DataGrid
            rows={divisions}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f1f5f9',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontWeight: 600,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: '#f8fafc',
              }
            }}
          />
        </Paper>

        {/* Form Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3, maxWidth: 500, width: '100%' }
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {currentDivision.id ? 'Edit Divisi' : 'Tambah Divisi Baru'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                autoFocus
                label="Nama Divisi"
                fullWidth
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Backend Golang"
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Deskripsi"
                fullWidth
                multiline
                rows={3}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang divisi ini..."
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #e2e8f0', pt: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Batal
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              sx={{ 
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#334155' },
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
             <Typography variant="h6" fontWeight={700}>Konfirmasi Hapus</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Apakah Anda yakin ingin menghapus divisi <strong>{currentDivision.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Batal
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDelete}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', borderRadius: 2 }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default DivisiPage;
