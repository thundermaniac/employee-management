const { validationResult } = require('express-validator');

/** Turns express-validator failures into a single 400 with field-level details. */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const fields = {};
  errors.array().forEach((e) => {
    if (!fields[e.path]) fields[e.path] = e.msg;
  });

  return res.status(400).json({ message: 'Validation failed', fields });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      message: `An entry with that ${field} already exists`,
      fields: { [field]: 'Already in use' },
    });
  }

  if (err.name === 'ValidationError') {
    const fields = {};
    Object.entries(err.errors).forEach(([key, value]) => {
      fields[key] = value.message;
    });
    return res.status(400).json({ message: 'Validation failed', fields });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  return res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
}

/** Wraps async route handlers so rejected promises reach errorHandler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { validate, notFound, errorHandler, asyncHandler };
