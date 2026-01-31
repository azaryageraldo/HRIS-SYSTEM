import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Divisi, CreateDivisiRequest, UpdateDivisiRequest } from '../types';
import db from '../config/database';

class DivisiModel {
  static async getAll(): Promise<Divisi[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, nama, deskripsi, aktif, dibuat_pada, diperbarui_pada FROM divisi WHERE aktif = TRUE'
    );
    return rows as Divisi[];
  }

  static async getById(id: number): Promise<Divisi | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, nama, deskripsi, aktif, dibuat_pada, diperbarui_pada FROM divisi WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Divisi) : null;
  }

  static async create(data: CreateDivisiRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO divisi (nama, deskripsi) VALUES (?, ?)',
      [data.nama, data.deskripsi || null]
    );
    return result.insertId;
  }

  static async update(id: number, data: UpdateDivisiRequest): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE divisi SET nama = ?, deskripsi = ? WHERE id = ?',
      [data.nama, data.deskripsi, id]
    );
    return result.affectedRows;
  }

  static async delete(id: number): Promise<number> {
    const [result] = await db.query<ResultSetHeader>(
      'UPDATE divisi SET aktif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

export default DivisiModel;
