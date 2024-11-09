import express from 'express';
import { registerUser, fetchSeller, updateSellerProfile, newSeller } from '../controllers/sellerController.js';

const router = express.Router();
router.post('/register-user', registerUser);
router.post('/update-profile', updateSellerProfile);
router.post('/register-seller', newSeller);
router.get('/fetch-seller', fetchSeller);

export default router;