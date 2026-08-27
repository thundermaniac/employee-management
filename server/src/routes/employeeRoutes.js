const express = require('express');
const { body } = require('express-validator');
const Employee = require('../models/Employee');
const {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAnalytics,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const router = express.Router();

const employeeRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('department').isIn(Employee.DEPARTMENTS).withMessage('Choose a department'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('status').isIn(Employee.STATUSES).withMessage('Choose a status'),
  body('joiningDate').isISO8601().withMessage('Enter a valid joining date'),
  body('salary').optional({ values: 'falsy' }).isNumeric().withMessage('Salary must be a number'),
];

// Every employee route sits behind a valid JWT.
router.use(protect);

router.get('/analytics/summary', getAnalytics);

router.route('/').get(listEmployees).post(employeeRules, validate, createEmployee);

router
  .route('/:id')
  .get(getEmployee)
  .put(employeeRules, validate, updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
