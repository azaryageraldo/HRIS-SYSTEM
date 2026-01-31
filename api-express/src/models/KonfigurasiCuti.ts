import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/database';

export interface KonfigurasiCuti {
  id: number;
  divisi_id: number;
  nama_divisi?: string;
  jatah_cuti_tahunan: number;
  tahun_berlaku: number;
  aktif: boolean;
  dibuat_pada?: Date;
  diperbarui_pada?: Date;
}

export interface CreateKonfigurasiCutiRequest {
  divisi_id: number;
  jatah_cuti_tahunan: number;
  tahun_berlaku: number;
}

export interface UpdateKonfigurasiCutiRequest {
  jatah_cuti_tahunan?: number;
  tahun_berlaku?: number;
}

class KonfigurasiCutiModel {
  /**
   * Get all leave configurations with division names
   */
  static async getAll(): Promise<KonfigurasiCuti[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        kc.id,
        kc.divisi_id,
        d.nama AS nama_divisi,
        kc.jatah_cuti_tahunan,
        kc.tahun_berlaku,
        kc.aktif,
        kc.dibuat_pada,
        kc.diperbarui_pada
       FROM konfigurasi_cuti kc
       JOIN divisi d ON kc.divisi_id = d.id
       WHERE kc.aktif = TRUE
       ORDER BY kc.tahun_berlaku DESC, d.nama ASC`
    );
    return rows as KonfigurasiCuti[];
  }

  /**
   * Get leave configuration by ID
   */
  static async getById(id: number): Promise<KonfigurasiCuti | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        kc.id,
        kc.divisi_id,
        d.nama AS nama_divisi,
        kc.jatah_cuti_tahunan,
        kc.tahun_berlaku,
        kc.aktif,
        kc.dibuat_pada,
        kc.diperbarui_pada
       FROM konfigurasi_cuti kc
       JOIN divisi d ON kc.divisi_id = d.id
       WHERE kc.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as KonfigurasiCuti) : null;
  }

  /**
   * Get leave configuration by division and year
   */
  static async getByDivisiAndYear(divisi_id: number, tahun: number): Promise<KonfigurasiCuti | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        kc.id,
        kc.divisi_id,
        d.nama AS nama_divisi,
        kc.jatah_cuti_tahunan,
        kc.tahun_berlaku,
        kc.aktif
       FROM konfigurasi_cuti kc
       JOIN divisi d ON kc.divisi_id = d.id
       WHERE kc.divisi_id = ? AND kc.tahun_berlaku = ? AND kc.aktif = TRUE`,
      [divisi_id, tahun]
    );
    return rows.length > 0 ? (rows[0] as KonfigurasiCuti) : null;
  }

  /**
   * Create new leave configuration
   */
  static async create(data: CreateKonfigurasiCutiRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO konfigurasi_cuti (divisi_id, jatah_cuti_tahunan, tahun_berlaku) 
       VALUES (?, ?, ?)`,
      [data.divisi_id, data.jatah_cuti_tahunan, data.tahun_berlaku]
    );
    return result.insertId;
  }

  /**
   * Update leave configuration
   */
  static async update(id: number, data: UpdateKonfigurasiCutiRequest): Promise<number> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.jatah_cuti_tahunan !== undefined) {
      fields.push('jatah_cuti_tahunan = ?');
      values.push(data.jatah_cuti_tahunan);
    }
    if (data.tahun_berlaku !== undefined) {
      fields.push('tahun_berlaku = ?');
      values.push(data.tahun_berlaku);
    }

    if (fields.length === 0) {
      return 0;
    }

    values.push(id);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE konfigurasi_cuti SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  /**
   * Delete (soft delete) leave configuration
   */
  static async delete(id: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE konfigurasi_cuti SET aktif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default KonfigurasiCutiModel;
