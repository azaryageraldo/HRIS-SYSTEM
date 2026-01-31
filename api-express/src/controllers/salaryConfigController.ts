import { Request, Response } from 'express';
import KonfigurasiGajiModel from '../models/KonfigurasiGaji';
import AturanPotonganModel from '../models/AturanPotongan';
import DivisiModel from '../models/Divisi';

export class SalaryConfigController {
  // --- Base Salary Configuration ---

  static async getSalaryConfigs(_req: Request, res: Response): Promise<void> {
    try {
      // Get all active divisions
      const divisions = await DivisiModel.getAll();
      // Get all existing salary configs
      const configs = await KonfigurasiGajiModel.getAll();

      // Merge data: Ensure every division has an entry, even if default/empty
      const result = divisions.map(div => {
        const config = configs.find(c => c.divisi_id === div.id);
        return {
          divisi_id: div.id,
          nama_divisi: div.nama,
          gaji_pokok: config ? config.gaji_pokok : 0,
          tanggal_berlaku: config ? config.tanggal_berlaku : new Date().toISOString().split('T')[0],
          config_id: config ? config.id : null
        };
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching salary configs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async upsertSalaryConfig(req: Request, res: Response): Promise<void> {
    try {
      const { divisi_id, gaji_pokok, tanggal_berlaku } = req.body;

      if (!divisi_id || gaji_pokok === undefined) {
        res.status(400).json({
          success: false,
          message: 'Divisi ID and Gaji Pokok are required'
        });
        return;
      }

      const config = await KonfigurasiGajiModel.upsert({
        divisi_id,
        gaji_pokok,
        tanggal_berlaku: tanggal_berlaku || new Date().toISOString().split('T')[0]
      });

      res.json({
        success: true,
        message: 'Salary configuration saved',
        data: config
      });
    } catch (error) {
      console.error('Error saving salary config:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // --- Deduction Rules ---

  static async getDeductionRules(_req: Request, res: Response): Promise<void> {
    try {
      const rules = await AturanPotonganModel.getAll();
      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Error fetching deduction rules:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createDeductionRule(req: Request, res: Response): Promise<void> {
    try {
      const { nama, tipe_potongan, nilai_potongan, deskripsi } = req.body;

      if (!nama || !tipe_potongan || nilai_potongan === undefined) {
        res.status(400).json({
          success: false,
          message: 'Nama, tipe potongan, and nilai potongan are required'
        });
        return;
      }

      const rule = await AturanPotonganModel.create({
        nama,
        tipe_potongan,
        nilai_potongan,
        deskripsi
      });

      res.status(201).json({
        success: true,
        message: 'Deduction rule created',
        data: rule
      });
    } catch (error) {
      console.error('Error creating deduction rule:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateDeductionRule(req: Request, res: Response): Promise<void> {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      const { nama, tipe_potongan, nilai_potongan, deskripsi } = req.body;

      const affectedRows = await AturanPotonganModel.update(id, {
        nama,
        tipe_potongan,
        nilai_potongan,
        deskripsi
      });

      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Rule not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Deduction rule updated'
      });
    } catch (error) {
      console.error('Error updating deduction rule:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteDeductionRule(req: Request, res: Response): Promise<void> {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      const affectedRows = await AturanPotonganModel.delete(id);

      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Rule not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Deduction rule deleted'
      });
    } catch (error) {
      console.error('Error deleting deduction rule:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
