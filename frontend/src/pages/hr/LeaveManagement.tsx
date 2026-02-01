import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveRequest {
  id: number;
  pengguna_id: number;
  nama_lengkap: string;
  divisi: string | null;
  tipe_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_hari: number;
  alasan: string;
  status: string;
  sisa_cuti: number;
  catatan_persetujuan: string | null;
}

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: Menunggu, 1: Riwayat
  
  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/hr/cuti');
      const result = await response.json();
      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDialog = (req: LeaveRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setActionType(type);
    setNotes('');
    setOpenDialog(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !actionType || !user) return;

    try {
      const status = actionType === 'approve' ? 'disetujui' : 'ditolak';
      const response = await fetch(`http://localhost:8080/api/hr/cuti/${selectedRequest.id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          disetujui_oleh: user.id, // ID Admin/HR logged in
          catatan_persetujuan: notes
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOpenDialog(false);
        fetchRequests(); // Refresh data
        setSnackbar({
          open: true,
          message: `Pengajuan berhasil ${actionType === 'approve' ? 'disetujui' : 'ditolak'}`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Gagal memproses: ' + result.message,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Terjadi kesalahan saat memproses data',
        severity: 'error'
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    if (tabValue === 0) return req.status === 'menunggu';
    return req.status !== 'menunggu';
  });

  const columns: GridColDef[] = [
    { field: 'nama_lengkap', headerName: 'Nama Karyawan', flex: 1.5, minWidth: 200 },
    { field: 'divisi', headerName: 'Divisi', flex: 1, minWidth: 150 },
    { field: 'tipe_cuti', headerName: 'Tipe', width: 100, renderCell: (params) => <Chip label={params.value} size="small" sx={{ textTransform: 'capitalize' }} /> },
    { field: 'tanggal_mulai', headerName: 'Mulai', width: 120 },
    { field: 'total_hari', headerName: 'Hari', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'sisa_cuti', headerName: 'Sisa Cuti', width: 100, align: 'center', headerAlign: 'center', renderCell: (params) => 
      <Typography fontWeight={700} color={params.value < 0 ? 'error' : 'default'}>{params.value}</Typography> 
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        let color: 'warning' | 'success' | 'error' | 'default' = 'default';
        let icon = <Pending fontSize="small" />;
        
        if (params.value === 'disetujui') {
          color = 'success';
          icon = <CheckCircle fontSize="small" />;
        } else if (params.value === 'ditolak') {
          color = 'error';
          icon = <Cancel fontSize="small" />;
        } else {
          color = 'warning';
        }

        return (
          <Chip 
            icon={icon} 
            label={params.value} 
            color={color} 
            size="small" 
            variant="outlined"
            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
          />
        );
      }
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
          {params.row.status === 'menunggu' ? (
            <>
              <Tooltip title="Setujui">
                <IconButton color="success" size="small" onClick={() => handleOpenDialog(params.row, 'approve')}>
                  <ApproveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Tolak">
                <IconButton color="error" size="small" onClick={() => handleOpenDialog(params.row, 'reject')}>
                  <RejectIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
             <Tooltip title="Lihat Detail">
                <IconButton size="small">
                  <Visibility />
                </IconButton>
              </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
              Manajemen Izin & Cuti
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Kelola dan validasi pengajuan cuti karyawan
            </Typography>
          </Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchRequests}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Box>

        <Paper sx={{ width: '100%', mb: 3, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
           <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
             <Tab label="Menunggu Persetujuan" />
             <Tab label="Riwayat Pengajuan" />
           </Tabs>
           
           <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredRequests}
              columns={columns}
              loading={loading}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
              pageSizeOptions={[10, 25]}
              disableRowSelectionOnClick
              sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
            />
           </Box>
        </Paper>

        {/* Approval Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: actionType === 'approve' ? '#16a34a' : '#dc2626' }}>
            {actionType === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
          </DialogTitle>
          <DialogContent>
             <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
               <Typography variant="body1">
                 Anda akan <b>{actionType === 'approve' ? 'MENYETUJUI' : 'MENOLAK'}</b> pengajuan cuti dari <b>{selectedRequest?.nama_lengkap}</b>.
               </Typography>
               
               <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                 <Typography variant="body2" color="text.secondary">Alasan Cuti:</Typography>
                 <Typography variant="body1" fontWeight={500}>{selectedRequest?.alasan}</Typography>
                 <Typography variant="caption" color="text.secondary">Total: {selectedRequest?.total_hari} Hari</Typography>
               </Box>

               <TextField
                 label="Catatan (Opsional)"
                 multiline
                 rows={3}
                 fullWidth
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 placeholder="Tambahkan catatan untuk karyawan..."
               />
             </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button 
              variant="contained" 
              onClick={handleProcessRequest}
              color={actionType === 'approve' ? 'success' : 'error'}
              sx={{ boxShadow: 'none' }}
            >
              Konfirmasi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Alert */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default LeaveManagement;
