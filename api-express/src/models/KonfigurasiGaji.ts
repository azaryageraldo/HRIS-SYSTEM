import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { KonfigurasiGaji } from '../types';
import db from '../config/database';

interface CreateKonfigurasiGajiRequest {
  divisi_id: number;
  gaji_pokok: number;
  tanggal_berlaku: Date | string;
}

interface UpdateKonfigurasiGajiRequest {
  gaji_pokok?: number;
  tanggal_berlaku?: Date | string;
}

class KonfigurasiGajiModel {
  static async getAll(): Promise<KonfigurasiGaji[]> {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        kg.id,
        kg.divisi_id,
        d.nama AS nama_divisi,
        kg.gaji_pokok,
        kg.tanggal_berlaku,
        kg.aktif,
        kg.dibuat_pada
      FROM konfigurasi_gaji kg
      JOIN divisi d ON kg.divisi_id = d.id
      WHERE kg.aktif = TRUE
      ORDER BY kg.tanggal_berlaku DESC
    `);
    return rows as KonfigurasiGaji[];
  }

  static async getByDivisi(divisi_id: number): Promise<KonfigurasiGaji | null> {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT * FROM konfigurasi_gaji 
      WHERE divisi_id = ? AND aktif = TRUE
      ORDER BY tanggal_berlaku DESC
      LIMIT 1
    `, [divisi_id]);
    return rows.length > 0 ? (rows[0] as KonfigurasiGaji) : null;
  }

  static async create(data: CreateKonfigurasiGajiRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO konfigurasi_gaji (divisi_id, gaji_pokok, tanggal_berlaku) 
       VALUES (?, ?, ?)`,
      [data.divisi_id, data.gaji_pokok, data.tanggal_berlaku]
    );
    return result.insertId;
  }

  static async update(id: number, data: UpdateKonfigurasiGajiRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE konfigurasi_gaji 
       SET gaji_pokok = ?, tanggal_berlaku = ? 
       WHERE id = ?`,
      [data.gaji_pokok, data.tanggal_berlaku, id]
    );
    return result.affectedRows;
  }
}

export default KonfigurasiGajiModel;
