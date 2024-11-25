import express from 'express';
import { like, follow, sendMessage } from '../controllers/userInputController.js';

const router = express.Router();
router.post('/like', like);
router.post('/follow', follow);
router.post('/send-message', sendMessage);

export default router;