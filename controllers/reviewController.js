import Review from "../models/reviewModel.js";
import jwt from "jsonwebtoken";

const secretKey =
  process.env.JWT_SECRET 
  
const reviewController = {
  // Create a new review
  createReview: async (req, res) => {
    try {
      // check if review already exists for the employee and date
      const existingReview = await Review.findOne({
        where: {
          employee_id: req.body.employee_id,
          review_date: req.body.review_date,
        },
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ message: "Review already exists for this employee" });
      }

      // Get token from cookies or Authorization header
      const token =
        req.cookies.refresh_token ||
        (req.headers["authorization"] &&
          req.headers["authorization"].split(" ")[1]);

      // If no token is found, respond with Unauthorized
      if (!token) {
        return res

          .status(401)
          .json({ message: "Unauthorized, token required" });
      }

      // Verify the token
      const decodedToken = jwt.verify(token, secretKey);
      if (!decodedToken) {
        return res.status(401).json({ message: "Unauthorized, invalid token" });
      }

      // Check if the user has sufficient privileges
      if (decodedToken.user_type == "Employee") {
        return res
          .status(403)
          .json({message: "You are not authorized to add review" });
      }
        
      const reviewId = await Review.create(req.body);
      res
        .status(201)
        .json({ message: "Review created successfully", reviewId });
      

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get reviews by employee ID
  getReviewsByEmployeeId: async (req, res) => {
    try {
      const reviews = await Review.findByEmployeeId(req.params.employeeId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all reviews (optional, for listing all reviews)
  getAllReviews: async (req, res) => {
    try {
      const reviews = await Review.findAll();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a review by ID
  updateReview: async (req, res) => {
    try {

      // check if review exists
      const review = await Review.findOne({
        where: { review_id: req.params.reviewId },
      });

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Get token from cookies or Authorization header
      const token =
        req.cookies.refresh_token ||
        (req.headers["authorization"] &&
          req.headers["authorization"].split(" ")[1]);

      // If no token is found, respond with Unauthorized
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token required" });
      }

      // Verify the token
      const decodedToken = jwt.verify(token, secretKey);
      if (!decodedToken) {
        return res.status(401).json({ message: "Unauthorized, invalid token" });
      }

      // Check if the user has sufficient privileges
      if (decodedToken.user_type == "Employee") {
        return res
          .status(403)
          .json({ message: "You are not authorized to update review" });
      }

      const [updatedRows] = await Review.update(req.body, {
        where: { review_id: req.params.reviewId },
      });
      if (updatedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a review by ID
  deleteReview: async (req, res) => {
    try {

      // check the user_type of the logged in user
      const token =
        req.cookies.refresh_token ||
        (req.headers["authorization"] &&
          req.headers["authorization"].split(" ")[1]);
      
      // If no token is found, respond with Unauthorized
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token required" });
      }

      const decodedToken = jwt.verify(token, secretKey);

      // Check if the user has sufficient privileges
      if (decodedToken.user_type == "Employee") {
        // send response so that the user knows they are not authorized
        return res
          .status(403)
          .json({ message: "You are not authorized to delete review" });

      }

      // check if review exists
      const review = await Review.findOne({
        where: { review_id: req.params.reviewId },
      });

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      const deletedRows = await Review.destroy({
        where: { review_id: req.params.reviewId },
      });
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default reviewController;
