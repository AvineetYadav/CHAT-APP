import express from 'express';
import { 
  getConversations, 
  getConversation, 
  createConversation, 
  updateConversation, 
  deleteConversation, 
  addUserToGroup, 
  removeUserFromGroup 
} from '../controllers/conversationController.js';

const router = express.Router();

// All routes here are protected by verifyToken middleware in index.js
router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', createConversation);
router.put('/:id', updateConversation);
router.delete('/:id', deleteConversation);
router.post('/:id/users', addUserToGroup);
router.delete('/:id/users/:userId', removeUserFromGroup);

export default router;