import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DivisiPage from './pages/admin/Divisi';
import SalaryConfigPage from './pages/admin/SalaryConfig';
import LeaveConfigPage from './pages/admin/LeaveConfig';
import AttendanceConfigPage from './pages/admin/AttendanceConfig';
import UserManagementPage from './pages/admin/UserManagement';
import HRDashboard from './pages/hr/Dashboard';
import MonitoringPresensi from './pages/hr/MonitoringPresensi';
import LeaveManagement from './pages/hr/LeaveManagement';
import PayrollDraft from './pages/hr/PayrollDraft';
import FinanceDashboard from './pages/finance/Dashboard';
import SalaryPayment from './pages/finance/SalaryPayment';
import PaymentHistory from './pages/finance/PaymentHistory';
import Reports from './pages/finance/Reports';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeave from './pages/employee/Leave';
import EmployeeSalary from './pages/employee/Salary';

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

const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  
  console.log('[RootRedirect] State:', { user, isLoading });

  if (isLoading) return null; // Wait for auth to load
  if (!user) {
    console.log('[RootRedirect] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[RootRedirect] User role:', user.peran_id);

  switch (user.peran_id) {
    case 1: return <Navigate to="/admin/dashboard" replace />;
    case 2: return <Navigate to="/hr/dashboard" replace />;
    case 3: return <Navigate to="/finance/dashboard" replace />;
    case 4: return <Navigate to="/employee/dashboard" replace />;
    default: 
      console.log('[RootRedirect] Unknown role, redirecting to login');
      return <Navigate to="/login" replace />;
  }
};

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
                  <RootRedirect />
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

            {/* HR Routes */}
            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/presensi"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <MonitoringPresensi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/cuti"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <LeaveManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/gaji"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <PayrollDraft />
                </ProtectedRoute>
              }
            />
            
            {/* Finance Routes */}
            <Route
              path="/finance/dashboard"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <FinanceDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance/salary-payment"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <SalaryPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance/payment-history"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <PaymentHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance/reports"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance/payment"
              element={
                <ProtectedRoute allowedRoles={[3]}>
                  <FinanceDashboard /> {/* Temporary placeholder until Payment page created */}
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={[4]}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={[4]}>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/attendance"
              element={
                <ProtectedRoute allowedRoles={[4]}>
                  <EmployeeAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/leave"
              element={
                <ProtectedRoute allowedRoles={[4]}>
                  <EmployeeLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/salary"
              element={
                <ProtectedRoute allowedRoles={[4]}>
                  <EmployeeSalary />
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
