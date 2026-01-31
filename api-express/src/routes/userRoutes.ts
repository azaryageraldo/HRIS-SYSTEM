import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

router.get('/', UserController.getUsers);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.patch('/:id/status', UserController.toggleUserStatus);
router.get('/roles', UserController.getRoles);

export default router;
