import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface KonfigurasiCuti {
  id: number;
  divisi_id: number;
  nama_divisi?: string;
  jatah_cuti_tahunan: number;
  tahun_berlaku: number;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

class KonfigurasiCutiModel {
  static async getAll(tahun: number): Promise<KonfigurasiCuti[]> {
    const query = `
      SELECT kc.*, d.nama as nama_divisi 
      FROM konfigurasi_cuti kc
      JOIN divisi d ON kc.divisi_id = d.id
      WHERE kc.aktif = true AND d.aktif = true AND kc.tahun_berlaku = ?
      ORDER BY d.nama ASC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [tahun]);
    return rows as KonfigurasiCuti[];
  }

  static async getByDivisionId(divisiId: number, tahun: number): Promise<KonfigurasiCuti | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM konfigurasi_cuti WHERE divisi_id = ? AND tahun_berlaku = ? AND aktif = true ORDER BY id DESC LIMIT 1',
      [divisiId, tahun]
    );
    return (rows[0] as KonfigurasiCuti) || null;
  }

  static async upsert(data: Partial<KonfigurasiCuti>): Promise<KonfigurasiCuti> {
    // Check if exists
    const existing = await this.getByDivisionId(data.divisi_id!, data.tahun_berlaku!);

    if (existing) {
      // Update
      await pool.query<ResultSetHeader>(
        'UPDATE konfigurasi_cuti SET jatah_cuti_tahunan = ? WHERE id = ?',
        [data.jatah_cuti_tahunan, existing.id]
      );
      return { ...existing, ...data } as KonfigurasiCuti;
    } else {
      // Insert
      await pool.query<ResultSetHeader>(
        'INSERT INTO konfigurasi_cuti (divisi_id, jatah_cuti_tahunan, tahun_berlaku) VALUES (?, ?, ?)',
        [data.divisi_id, data.jatah_cuti_tahunan, data.tahun_berlaku]
      );
      return (await this.getByDivisionId(data.divisi_id!, data.tahun_berlaku!)) as KonfigurasiCuti;
    }
  }
}

export default KonfigurasiCutiModel;
