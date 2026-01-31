import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import PenggunaModel from '../models/Pengguna';
import PeranModel from '../models/Peran';

export class UserController {
  static async getUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await PenggunaModel.getAll();
      // Remove password from response
      const safeUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      res.json({
        success: true,
        data: safeUsers
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await PeranModel.getAll();
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, nama_lengkap, peran_id, divisi_id } = req.body;

      if (!username || !email || !password || !nama_lengkap || !peran_id) {
        res.status(400).json({
          success: false,
          message: 'Semua kolom wajib diisi'
        });
        return;
      }

      // Check duplicate
      const existingEmail = await PenggunaModel.findByEmail(email);
      if (existingEmail) {
        res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        return;
      }
      
      const existingUser = await PenggunaModel.findByUsername(username);
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Username sudah digunakan' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await PenggunaModel.create({
        username,
        email,
        password: hashedPassword,
        nama_lengkap,
        peran_id,
        divisi_id
      });

      res.status(201).json({
        success: true,
        message: 'Pengguna berhasil dibuat'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      const { username, email, password, nama_lengkap, peran_id, divisi_id } = req.body;

      // Check if user exists
      const user = await PenggunaModel.findById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
        return;
      }

      // Prepare update data
      const updateData: any = {
        username,
        email,
        nama_lengkap,
        peran_id,
        divisi_id
      };

      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await PenggunaModel.update(id, updateData);

      res.json({
        success: true,
        message: 'Pengguna berhasil diperbarui'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      
      const success = await PenggunaModel.toggleActive(id);
      
      if (!success) {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
        return;
      }

      res.json({
        success: true,
        message: 'Status pengguna berhasil diperbarui'
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }
}
