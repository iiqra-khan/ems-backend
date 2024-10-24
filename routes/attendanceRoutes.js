import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import authenticateJWT from '../middleware/authMiddleware.js';

const router = express.Router();


// Record new attendance
router.post('/',authenticateJWT, attendanceController.recordAttendance);

// Get all attendance
router.get('/',authenticateJWT, attendanceController.getAllAttendance);

// Delete attendance by ID
router.delete('/:attendanceId',authenticateJWT, attendanceController.deleteAttendance);

// Edit attendance by ID
router.put('/:attendanceId',authenticateJWT, attendanceController.editAttendance);

export default router;
