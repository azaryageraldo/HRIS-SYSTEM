import { Router } from 'express';
import { LeaveConfigController } from '../controllers/leaveConfigController';

const router = Router();

router.get('/', LeaveConfigController.getLeaveConfigs);
router.post('/', LeaveConfigController.upsertLeaveConfig);

export default router;
