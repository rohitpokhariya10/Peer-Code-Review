import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';

const router = express.Router();

// Routes ko controllers se map kiya
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;