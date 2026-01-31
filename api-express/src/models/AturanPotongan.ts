import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/database';

export interface AturanPotongan {
  id: number;
  nama: string;
  tipe_potongan: 'tetap' | 'persentase';
  nilai_potongan: number;
  deskripsi?: string;
  aktif: boolean;
  dibuat_pada?: Date;
  diperbarui_pada?: Date;
}

export interface CreateAturanPotonganRequest {
  nama: string;
  tipe_potongan: 'tetap' | 'persentase';
  nilai_potongan: number;
  deskripsi?: string;
}

export interface UpdateAturanPotonganRequest {
  nama?: string;
  tipe_potongan?: 'tetap' | 'persentase';
  nilai_potongan?: number;
  deskripsi?: string;
}

class AturanPotonganModel {
  /**
   * Get all active deduction rules
   */
  static async getAll(): Promise<AturanPotongan[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, nama, tipe_potongan, nilai_potongan, deskripsi, aktif, 
              dibuat_pada, diperbarui_pada 
       FROM aturan_potongan 
       WHERE aktif = TRUE
       ORDER BY nama ASC`
    );
    return rows as AturanPotongan[];
  }

  /**
   * Get deduction rule by ID
   */
  static async getById(id: number): Promise<AturanPotongan | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, nama, tipe_potongan, nilai_potongan, deskripsi, aktif,
              dibuat_pada, diperbarui_pada 
       FROM aturan_potongan 
       WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as AturanPotongan) : null;
  }

  /**
   * Create new deduction rule
   */
  static async create(data: CreateAturanPotonganRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO aturan_potongan (nama, tipe_potongan, nilai_potongan, deskripsi) 
       VALUES (?, ?, ?, ?)`,
      [data.nama, data.tipe_potongan, data.nilai_potongan, data.deskripsi || null]
    );
    return result.insertId;
  }

  /**
   * Update deduction rule
   */
  static async update(id: number, data: UpdateAturanPotonganRequest): Promise<number> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nama !== undefined) {
      fields.push('nama = ?');
      values.push(data.nama);
    }
    if (data.tipe_potongan !== undefined) {
      fields.push('tipe_potongan = ?');
      values.push(data.tipe_potongan);
    }
    if (data.nilai_potongan !== undefined) {
      fields.push('nilai_potongan = ?');
      values.push(data.nilai_potongan);
    }
    if (data.deskripsi !== undefined) {
      fields.push('deskripsi = ?');
      values.push(data.deskripsi);
    }

    if (fields.length === 0) {
      return 0;
    }

    values.push(id);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE aturan_potongan SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  /**
   * Delete (soft delete) deduction rule
   */
  static async delete(id: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE aturan_potongan SET aktif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default AturanPotonganModel;
