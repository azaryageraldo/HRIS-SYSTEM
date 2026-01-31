import { Request, Response } from 'express';
import KonfigurasiPresensiModel from '../models/KonfigurasiPresensi';

export class AttendanceConfigController {
  static async getAttendanceConfig(_req: Request, res: Response): Promise<void> {
    try {
      const config = await KonfigurasiPresensiModel.get();
      
      // Return default values if no config exists yet
      const result = config || {
        jam_masuk_maksimal: '09:00:00',
        jam_pulang_minimal: '17:00:00',
        latitude_kantor: -6.200000,
        longitude_kantor: 106.816666,
        radius_meter: 100
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching attendance config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateAttendanceConfig(req: Request, res: Response): Promise<void> {
    try {
      const { jam_masuk_maksimal, jam_pulang_minimal, latitude_kantor, longitude_kantor, radius_meter } = req.body;

      // Basic validation
      if (!jam_masuk_maksimal || !jam_pulang_minimal || latitude_kantor === undefined || longitude_kantor === undefined || radius_meter === undefined) {
         res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
        return;
      }

      const config = await KonfigurasiPresensiModel.update({
        jam_masuk_maksimal,
        jam_pulang_minimal,
        latitude_kantor,
        longitude_kantor,
        radius_meter
      });

      res.json({
        success: true,
        message: 'Attendance configuration updated',
        data: config
      });
    } catch (error) {
      console.error('Error updating attendance config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
