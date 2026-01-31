import { Router } from 'express';
import { DivisiController } from '../controllers/divisiController';

const router = Router();

// GET semua divisi
router.get('/', DivisiController.getDivisions);

// GET divisi by ID
router.get('/:id', DivisiController.getDivisionById);

// POST create divisi
router.post('/', DivisiController.createDivision);

// PUT update divisi
router.put('/:id', DivisiController.updateDivision);

// DELETE divisi (soft delete)
router.delete('/:id', DivisiController.deleteDivision);

export default router;

