import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { LoginRequest, RegisterRequest, ApiResponse, LoginResponse, AuthUser, Pengguna } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request<{}, {}, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: errors.array().map(e => e.msg).join(', ')
        });
        return;
      }

      const { username, password } = req.body;

      // Find user by username or email
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 
          p.id, 
          p.username, 
          p.email, 
          p.password,
          p.nama_lengkap, 
          p.peran_id,
          p.divisi_id,
          pr.nama AS peran,
          d.nama AS divisi,
          p.aktif
        FROM pengguna p
        LEFT JOIN peran pr ON p.peran_id = pr.id
        LEFT JOIN divisi d ON p.divisi_id = d.id
        WHERE (p.username = ? OR p.email = ?) AND p.aktif = TRUE`,
        [username, username]
      );

      if (rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
        return;
      }

      const user = rows[0] as Pengguna & { password: string };

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
        return;
      }

      // Generate JWT token
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          peran_id: user.peran_id
        },
        secret,
        { expiresIn: '24h' }
      );

      // Prepare user response (without password)
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        peran: user.peran || '',
        peran_id: user.peran_id,
        divisi: user.divisi,
        divisi_id: user.divisi_id
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: authUser
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// POST /api/auth/register (Employee self-registration)
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('nama_lengkap').trim().notEmpty().withMessage('Full name is required'),
    body('telepon').optional().trim(),
    body('divisi_id').optional().isInt().withMessage('Invalid division ID')
  ],
  async (req: Request<{}, {}, RegisterRequest>, res: Response<ApiResponse>): Promise<void> => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          error: errors.array().map(e => e.msg).join(', ')
        });
        return;
      }

      const { username, email, password, nama_lengkap, telepon, divisi_id } = req.body;

      // Check if username or email already exists
      const [existing] = await db.query<RowDataPacket[]>(
        'SELECT id FROM pengguna WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existing.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user (default role: Karyawan = 4)
      const [result] = await db.query(
        `INSERT INTO pengguna 
        (username, email, password, nama_lengkap, telepon, peran_id, divisi_id, aktif) 
        VALUES (?, ?, ?, ?, ?, 4, ?, TRUE)`,
        [username, email, hashedPassword, nama_lengkap, telepon || null, divisi_id || null]
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please login.',
        data: { id: (result as any).insertId }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/auth/me (Get current user info)
router.get(
  '/me',
  authenticateToken,
  async (req: Request, res: Response<ApiResponse<AuthUser>>): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      // Get user details
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 
          p.id, 
          p.username, 
          p.email, 
          p.nama_lengkap, 
          p.peran_id,
          p.divisi_id,
          pr.nama AS peran,
          d.nama AS divisi
        FROM pengguna p
        LEFT JOIN peran pr ON p.peran_id = pr.id
        LEFT JOIN divisi d ON p.divisi_id = d.id
        WHERE p.id = ? AND p.aktif = TRUE`,
        [req.user.userId]
      );

      if (rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const user = rows[0] as Pengguna;
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        nama_lengkap: user.nama_lengkap,
        peran: user.peran || '',
        peran_id: user.peran_id,
        divisi: user.divisi,
        divisi_id: user.divisi_id
      };

      res.json({
        success: true,
        data: authUser
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user info',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// POST /api/auth/logout (Optional - client-side token removal)
router.post('/logout', (_req: Request, res: Response<ApiResponse>): void => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
