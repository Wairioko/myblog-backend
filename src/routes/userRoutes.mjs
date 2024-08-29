import express from 'express';
import { userLogin, userCreation, userProfile, editUserProfile } from '../controllers/userController.mjs';


const router = express.Router();

router.post('/api/signup', userCreation);

router.post('/api/login', userLogin);

router.get('/api/profile', userProfile);

router.put('/api/edit-profile', editUserProfile);


export default router;

