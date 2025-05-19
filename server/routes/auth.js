import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  uploadAvatar 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);

export default router;