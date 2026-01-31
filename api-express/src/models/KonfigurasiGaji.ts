import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface KonfigurasiGaji {
  id: number;
  divisi_id: number;
  nama_divisi?: string;
  gaji_pokok: number;
  tanggal_berlaku: string;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

class KonfigurasiGajiModel {
  static async getAll(): Promise<KonfigurasiGaji[]> {
    const query = `
      SELECT kg.*, d.nama as nama_divisi 
      FROM konfigurasi_gaji kg
      JOIN divisi d ON kg.divisi_id = d.id
      WHERE kg.aktif = true AND d.aktif = true
      ORDER BY d.nama ASC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as KonfigurasiGaji[];
  }

  static async getByDivisionId(divisiId: number): Promise<KonfigurasiGaji | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM konfigurasi_gaji WHERE divisi_id = ? AND aktif = true ORDER BY id DESC LIMIT 1',
      [divisiId]
    );
    return (rows[0] as KonfigurasiGaji) || null;
  }

  static async upsert(data: Partial<KonfigurasiGaji>): Promise<KonfigurasiGaji> {
    // Check if exists
    const existing = await this.getByDivisionId(data.divisi_id!);

    if (existing) {
      // Update
      await pool.query<ResultSetHeader>(
        'UPDATE konfigurasi_gaji SET gaji_pokok = ?, tanggal_berlaku = ? WHERE id = ?',
        [data.gaji_pokok, data.tanggal_berlaku, existing.id]
      );
      return { ...existing, ...data } as KonfigurasiGaji;
    } else {
      // Insert
      await pool.query<ResultSetHeader>(
        'INSERT INTO konfigurasi_gaji (divisi_id, gaji_pokok, tanggal_berlaku) VALUES (?, ?, ?)',
        [data.divisi_id, data.gaji_pokok, data.tanggal_berlaku]
      );
      return (await this.getByDivisionId(data.divisi_id!)) as KonfigurasiGaji;
    }
  }
}

export default KonfigurasiGajiModel;
