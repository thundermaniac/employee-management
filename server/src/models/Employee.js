const mongoose = require('mongoose');

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Support',
];

const STATUSES = ['Active', 'Inactive', 'On Leave'];

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true, default: '' },
    department: { type: String, required: true, enum: DEPARTMENTS },
    designation: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: STATUSES, default: 'Active' },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

employeeSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.STATUSES = STATUSES;
