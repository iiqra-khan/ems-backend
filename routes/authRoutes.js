import express from 'express';
import authController from '../controllers/userController.js';
import authenticateJWT from '../middleware/authMiddleware.js';

const router = express.Router();

// Register Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);

// Logout Route (authenticated)
router.post('/logout', authenticateJWT, authController.logout);

// Update User (authenticated, with user ID in URL params)
router.put('/update/:id', authenticateJWT, authController.updateUser);

// Delete User (authenticated, with user ID in URL params)
router.delete('/delete/:id', authenticateJWT, authController.deleteUser);

// get current user
router.get('/profile', authenticateJWT, authController.getCurrentUser);

// Refresh Token Route
router.post('/refresh',authenticateJWT, authController.refreshToken);

export default router;
