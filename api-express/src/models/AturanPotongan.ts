import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface AturanPotongan {
  id: number;
  nama: string;
  tipe_potongan: 'tetap' | 'persentase';
  nilai_potongan: number;
  deskripsi: string;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

class AturanPotonganModel {
  static async getAll(): Promise<AturanPotongan[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM aturan_potongan WHERE aktif = true ORDER BY id ASC'
    );
    return rows as AturanPotongan[];
  }

  static async getById(id: number): Promise<AturanPotongan | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM aturan_potongan WHERE id = ? AND aktif = true',
      [id]
    );
    return (rows[0] as AturanPotongan) || null;
  }

  static async create(data: Partial<AturanPotongan>): Promise<AturanPotongan> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO aturan_potongan (nama, tipe_potongan, nilai_potongan, deskripsi) VALUES (?, ?, ?, ?)',
      [data.nama, data.tipe_potongan, data.nilai_potongan, data.deskripsi]
    );
    return (await this.getById(result.insertId)) as AturanPotongan;
  }

  static async update(id: number, data: Partial<AturanPotongan>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE aturan_potongan SET nama = ?, tipe_potongan = ?, nilai_potongan = ?, deskripsi = ? WHERE id = ?',
      [data.nama, data.tipe_potongan, data.nilai_potongan, data.deskripsi, id]
    );
    return result.affectedRows;
  }

  static async delete(id: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE aturan_potongan SET aktif = false WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default AturanPotonganModel;
