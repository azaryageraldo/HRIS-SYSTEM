import { Request, Response } from 'express';
import db from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { ApiResponse } from '../types';

interface AttendanceTrend {
  date: string;
  hadir: number;
  total: number;
  percentage: number;
}

interface DivisionBreakdown {
  nama: string;
  jumlahKaryawan: number;
  gajiPokok: number;
  totalGaji: number;
}

interface DashboardStats {
  totalKaryawan: number;
  totalDivisi: number;
  presensiHariIni: {
    hadir: number;
    total: number;
    percentage: number;
  };
  totalBebanGaji: number;
  attendanceTrend: AttendanceTrend[];
  divisionBreakdown: DivisionBreakdown[];
}

class DashboardController {
  /**
   * Get admin dashboard statistics with enhanced data
   * GET /api/admin/dashboard/stats
   */
  static async getStats(_req: Request, res: Response<ApiResponse<DashboardStats>>): Promise<void> {
    try {
      // Get total active employees
      const [karyawanRows] = await db.query<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM pengguna WHERE aktif = TRUE'
      );
      const totalKaryawan = karyawanRows[0].total;

      // Get total active divisions
      const [divisiRows] = await db.query<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM divisi WHERE aktif = TRUE'
      );
      const totalDivisi = divisiRows[0].total;

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const [presensiRows] = await db.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT pengguna_id) as hadir 
         FROM presensi 
         WHERE DATE(waktu_masuk) = ?`,
        [today]
      );
      const hadir = presensiRows[0].hadir || 0;
      const presensiPercentage = totalKaryawan > 0 ? Math.round((hadir / totalKaryawan) * 100) : 0;

      // Get last 7 days attendance trend
      const [trendRows] = await db.query<RowDataPacket[]>(
        `SELECT 
          DATE(waktu_masuk) as date,
          COUNT(DISTINCT pengguna_id) as hadir
        FROM presensi
        WHERE DATE(waktu_masuk) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(waktu_masuk)
        ORDER BY date ASC`
      );

      // Fill in missing dates with 0 attendance
      const attendanceTrend: AttendanceTrend[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existing = trendRows.find((row: any) => row.date === dateStr);
        const hadirCount = existing ? existing.hadir : 0;
        const percentage = totalKaryawan > 0 ? Math.round((hadirCount / totalKaryawan) * 100) : 0;
        
        attendanceTrend.push({
          date: dateStr,
          hadir: hadirCount,
          total: totalKaryawan,
          percentage
        });
      }

      // Get division breakdown with employee count and salary
      const [divisionRows] = await db.query<RowDataPacket[]>(
        `SELECT 
          d.nama,
          COUNT(DISTINCT p.id) as jumlahKaryawan,
          COALESCE(kg.gaji_pokok, 0) as gajiPokok
        FROM divisi d
        LEFT JOIN pengguna p ON d.id = p.divisi_id AND p.aktif = TRUE
        LEFT JOIN konfigurasi_gaji kg ON d.id = kg.divisi_id AND kg.aktif = TRUE
        WHERE d.aktif = TRUE
        GROUP BY d.id, d.nama, kg.gaji_pokok
        ORDER BY jumlahKaryawan DESC`
      );

      // Calculate total salary burden (salary * employee count per division)
      let totalBebanGaji = 0;
      const divisionBreakdown: DivisionBreakdown[] = divisionRows.map((row: any) => {
        const totalGaji = row.jumlahKaryawan * row.gajiPokok;
        totalBebanGaji += totalGaji;
        
        return {
          nama: row.nama,
          jumlahKaryawan: row.jumlahKaryawan,
          gajiPokok: parseFloat(row.gajiPokok),
          totalGaji: totalGaji
        };
      });

      const stats: DashboardStats = {
        totalKaryawan,
        totalDivisi,
        presensiHariIni: {
          hadir,
          total: totalKaryawan,
          percentage: presensiPercentage
        },
        totalBebanGaji,
        attendanceTrend,
        divisionBreakdown
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik dashboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default DashboardController;
