import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import jwt from "jsonwebtoken";

const secretKey =
  process.env.JWT_SECRET ||
  "e94f3d1a6f4a8f1b5c7c6a9d6f4e2a9b5e7c2f3d6b8f9e1a7b2d8c1e9f3a7d4";

const attendanceController = {
  // Record a new attendance
  recordAttendance: async (req, res) => {
    try {
      const { employee_id, date, status } = req.body;

      // Check if attendance already exists for the employee on the specified date
      const existingAttendance = await Attendance.findOne({
        where: { employee_id, date },
      });

      if (existingAttendance) {
        return res
          .status(400)
          .json({
            message:
              "Attendance already recorded for this employee on this date.",
          });
      }

      // If attendance doesn't exist, create a new record
      const newAttendance = await Attendance.create({
        employee_id,
        date,
        status,
      });

      res
        .status(201)
        .json({
          message: "Attendance recorded successfully",
          attendance: newAttendance,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // get all attendance records
  getAllAttendance: async (req, res) => {
    try {
      const attendance = await Attendance.findAll(
        {
          include: { model: Employee, attributes: ["first_name", "last_name"] },
        }
      );
      if (!attendance) {
        return res
          .status(404)
          .json({ message: "Attendance records not found" });
      }
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete attendance record by ID
  deleteAttendance: async (req, res) => {
    try {
      const { attendanceId } = req.params; // Extract the attendanceId from the request parameters


      // check the user_type of the logged in user
      const token = req.headers.authorization.split(" ")[1] || req.cookies.refreshToken;
      const decoded = jwt.verify(token, secretKey);

      if (decoded.user_type == "Employee") {
        return res.status(403).json({ message: "You are not authorized to delete attendance" });
      }

      const result = await Attendance.destroy({
        where: { attendance_id: attendanceId }, // Correctly use the `where` clause
      });

      if (result > 0) {
        // `destroy` returns the number of affected rows
        res.json({ message: "Attendance deleted successfully" });
      } else {
        res.status(404).json({ message: "Attendance not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Edit/update attendance record by ID
  editAttendance: async (req, res) => {
    try {
      const { attendanceId } = req.params;
      const updateData = req.body;

      // Check if the attendance exists
      const existingAttendance = await Attendance.findOne({
        where: { attendance_id: attendanceId },
      });

      if (!existingAttendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      // check the user_type of the logged in user
      const token = req.headers.authorization.split(" ")[1] || req.cookies.refreshToken;
      const decoded = jwt.verify(token, secretKey);

      if (decoded.user_type == "Employee") {
        return res.status(403).json({ message: "You are not authorized to edit attendance" });
      }

      // Update the attendance record
      const [updatedRows] = await Attendance.update(updateData, {
        where: { attendance_id: attendanceId },
      });

      if (updatedRows > 0) {
        res.json({ message: "Attendance updated successfully" });
      } else {
        res.status(404).json({ message: "Attendance not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default attendanceController;
