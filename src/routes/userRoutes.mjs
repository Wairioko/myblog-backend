import express from 'express';
import { userLogin, userCreation } from '../controllers/userController.mjs';

const router = express.Router();

router.post('/api/login', userLogin);

router.post('/api/signup', userCreation);


export default router;

