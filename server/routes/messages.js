import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  deleteMessage, 
  uploadMessageImage 
} from '../controllers/messageController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes here are protected by verifyToken middleware in index.js
router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.delete('/:id', deleteMessage);
router.post('/upload', upload.single('image'), uploadMessageImage);

export default router;