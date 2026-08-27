const express = require('express');
const Employee = require('../models/Employee');

const router = express.Router();

/** Drives the department/status dropdowns so the client never hardcodes them. */
router.get('/', (req, res) => {
  res.json({ departments: Employee.DEPARTMENTS, statuses: Employee.STATUSES });
});

module.exports = router;
