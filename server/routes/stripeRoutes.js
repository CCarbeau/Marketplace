import express from 'express';
import { createStripeAccount } from '../controllers/stripeController.js';

const router = express.Router();

router.post('/create-stripe-account', createStripeAccount);

export default router;