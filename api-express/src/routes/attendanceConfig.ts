import { Router } from 'express';
import { AttendanceConfigController } from '../controllers/attendanceConfigController';

const router = Router();

router.get('/', AttendanceConfigController.getAttendanceConfig);
router.post('/', AttendanceConfigController.updateAttendanceConfig);

export default router;
