import express from 'express';
import { like, follow } from '../controllers/userInputController.js';

const router = express.Router();
router.post('/like', like);
router.post('/follow', follow);

export default router;