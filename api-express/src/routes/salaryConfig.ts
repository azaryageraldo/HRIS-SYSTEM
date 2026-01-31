import { Router } from 'express';
import { SalaryConfigController } from '../controllers/salaryConfigController';

const router = Router();

// Base Salary Routes
router.get('/base-salary', SalaryConfigController.getSalaryConfigs);
router.post('/base-salary', SalaryConfigController.upsertSalaryConfig);

// Deduction Rules Routes
router.get('/deductions', SalaryConfigController.getDeductionRules);
router.post('/deductions', SalaryConfigController.createDeductionRule);
router.put('/deductions/:id', SalaryConfigController.updateDeductionRule);
router.delete('/deductions/:id', SalaryConfigController.deleteDeductionRule);

export default router;
