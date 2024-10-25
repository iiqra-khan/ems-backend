import Leave from "../models/leaveModel.js";
import jwt from "jsonwebtoken";

const secretKey =
  process.env.JWT_SECRET ||
  "e94f3d1a6f4a8f1b5c7c6a9d6f4e2a9b5e7c2f3d6b8f9e1a7b2d8c1e9f3a7d4";

const leaveController = {
  // Apply for leave
  applyLeave: async (req, res) => {
    try {
      const {
        employee_id,
        leave_type,
        day_type,
        start_date,
        end_date,
        reason,
        status,
      } = req.body;

      // Check if attendance already exists for the employee on the specified date
      const pendingLeave = await Leave.findOne({
        where: { employee_id, status },
      });

      if (pendingLeave) {
        return res.status(400).json({
          message: "You already have a pending leave request.",
        });
      }

      // If attendance doesn't exist, create a new record
      const newLeave = await Leave.create({
        employee_id,
        leave_type,
        day_type,
        start_date,
        end_date,
        reason,
      });

      res.status(201).json({
        message: "Leave applied successfully",
        leave: newLeave,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all leaves
  getAllLeaves: async (req, res) => {
    try {
      const leaves = await Leave.findAll();
      if (!leaves) {
        return res.status(404).json({ message: "Leaves not found" });
      }
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // update leave details
  updateLeave: async (req, res) => {
    try {

      // Check if the leave exists
      const leave = await Leave.findOne({
        where: { leave_id: req.params.leaveId },
      });

      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

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
        return res
          .status(403) // 403 Forbidden for insufficient privileges
          .json({ message: "You are not authorized to update the leave status" });
      }


      const [updatedRows] = await Leave.update(req.body, {
        where: { leave_id: req.params.leaveId },
      });
      if (updatedRows === 0) {
        return res.status(404).json({ message: "Leave not found" });
      }
      res.json({ message: "Leave updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // delete leave by leave ID
  deleteLeave: async (req, res) => {
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
        return res
          .status(403) // 403 Forbidden for insufficient privileges
          .json({ message: "You are not authorized to delete leave" });
      }

      const deletedRows = await Leave.destroy({
        where: { leave_id: req.params.leaveId },
      });
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Leave not found" });
      }
      res.json({ message: "Leave deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateLeaveStatus: async (req, res) => {
    try {
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

      const decodedToken = jwt.verify(token, secretKey);

      // Check if the user has sufficient privileges
      if (decodedToken.user_type == "Employee") {
        return res
          .status(403) // 403 Forbidden for insufficient privileges
          .json({ message: "You are not authorized to change the status" });
      }

      // Update leave status only if the user is authorized
      const [updatedRows] = await Leave.update(
        { status: req.body.status },
        {
          where: { leave_id: req.params.leaveId },
        }
      );

      if (updatedRows === 0) {
        return res.status(404).json({ message: "Leave not found" });
      }

      res.json({ message: "Leave status updated successfully" });
    } catch (error) {
      // Catch and respond with any server-side errors
      res.status(500).json({ error: error.message });
    }
  },
};

export default leaveController;
