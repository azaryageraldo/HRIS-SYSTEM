import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  Button,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  ReceiptLong,
  Print,
  Close
} from '@mui/icons-material';
import MainLayout from '../../components/MainLayout';
import Breadcrumbs from '../../components/Breadcrumbs';

interface EmployeePayment {
  id: number;
  pengguna_id: number;
  nama_lengkap: string;
  divisi: string;
  bulan: number;
  tahun: number;
  gaji_bersih: number;
  status: string;
  nomor_rekening: string | null;
  nama_pemilik_rekening: string | null;
  bank: string | null;
  dibayar_pada: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<EmployeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<EmployeePayment | null>(null);
  const [openPreview, setOpenPreview] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/finance/history');
      const result = await response.json();
      if (result.success) {
        setPayments(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const handlePrintClick = (payment: EmployeePayment) => {
    setSelectedInvoice(payment);
    setOpenPreview(true);
  };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-area, #invoice-area * {
          visibility: visible;
        }
        #invoice-area {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 20px;
          background: white;
          color: black;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const columns: GridColDef[] = [
    { 
      field: 'dibayar_pada', 
      headerName: 'Tanggal Bayar', 
      width: 180,
      renderCell: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString('id-ID', { 
           day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
      }
    },
    { field: 'nama_lengkap', headerName: 'Karyawan', flex: 1, minWidth: 200 },
    { field: 'divisi', headerName: 'Divisi', width: 150 },
    { 
      field: 'periode', 
      headerName: 'Periode Gaji', 
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.row.tahun, params.row.bulan - 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      }
    },
    { 
      field: 'gaji_bersih', 
      headerName: 'Nominal', 
      width: 150,
      renderCell: (params) => (
        <Typography fontWeight={700} color="#0f172a">
          {formatCurrency(params.value)}
        </Typography>
      )
    },
    {
      field: 'bank',
      headerName: 'Tujuan Transfer',
      width: 200,
      renderCell: (params) => (
        <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.bank || 'BCA'}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.nomor_rekening}</Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: () => (
        <Chip label="Lunas" color="success" size="small" variant="outlined" />
      )
    },
    {
      field: 'actions',
      headerName: 'Cetak',
      width: 80,
      renderCell: (params) => (
        <IconButton color="primary" size="small" onClick={() => handlePrintClick(params.row)}>
           <Print fontSize="small" />
        </IconButton>
      )
    }
  ];

  const totalPaid = payments.reduce((acc, curr) => acc + curr.gaji_bersih, 0);

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Breadcrumbs />
        
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.025em' }}>
              Riwayat Pembayaran
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Arsip transfer gaji yang telah berhasil diproses.
            </Typography>
          </Box>
        </Box>

        {/* Summary Card */}
        <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
             <Avatar sx={{ bgcolor: '#ecfdf5', color: '#10b981', width: 56, height: 56 }}>
                <ReceiptLong fontSize="large" />
             </Avatar>
             <Box>
               <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Dana Tersalurkan</Typography>
               <Typography variant="h4" fontWeight={800} color="#0f172a">
                 {formatCurrency(totalPaid)}
               </Typography>
               <Typography variant="caption" color="text.secondary">
                 {payments.length} Transaksi berhasil
               </Typography>
             </Box>
          </CardContent>
        </Card>

