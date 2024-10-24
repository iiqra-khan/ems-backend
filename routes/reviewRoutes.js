import express from 'express';
import reviewController from '../controllers/reviewController.js';
import authenticateJWT from '../middleware/authMiddleware.js';
const router = express.Router();

// Create a new review
router.post('/',authenticateJWT, reviewController.createReview);

// Get reviews by employee ID
router.get('/employee/:employeeId',authenticateJWT, reviewController.getReviewsByEmployeeId);

// Update a review by review ID
router.put('/:reviewId',authenticateJWT, reviewController.updateReview);

// Delete a review by review ID
router.delete('/:reviewId',authenticateJWT, reviewController.deleteReview);

// Get all reviews 
router.get('/',authenticateJWT, reviewController.getAllReviews);

export default router;
