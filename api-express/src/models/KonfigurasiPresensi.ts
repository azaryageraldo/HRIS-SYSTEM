import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface KonfigurasiPresensi {
  id: number;
  jam_masuk_maksimal: string;
  jam_pulang_minimal: string;
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
  aktif: boolean;
  dibuat_pada: string;
  diperbarui_pada: string;
}

class KonfigurasiPresensiModel {
  static async get(): Promise<KonfigurasiPresensi | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM konfigurasi_presensi WHERE aktif = true ORDER BY id DESC LIMIT 1'
    );
    return (rows[0] as KonfigurasiPresensi) || null;
  }

  static async update(data: Partial<KonfigurasiPresensi>): Promise<KonfigurasiPresensi> {
    // For simplicity, we'll keep one active config. 
    // If not exists, create. If exists, update (or insert new as history, but let's just update/insert latest).
    // Actually schema allows history. Let's insert new record or update existing?
    // Requirement is just "Set ...". Standard practice: update existing or insert if empty.
    
    // Let's see if we have one.
    const existing = await this.get();

    if (existing) {
      await pool.query<ResultSetHeader>(
        `UPDATE konfigurasi_presensi 
         SET jam_masuk_maksimal = ?, jam_pulang_minimal = ?, latitude_kantor = ?, longitude_kantor = ?, radius_meter = ?
         WHERE id = ?`,
        [data.jam_masuk_maksimal, data.jam_pulang_minimal, data.latitude_kantor, data.longitude_kantor, data.radius_meter, existing.id]
      );
      return { ...existing, ...data } as KonfigurasiPresensi;
    } else {
       await pool.query<ResultSetHeader>(
        `INSERT INTO konfigurasi_presensi 
         (jam_masuk_maksimal, jam_pulang_minimal, latitude_kantor, longitude_kantor, radius_meter) 
         VALUES (?, ?, ?, ?, ?)`,
        [data.jam_masuk_maksimal, data.jam_pulang_minimal, data.latitude_kantor, data.longitude_kantor, data.radius_meter]
      );
      return (await this.get()) as KonfigurasiPresensi;
    }
  }
}

export default KonfigurasiPresensiModel;
