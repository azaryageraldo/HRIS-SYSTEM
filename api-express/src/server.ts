import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '5000');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Database connection test
import './config/database';

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Express API - Panel Admin',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'HRIS Express API - Panel Admin Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      dashboard: '/api/admin/dashboard',
      divisi: '/api/divisi',
      konfigurasiGaji: '/api/konfigurasi-gaji',
      konfigurasiCuti: '/api/konfigurasi-cuti',
      konfigurasiPresensi: '/api/konfigurasi-presensi',
      pengguna: '/api/pengguna'
    }
  });
});

// Register routes
import divisiRoutes from './routes/divisi';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';

app.use('/api/auth', authRoutes);
app.use('/api/divisi', divisiRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// TODO: Uncomment when ready
// import konfigurasiGajiRoutes from './routes/konfigurasiGaji';
// import konfigurasiCutiRoutes from './routes/konfigurasiCuti';
// import konfigurasiPresensiRoutes from './routes/konfigurasiPresensi';
// import penggunaRoutes from './routes/pengguna';
// app.use('/api/konfigurasi-gaji', konfigurasiGajiRoutes);
// app.use('/api/konfigurasi-cuti', konfigurasiCutiRoutes);
// app.use('/api/konfigurasi-presensi', konfigurasiPresensiRoutes);
// app.use('/api/pengguna', penggunaRoutes);

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Express API (Panel Admin) running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
