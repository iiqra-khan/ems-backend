import express from 'express';
import employeeController from '../controllers/employeeController.js';
import authenticateJWT from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to create a new employee
router.post('/',authenticateJWT, employeeController.createEmployee);

// Route to get an employee by ID
router.get('/:id', employeeController.getEmployee);

// Route to get all employees
router.get('/',authenticateJWT, employeeController.getAllemployee);

// Route to update an employee by ID
router.put('/:id',authenticateJWT, employeeController.updateEmployee);

// Route to delete an employee by ID
router.delete('/:id',authenticateJWT, employeeController.deleteEmployee);

export default router;



