import express from 'express'; 
import { verifyToken, fetchActiveUser } from '../controllers/authController.js'

const router = express.Router(); 
router.post('/verify-token', verifyToken);
router.get('/fetch-active-user', fetchActiveUser);

export default router; 