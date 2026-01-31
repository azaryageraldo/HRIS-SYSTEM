import { Request, Response } from 'express';
import KonfigurasiCutiModel from '../models/KonfigurasiCuti';
import DivisiModel from '../models/Divisi';

export class LeaveConfigController {
  static async getLeaveConfigs(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      // Get all active divisions
      const divisions = await DivisiModel.getAll();
      // Get all existing leave configs for the year
      const configs = await KonfigurasiCutiModel.getAll(year);

      // Merge data
      const result = divisions.map(div => {
        const config = configs.find(c => c.divisi_id === div.id);
        return {
          divisi_id: div.id,
          nama_divisi: div.nama,
          jatah_cuti_tahunan: config ? config.jatah_cuti_tahunan : 12, // Default 12 days
          tahun_berlaku: year,
          config_id: config ? config.id : null
        };
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching leave configs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async upsertLeaveConfig(req: Request, res: Response): Promise<void> {
    try {
      const { divisi_id, jatah_cuti_tahunan, tahun_berlaku } = req.body;

      if (!divisi_id || jatah_cuti_tahunan === undefined) {
        res.status(400).json({
          success: false,
          message: 'Divisi ID and Jatah Cuti are required'
        });
        return;
      }

      const config = await KonfigurasiCutiModel.upsert({
        divisi_id,
        jatah_cuti_tahunan,
        tahun_berlaku: tahun_berlaku || new Date().getFullYear()
      });

      res.json({
        success: true,
        message: 'Leave configuration saved',
        data: config
      });
    } catch (error) {
      console.error('Error saving leave config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
