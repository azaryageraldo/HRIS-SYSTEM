import { Router, Request, Response } from 'express';
import DivisiModel from '../models/Divisi';
import { CreateDivisiRequest, UpdateDivisiRequest, ApiResponse } from '../types';

const router = Router();

// GET semua divisi
router.get('/', async (_req: Request, res: Response<ApiResponse>) => {
  try {
    const divisi = await DivisiModel.getAll();
    res.json({
      success: true,
      data: divisi
    });
  } catch (error) {
    console.error('Error getting divisi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data divisi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET divisi by ID
router.get('/:id', async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const divisi = await DivisiModel.getById(parseInt(id));
    if (!divisi) {
      res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan'
      });
      return;
    }
    res.json({
      success: true,
      data: divisi
    });
  } catch (error) {
    console.error('Error getting divisi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data divisi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST create divisi
router.post('/', async (req: Request<{}, {}, CreateDivisiRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { nama, deskripsi } = req.body;
    
    if (!nama) {
      res.status(400).json({
        success: false,
        message: 'Nama divisi harus diisi'
      });
      return;
    }

    const id = await DivisiModel.create({ nama, deskripsi });
    res.status(201).json({
      success: true,
      message: 'Divisi berhasil dibuat',
      data: { id, nama, deskripsi }
    });
  } catch (error) {
    console.error('Error creating divisi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat divisi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT update divisi
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateDivisiRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { nama, deskripsi } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const affectedRows = await DivisiModel.update(parseInt(id), { nama, deskripsi });
    
    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Divisi berhasil diupdate'
    });
  } catch (error) {
    console.error('Error updating divisi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate divisi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE divisi (soft delete)
router.delete('/:id', async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const affectedRows = await DivisiModel.delete(parseInt(id));
    
    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Divisi tidak ditemukan'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Divisi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting divisi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus divisi',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