        <Paper sx={{ width: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden' }}>
           <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={payments}
                columns={columns}
                loading={loading}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } }, sorting: { sortModel: [{ field: 'dibayar_pada', sort: 'desc' }] } }}
                pageSizeOptions={[25, 50, 100]}
                disableRowSelectionOnClick
                sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' } }}
              />
           </Box>
        </Paper>

        {/* Invoice Preview Dialog */}
        <Dialog 
          open={openPreview} 
          onClose={() => setOpenPreview(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
           <Box sx={{ bgcolor: '#1e293b', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }} className="no-print">
              <Typography variant="h6" fontWeight={600}>Preview Invoice</Typography>
              <Box>
                <Button 
                   variant="contained" 
                   color="info" 
                   startIcon={<Print />}
                   onClick={handlePrint}
                   sx={{ mr: 1, fontWeight: 600 }}
                >
                  Cetak Invoice
                </Button>
                <IconButton onClick={() => setOpenPreview(false)} sx={{ color: 'white' }}>
                   <Close />
                </IconButton>
              </Box>
           </Box>
           
           <DialogContent sx={{ p: 0, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'center', py: 4 }}>
              {selectedInvoice && (
                <Paper 
                  id="invoice-area"
                  elevation={3} 
                  sx={{ 
                    width: '100%', 
                    maxWidth: '210mm', 
                    minHeight: '297mm', // A4 size
                    p: 6, 
                    bgcolor: 'white',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}
                >
                   {/* Invoice Header */}
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
                      <Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Box sx={{ width: 40, height: 40, bgcolor: '#0f172a', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>HR</Box>
                            <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">HRIS SYSTEM</Typography>
                         </Box>
                         <Typography variant="body2" color="text.secondary">Jalan Teknologi No. 12<br/>Jakarta Selatan, 12345<br/>Indonesia</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography variant="h4" fontWeight={900} sx={{ color: '#e2e8f0', letterSpacing: '0.1em' }}>INVOICE</Typography>
                         <Typography variant="subtitle1" fontWeight={600} color="text.primary">#INV-{selectedInvoice.id.toString().padStart(6, '0')}</Typography>
                         <Typography variant="body2" color="text.secondary">Tanggal: {formatDate(selectedInvoice.dibayar_pada)}</Typography>
                      </Box>
                   </Box>

                   <Divider sx={{ mb: 6 }} />

                   {/* Bil To & Pay To */}
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
                      <Box sx={{ width: '48%' }}>
                         <Typography variant="overline" color="text.secondary" fontWeight={700}>DIBAYARKAN KEPADA</Typography>
                         <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mt: 1 }}>{selectedInvoice.nama_lengkap}</Typography>
                         <Typography variant="body2" color="text.secondary">{selectedInvoice.divisi}</Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>ID Karyawan: {selectedInvoice.pengguna_id.toString().padStart(4, '0')}</Typography>
                      </Box>
                      <Box sx={{ width: '48%', textAlign: 'right' }}>
                         <Typography variant="overline" color="text.secondary" fontWeight={700}>DETAIL TRANSFER</Typography>
                         <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mt: 1 }}>{selectedInvoice.bank || 'BCA'}</Typography>
                         <Typography variant="body2" color="text.secondary">No. Rek: {selectedInvoice.nomor_rekening || '-'}</Typography>
                         <Typography variant="body2" color="text.secondary">a.n {selectedInvoice.nama_pemilik_rekening || selectedInvoice.nama_lengkap}</Typography>
                      </Box>
                   </Box>

                   {/* Item Details */}
                   <TableContainer sx={{ mb: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <Table>
                         <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                               <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DESKRIPSI</TableCell>
                               <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>PERIODE</TableCell>
                               <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>JUMLAH</TableCell>
                            </TableRow>
                         </TableHead>
                         <TableBody>
                            <TableRow>
                               <TableCell>
                                  <Typography variant="subtitle2" fontWeight={600}>Pembayaran Gaji Bulanan</Typography>
                                  <Typography variant="caption" color="text.secondary">Gaji pokok, tunjangan, dan lembur dikurangi potongan.</Typography>
                               </TableCell>
                               <TableCell align="right">
                                  {new Date(selectedInvoice.tahun, selectedInvoice.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                               </TableCell>
                               <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(selectedInvoice.gaji_bersih)}
                               </TableCell>
                            </TableRow>
                         </TableBody>
                      </Table>
                   </TableContainer>

                   {/* Total */}
                   <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 8 }}>
                      <Box sx={{ width: 250 }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatCurrency(selectedInvoice.gaji_bersih)}</Typography>
                         </Box>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Pajak (PPh 21)</Typography>
                            <Typography variant="body2" fontWeight={600}>Termasuk</Typography>
                         </Box>
                         <Divider sx={{ mb: 2 }} />
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={800} color="#0f172a">TOTAL</Typography>
                            <Typography variant="h6" fontWeight={800} color="primary">{formatCurrency(selectedInvoice.gaji_bersih)}</Typography>
                         </Box>
                      </Box>
                   </Box>

                   {/* Stamp Status */}
                   <Box 
                      sx={{ 
                         position: 'absolute', 
                         top: 350, 
                         right: 100, 
                         width: 150, 
                         height: 150, 
                         border: '4px solid #10b981', 
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         transform: 'rotate(-15deg)',
                         opacity: 0.2,
                         pointerEvents: 'none'
                      }}
                   >
                     <Typography variant="h4" fontWeight={900} color="#10b981">LUNAS</Typography>
                   </Box>

                   {/* Footer */}
                   <Box sx={{ mt: 'auto', textAlign: 'center', pt: 8 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Terima kasih atas kerja keras Anda!</Typography>
                      <Typography variant="caption" color="text.disabled">Dokumen ini diterbitkan secara otomatis oleh sistem HRIS dan sah tanpa tanda tangan.</Typography>
                   </Box>

                </Paper>
              )}
           </DialogContent>
        </Dialog>

      </Box>
    </MainLayout>
  );
};

export default PaymentHistory;
