const express = require('express');
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const router = express.Router();

// Guarded: this app seeds its first admin, so account creation is an action an
// existing signed-in admin performs — not something the public internet can do.
// Without this an anonymous caller could mint an admin and read every employee.
router.post(
  '/register',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, me);

module.exports = router;
