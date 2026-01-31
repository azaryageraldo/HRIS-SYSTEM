import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../config/database';

export interface KonfigurasiPresensi {
  id: number;
  jam_masuk_maksimal: string;
  jam_pulang_minimal: string;
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
  aktif: boolean;
  dibuat_pada?: Date;
  diperbarui_pada?: Date;
}

export interface CreateKonfigurasiPresensiRequest {
  jam_masuk_maksimal: string;
  jam_pulang_minimal: string;
  latitude_kantor: number;
  longitude_kantor: number;
  radius_meter: number;
}

export interface UpdateKonfigurasiPresensiRequest {
  jam_masuk_maksimal?: string;
  jam_pulang_minimal?: string;
  latitude_kantor?: number;
  longitude_kantor?: number;
  radius_meter?: number;
}

class KonfigurasiPresensiModel {
  /**
   * Get active attendance configuration
   * Note: Typically only one active config exists at a time
   */
  static async getActive(): Promise<KonfigurasiPresensi | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, jam_masuk_maksimal, jam_pulang_minimal, 
              latitude_kantor, longitude_kantor, radius_meter, 
              aktif, dibuat_pada, diperbarui_pada
       FROM konfigurasi_presensi 
       WHERE aktif = TRUE
       ORDER BY dibuat_pada DESC
       LIMIT 1`
    );
    return rows.length > 0 ? (rows[0] as KonfigurasiPresensi) : null;
  }

  /**
   * Get all attendance configurations (including inactive)
   */
  static async getAll(): Promise<KonfigurasiPresensi[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, jam_masuk_maksimal, jam_pulang_minimal, 
              latitude_kantor, longitude_kantor, radius_meter, 
              aktif, dibuat_pada, diperbarui_pada
       FROM konfigurasi_presensi 
       ORDER BY dibuat_pada DESC`
    );
    return rows as KonfigurasiPresensi[];
  }

  /**
   * Get attendance configuration by ID
   */
  static async getById(id: number): Promise<KonfigurasiPresensi | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, jam_masuk_maksimal, jam_pulang_minimal, 
              latitude_kantor, longitude_kantor, radius_meter, 
              aktif, dibuat_pada, diperbarui_pada
       FROM konfigurasi_presensi 
       WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as KonfigurasiPresensi) : null;
  }

  /**
   * Create new attendance configuration
   * Automatically deactivates previous configurations
   */
  static async create(data: CreateKonfigurasiPresensiRequest): Promise<number> {
    // Start transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deactivate all previous configurations
      await connection.query(
        'UPDATE konfigurasi_presensi SET aktif = FALSE WHERE aktif = TRUE'
      );

      // Insert new configuration
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO konfigurasi_presensi 
         (jam_masuk_maksimal, jam_pulang_minimal, latitude_kantor, longitude_kantor, radius_meter) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.jam_masuk_maksimal,
          data.jam_pulang_minimal,
          data.latitude_kantor,
          data.longitude_kantor,
          data.radius_meter
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update attendance configuration
   */
  static async update(id: number, data: UpdateKonfigurasiPresensiRequest): Promise<number> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.jam_masuk_maksimal !== undefined) {
      fields.push('jam_masuk_maksimal = ?');
      values.push(data.jam_masuk_maksimal);
    }
    if (data.jam_pulang_minimal !== undefined) {
      fields.push('jam_pulang_minimal = ?');
      values.push(data.jam_pulang_minimal);
    }
    if (data.latitude_kantor !== undefined) {
      fields.push('latitude_kantor = ?');
      values.push(data.latitude_kantor);
    }
    if (data.longitude_kantor !== undefined) {
      fields.push('longitude_kantor = ?');
      values.push(data.longitude_kantor);
    }
    if (data.radius_meter !== undefined) {
      fields.push('radius_meter = ?');
      values.push(data.radius_meter);
    }

    if (fields.length === 0) {
      return 0;
    }

    values.push(id);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE konfigurasi_presensi SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  }

  /**
   * Deactivate attendance configuration
   */
  static async deactivate(id: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE konfigurasi_presensi SET aktif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  /**
   * Activate attendance configuration
   * Deactivates all others
   */
  static async activate(id: number): Promise<number> {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deactivate all
      await connection.query(
        'UPDATE konfigurasi_presensi SET aktif = FALSE WHERE aktif = TRUE'
      );

      // Activate specified one
      const [result] = await connection.query<ResultSetHeader>(
        'UPDATE konfigurasi_presensi SET aktif = TRUE WHERE id = ?',
        [id]
      );

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default KonfigurasiPresensiModel;
