import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Pengguna, CreatePenggunaRequest, UpdatePenggunaRequest } from '../types';
import db from '../config/database';

class PenggunaModel {
  static async getAll(): Promise<Pengguna[]> {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        p.id, 
        p.username, 
        p.email, 
        p.nama_lengkap, 
        p.telepon,
        pr.nama AS peran,
        d.nama AS divisi,
        p.aktif,
        p.dibuat_pada
      FROM pengguna p
      LEFT JOIN peran pr ON p.peran_id = pr.id
      LEFT JOIN divisi d ON p.divisi_id = d.id
      WHERE p.aktif = TRUE
    `);
    return rows as Pengguna[];
  }

  static async getById(id: number): Promise<Pengguna | null> {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        p.id, 
        p.username, 
        p.email, 
        p.nama_lengkap, 
        p.telepon,
        p.peran_id,
        p.divisi_id,
        p.nama_bank,
        p.nomor_rekening,
        p.nama_pemilik_rekening,
        pr.nama AS peran,
        d.nama AS divisi,
        p.aktif,
        p.dibuat_pada,
        p.diperbarui_pada
      FROM pengguna p
      LEFT JOIN peran pr ON p.peran_id = pr.id
      LEFT JOIN divisi d ON p.divisi_id = d.id
      WHERE p.id = ?
    `, [id]);
    return rows.length > 0 ? (rows[0] as Pengguna) : null;
  }

  static async getByUsername(username: string): Promise<Pengguna | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM pengguna WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? (rows[0] as Pengguna) : null;
  }

  static async create(data: CreatePenggunaRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO pengguna 
       (username, email, password, nama_lengkap, telepon, peran_id, divisi_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.username, data.email, data.password, data.nama_lengkap, 
       data.telepon || null, data.peran_id, data.divisi_id || null]
    );
    return result.insertId;
  }

  static async update(id: number, data: UpdatePenggunaRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE pengguna 
       SET nama_lengkap = ?, telepon = ?, divisi_id = ?, 
           nama_bank = ?, nomor_rekening = ?, nama_pemilik_rekening = ?
       WHERE id = ?`,
      [data.nama_lengkap, data.telepon, data.divisi_id, 
       data.nama_bank, data.nomor_rekening, data.nama_pemilik_rekening, id]
    );
    return result.affectedRows;
  }

  static async delete(id: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE pengguna SET aktif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default PenggunaModel;
