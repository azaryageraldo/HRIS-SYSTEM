import { Request, Response } from 'express';
import DivisiModel from '../models/Divisi';

export class DivisiController {
  static async getDivisions(_req: Request, res: Response) {
    try {
      const divisions = await DivisiModel.getAll();
      res.json({
        success: true,
        data: divisions
      });
    } catch (error) {
      console.error('Error fetching divisions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getDivisionById(req: Request, res: Response) {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      
      const division = await DivisiModel.getById(id);
      
      if (!division) {
        res.status(404).json({
          success: false,
          message: 'Division not found'
        });
        return;
      }

      res.json({
        success: true,
        data: division
      });
    } catch (error) {
      console.error('Error fetching division:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async createDivision(req: Request, res: Response) {
    try {
      const { nama, deskripsi } = req.body;
      
      if (!nama) {
        res.status(400).json({
          success: false,
          message: 'Nama divisi required'
        });
        return;
      }

      const division = await DivisiModel.create({ nama, deskripsi });
      res.status(201).json({
        success: true,
        message: 'Division created successfully',
        data: division
      });
    } catch (error: any) {
      console.error('Error creating division:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({
          success: false,
          message: 'Division name already exists'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateDivision(req: Request, res: Response) {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      const { nama, deskripsi } = req.body;

      if (!nama) {
        res.status(400).json({
          success: false,
          message: 'Nama divisi required'
        });
        return;
      }

      const affectedRows = await DivisiModel.update(id, { nama, deskripsi });
      
      if (typeof affectedRows === 'number' && affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Division not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Division updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating division:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({
          success: false,
          message: 'Division name already exists'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async deleteDivision(req: Request, res: Response) {
    try {
      const idStr = req.params.id;
      const id = parseInt(Array.isArray(idStr) ? idStr[0] : idStr);
      const affectedRows = await DivisiModel.delete(id);
      
      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Division not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Division deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting division:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
