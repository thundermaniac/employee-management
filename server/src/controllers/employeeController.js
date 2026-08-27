const Employee = require('../models/Employee');
const { asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the Mongo filter shared by the listing and the analytics endpoints. */
function buildFilter({ search, department, status }) {
  const filter = {};

  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (department && department !== 'All') filter.department = department;
  if (status && status !== 'All') filter.status = status;

  return filter;
}

const listEmployees = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const sortBy = ['name', 'email', 'department', 'designation', 'status', 'joiningDate'].includes(
    req.query.sortBy
  )
    ? req.query.sortBy
    : 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  const filter = buildFilter(req.query);

  const [items, total] = await Promise.all([
    Employee.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  });
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  return res.json(employee);
});

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  return res.json(employee);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  return res.json({ message: 'Employee deleted', id: req.params.id });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [total, byStatus, byDepartment, monthlyRaw, recentHires] = await Promise.all([
    Employee.countDocuments(),
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Employee.aggregate([
      { $match: { joiningDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$joiningDate' }, month: { $month: '$joiningDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Employee.find().sort({ joiningDate: -1 }).limit(5),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));

  // Fill the gaps so the chart shows a continuous 12-month axis.
  const monthlyMap = Object.fromEntries(
    monthlyRaw.map((m) => [`${m._id.year}-${m._id.month}`, m.count])
  );
  const monthlyJoined = [];
  const cursor = new Date(twelveMonthsAgo);
  for (let i = 0; i < 12; i += 1) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    monthlyJoined.push({
      label: cursor.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      count: monthlyMap[`${year}-${month}`] || 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  res.json({
    total,
    active: statusMap.Active || 0,
    inactive: statusMap.Inactive || 0,
    onLeave: statusMap['On Leave'] || 0,
    byStatus: byStatus.map((s) => ({ name: s._id, count: s.count })),
    byDepartment: byDepartment.map((d) => ({ name: d._id, count: d.count })),
    monthlyJoined,
    recentHires,
  });
});

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAnalytics,
};
