import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { Op } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const secretKey =
  process.env.JWT_SECRET ||
  "e94f3d1a6f4a8f1b5c7c6a9d6f4e2a9b5e7c2f3d6b8f9e1a7b2d8c1e9f3a7d4";

const authController = {
  register: async (req, res) => {
    const { user_type, first_name, last_name, username, email, password } =
      req.body;

    try {
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Check if user already exists by email or username
      const existUsername = await User.findOne({
        where: { username: username },
      });

      if (existUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existEmail = await User.findOne({
        where: { email: email },
      });

      if (existEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await User.create({
        user_type,
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
      });

      return res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    const { email, username, password, user_type } = req.body;

    try {
      // Validate input
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Find user by email or username
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check user type match
      if (user_type && user_type !== user.user_type) {
        return res.status(401).json({ message: "Invalid user type" });
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT access token
      const token = jwt.sign(
        { id: user.id, username: user.username, user_type: user.user_type },
        secretKey,
        { expiresIn: "1h" }
      );

      // Save refresh token to the database
      await user.update({ refresh_token: token });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };

      res
        .cookie("refresh_token", token, cookieOptions)
        .status(200)
        .json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refresh_token } =
        req.cookies ||
        req.headers ||
        req.headers["Authorization"].split("Bearer ", " ")[1];

      if (!refresh_token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify the refresh token
      const decodedToken = jwt.verify(refresh_token, secretKey);

      // Find the user by ID and refresh token
      const user = await User.findOne({
        where: { id: decodedToken.id, refresh_token },
      });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.refresh_token !== refresh_token) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Generate a new access token
      const token = jwt.sign(
        { id: user.id, username: user.username, user_type: user.user_type },
        secretKey,
        { expiresIn: "1h" }
      );


      // Set the new access token as a cookie
      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };

      res
        .cookie("refresh_token", token, cookieOptions)
        .status(200)
        .json({ token });
    } catch (error) {
      console.error("Error refreshing token:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, username, email, user_type } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.update({
        first_name,
        last_name,
        username,
        email,
        user_type,
      });

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user:", error);
      return res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.destroy();
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res
        .status(500)
        .json({ message: "Error deleting user", error: error.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error retrieving users:", error);
      return res
        .status(500)
        .json({ message: "Error retrieving users", error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid old password" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .json({ message: "Error updating password", error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // Assuming req.user.id is populated by the authentication middleware
      const userId = req.user.id;
  
      // Remove the refresh token from the database for the logged-in user
      await User.update({ refresh_token: null }, { where: { id: userId } });
  
      // Cookie options for secure cookie clearing
      const cookieOptions = {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      };
  
      // Clear both access_token and refresh_token cookies
      res
        .clearCookie("refresh_token", cookieOptions)
        .status(200)
        .json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out:", error);
      return res
        .status(500)
        .json({ message: "Error logging out", error: error.message });
    }
  },
  
 // get current logged-in user and their time logs
getCurrentUser: async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.refresh_token || req.headers.authorization.split(" ")[1];

    // Check if the token is present
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify the token and decode it
    const decodedToken = jwt.verify(token, secretKey);
    
    // Check if token verification failed
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find the user by ID and include time logs in the response
    const user = await User.findOne({
      where: { id: req.user.id },
      // exlude password and refresh_token fields
      attributes: { exclude: ["password", "refresh_token"] },
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user data including time logs
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting current user:", error);

    // Handle token expiration or invalid token errors explicitly
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Handle any other server errors
    return res.status(500).json({
      message: "Error getting current user",
      error: error.message,
    });
  }
},

  
};

export default authController;
