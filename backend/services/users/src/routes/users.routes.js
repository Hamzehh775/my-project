import { Router } from 'express';
import { listUsers, createUser, deleteUser , getUser, } from '../controllers/users.controller.js';

const router = Router();



router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);  
router.delete('/:id', deleteUser);

export default router;
