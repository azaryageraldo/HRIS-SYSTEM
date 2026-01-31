import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DivisiPage from './pages/admin/Divisi';
import SalaryConfigPage from './pages/admin/SalaryConfig';
import LeaveConfigPage from './pages/admin/LeaveConfig';
import AttendanceConfigPage from './pages/admin/AttendanceConfig';
import UserManagementPage from './pages/admin/UserManagement';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#424242', // Gray theme
    },
    secondary: {
      main: '#616161',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Root redirect - will redirect based on role after login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/divisi"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <DivisiPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/salary-config"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <SalaryConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/config/leave"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <LeaveConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/config/attendance"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <AttendanceConfigPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[1]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
