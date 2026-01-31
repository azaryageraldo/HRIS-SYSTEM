import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Person
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface User {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  peran_id: number;
  divisi_id: number | null;
  nama_peran: string;
  nama_divisi: string | null;
  aktif: boolean;
}

interface Role {
  id: number;
  nama: string;
  deskripsi: string;
}

interface Division {
  id: number;
  nama: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User & { password?: string }>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, divisionsRes] = await Promise.all([
        fetch('http://localhost:5000/api/pengguna'),
        fetch('http://localhost:5000/api/pengguna/roles'),
        fetch('http://localhost:5000/api/divisi')
      ]);
      
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      const divisionsData = await divisionsRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (rolesData.success) setRoles(rolesData.data);
      if (divisionsData.success) setDivisions(divisionsData.data);

    } catch (error) {
      showNotification('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleOpenDialog = (user?: User) => {
    setCurrentUser(user || {
      username: '',
      email: '',
      password: '',
      nama_lengkap: '',
      peran_id: 4, // Default to Karyawan
      divisi_id: null,
      aktif: true
    });
    setOpenDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      const url = currentUser.id
        ? `http://localhost:5000/api/pengguna/${currentUser.id}`
        : 'http://localhost:5000/api/pengguna';
      const method = currentUser.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser)
      });
      const data = await res.json();

      if (data.success) {
        showNotification(currentUser.id ? 'User berhasil diperbarui' : 'User berhasil dibuat', 'success');
        setOpenDialog(false);
        fetchData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Terjadi kesalahan', 'error');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pengguna/${id}/status`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Status user diperbarui', 'success');
        fetchData();
      }
    } catch (error) {
      showNotification('Gagal mengubah status', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 150 },
    { field: 'nama_lengkap', headerName: 'Nama Lengkap', flex: 1.5, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { 
      field: 'nama_peran', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={
            params.value === 'admin' ? 'error' :
            params.value === 'hr' ? 'warning' :
            params.value === 'keuangan' ? 'info' : 'default'
          }
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    { field: 'nama_divisi', headerName: 'Divisi', flex: 1, minWidth: 150 },
    { 
      field: 'aktif', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Aktif' : 'Nonaktif'} 
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Aksi',
      flex: 1,
      minWidth: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row as User)}>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={() => handleToggleStatus(params.row.id)}>
             {params.row.aktif ? (
               <BlockIcon fontSize="small" color="error" />
             ) : (
               <CheckIcon fontSize="small" color="success" />
             )}
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs links={[{ label: 'Manajemen User', href: '/admin/users' }]} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Manajemen Pengguna
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Kelola akun pengguna, role, dan status aktif
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#0f172a', textTransform: 'none', borderRadius: 2 }}
          >
            Tambah User
          </Button>
        </Box>

        <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
          />
        </Box>

        {/* User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> {currentUser.id ? 'Edit User' : 'Tambah User Baru'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField 
                label="Username" 
                fullWidth 
                value={currentUser.username} 
                onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
              />
              <TextField 
                label="Email" 
                type="email"
                fullWidth 
                value={currentUser.email} 
                onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
              />
              <TextField 
                label={currentUser.id ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                type="password"
                fullWidth 
                value={currentUser.password} 
                onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
              />
              <TextField 
                label="Nama Lengkap" 
                fullWidth 
                value={currentUser.nama_lengkap} 
                onChange={(e) => setCurrentUser({...currentUser, nama_lengkap: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={currentUser.peran_id}
                  label="Role"
                  onChange={(e) => setCurrentUser({...currentUser, peran_id: Number(e.target.value)})}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>{role.nama} - {role.deskripsi}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Show Division select only if role is Karyawan (4) or relevant roles */}
              <FormControl fullWidth>
                <InputLabel>Divisi (Opsional)</InputLabel>
                <Select
                  value={currentUser.divisi_id || ''}
                  label="Divisi (Opsional)"
                  onChange={(e) => setCurrentUser({...currentUser, divisi_id: e.target.value ? Number(e.target.value) : null})}
                >
                  <MenuItem value=""><em>Tidak Ada</em></MenuItem>
                  {divisions.map(div => (
                    <MenuItem key={div.id} value={div.id}>{div.nama}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button variant="contained" onClick={handleSaveUser} sx={{ bgcolor: '#0f172a' }}>Simpan</Button>
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

export default UserManagementPage;
