import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface Peran {
  id: number;
  nama: string;
  deskripsi: string;
}

class PeranModel {
  static async getAll(): Promise<Peran[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM peran ORDER BY id ASC');
    return rows as Peran[];
  }
}

export default PeranModel;
