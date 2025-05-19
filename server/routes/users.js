import express from 'express';
import { 
  searchUsers, 
  getUserById 
} from '../controllers/userController.js';

const router = express.Router();

// All routes here are protected by verifyToken middleware in index.js
router.get('/search', searchUsers);
router.get('/:id', getUserById);

export default router;