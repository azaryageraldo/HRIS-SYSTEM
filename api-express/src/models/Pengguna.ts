import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Pengguna {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional for response
  nama_lengkap: string;
  peran_id: number;
  divisi_id: number | null;
  nama_peran?: string;
  nama_divisi?: string;
  aktif: boolean;
  dibuat_pada: string;
}

class PenggunaModel {
  static async getAll(): Promise<Pengguna[]> {
    const query = `
      SELECT p.id, p.username, p.email, p.nama_lengkap, p.peran_id, p.divisi_id, p.aktif, p.dibuat_pada,
             r.nama as nama_peran, d.nama as nama_divisi
      FROM pengguna p
      JOIN peran r ON p.peran_id = r.id
      LEFT JOIN divisi d ON p.divisi_id = d.id
      ORDER BY p.dibuat_pada DESC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as Pengguna[];
  }

  static async create(data: Partial<Pengguna>): Promise<number> {
    const query = `
      INSERT INTO pengguna (username, email, password, nama_lengkap, peran_id, divisi_id, aktif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      data.username,
      data.email,
      data.password,
      data.nama_lengkap,
      data.peran_id,
      data.divisi_id || null,
      true
    ]);
    return result.insertId;
  }

  static async update(id: number, data: Partial<Pengguna>): Promise<boolean> {
     let query = 'UPDATE pengguna SET username = ?, email = ?, nama_lengkap = ?, peran_id = ?, divisi_id = ?';
     const params: any[] = [data.username, data.email, data.nama_lengkap, data.peran_id, data.divisi_id || null];
     
     if (data.password) {
       query += ', password = ?';
       params.push(data.password);
     }
     
     query += ' WHERE id = ?';
     params.push(id);

     const [result] = await pool.query<ResultSetHeader>(query, params);
     return result.affectedRows > 0;
  }

  static async toggleActive(id: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT aktif FROM pengguna WHERE id = ?', [id]);
    if (rows.length === 0) return false;
    
    const newStatus = !rows[0].aktif;
    await pool.query('UPDATE pengguna SET aktif = ? WHERE id = ?', [newStatus, id]);
    return true;
  }
  
  static async findById(id: number): Promise<Pengguna | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM pengguna WHERE id = ?', [id]);
    return (rows[0] as Pengguna) || null;
  }
  
  static async findByEmail(email: string): Promise<Pengguna | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM pengguna WHERE email = ?', [email]);
    return (rows[0] as Pengguna) || null;
  }

  static async findByUsername(username: string): Promise<Pengguna | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM pengguna WHERE username = ?', [username]);
    return (rows[0] as Pengguna) || null;
  }
}

export default PenggunaModel;
