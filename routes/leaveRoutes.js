import express from 'express';
import leaveController from '../controllers/leaveController.js';
import authenticateJWT from '../middleware/authMiddleware.js';
const router = express.Router();

// Apply for leave (Create)
router.post('/',authenticateJWT, leaveController.applyLeave);

// Get all leaves
router.get('/',authenticateJWT, leaveController.getAllLeaves);

// Update leave status (Update)
router.put('/:leaveId',authenticateJWT, leaveController.updateLeave);

// Delete leave by leave ID (Delete)
router.delete('/:leaveId',authenticateJWT, leaveController.deleteLeave);

export default router;
