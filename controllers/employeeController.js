import Employee from "../models/employeeModel.js";
import jwt from "jsonwebtoken";

const secretKey =
  process.env.JWT_SECRET ||
  "e94f3d1a6f4a8f1b5c7c6a9d6f4e2a9b5e7c2f3d6b8f9e1a7b2d8c1e9f3a7d4";

const employeeController = {
  // Create new employee
  createEmployee: async (req, res) => {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        job_role,
        salary,
        join_date,
      } = req.body;

      const existEmpId = await Employee.findOne({
        where: { employee_id: employee_id },
      });

      if (existEmpId) {
        return res.status(400).json({
          message: "Employee ID already exists.",
        });
      }

      const existEmail = await Employee.findOne({
        where: { email: email },
      });

      if (existEmail) {
        return res.status(400).json({
          message: "Email already exists.",
        });
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
          .json({message: "You are not authorized to add employee"})
      }
      const newEmployee = await Employee.create({
        employee_id,
        first_name,
        last_name,
        email,
        job_role,
        salary,
        join_date,
      });
      res.status(201).json({
        message: "Employee created successfully",
        newEmployee: newEmployee,
      });
    } catch (error) {
      return res.status(500).json({ message: "Employee not added" });
    }
  },

  // Get employee details by ID
  getEmployee: async (req, res) => {
    try {
      const employee = await Employee.findOne({
        where: { employee_id: req.params.id },
      });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllemployee: async (req, res) => {
    try {
      const employee = await Employee.findAll();
      if (!employee) {
        return res.status(404).json({ message: "Employees not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update employee details
  updateEmployee: async (req, res) => {
    try {
      const {
        employee_id,
        first_name,
        last_name,
        email,
        job_role,
        salary,
        join_date,
      } = req.body;

      // Check if the employee exists
      const employee = await Employee.findOne({
        where: { employee_id: req.params.id },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
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
          .status(403) // 403 Forbidden for insufficient privileges
          .json({ message: "You are not authorized to update details" });
      }

      // Update employee details
      const [updatedRows] = await Employee.update(
        {
          employee_id,
          first_name,
          last_name,
          email,
          job_role,
          salary,
          join_date,
        },
        {
          where: { employee_id: req.params.id },
        }
      );

      if (updatedRows === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee updated successfully" });
    } catch (error) {
      // Catch and respond with any server-side errors
      res.status(500).json({ error: error.message });
    }
  },

  // Delete an employee by ID
  deleteEmployee: async (req, res) => {
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

      // Verify the token
      const decodedToken = jwt.verify(token, secretKey);
      if (!decodedToken) {
        return res.status(401).json({ message: "Unauthorized, invalid token" });
      }

      // Check if the user has sufficient privileges
      if (decodedToken.user_type == "Employee") {
        return res
          .status(403) // 403 Forbidden for insufficient privileges
          .json({ message: "You are not authorized to delete employee" });
      }

      // delete employee
      const deletedEmployee = await Employee.destroy({
        where: { employee_id: req.params.id },
      });

      if (deletedEmployee === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully" });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default employeeController;
