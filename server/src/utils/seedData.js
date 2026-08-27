const User = require('../models/User');
const Employee = require('../models/Employee');

const DEMO_USER = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
};

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Rohan', 'Meera', 'Karthik', 'Ananya', 'Vikram', 'Sneha',
  'Arjun', 'Priya', 'Rahul', 'Nithya', 'Sanjay', 'Kavya', 'Imran', 'Lakshmi',
  'Gautam', 'Divya', 'Naveen', 'Ishita', 'Manish', 'Pooja', 'Suresh', 'Tara',
];
const LAST_NAMES = [
  'Sharma', 'Iyer', 'Nair', 'Reddy', 'Patel', 'Menon', 'Gupta', 'Rao',
  'Krishnan', 'Desai', 'Banerjee', 'Pillai',
];

const ROLES = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Engineering Manager'],
  Design: ['UI Designer', 'UX Researcher', 'Product Designer', 'Design Lead'],
  Product: ['Product Analyst', 'Product Manager', 'Associate PM'],
  Marketing: ['Content Writer', 'SEO Specialist', 'Marketing Manager'],
  Sales: ['Sales Executive', 'Account Manager', 'Regional Sales Head'],
  'Human Resources': ['HR Executive', 'Recruiter', 'HR Business Partner'],
  Finance: ['Accountant', 'Financial Analyst', 'Finance Manager'],
  Support: ['Support Engineer', 'Customer Success Associate', 'Support Lead'],
};

const STATUS_WEIGHTS = [
  ...Array(7).fill('Active'),
  ...Array(2).fill('On Leave'),
  ...Array(2).fill('Inactive'),
];

// Real orgs are lopsided — an even split would make the headcount chart flat.
const DEPARTMENT_WEIGHTS = [
  ...Array(14).fill('Engineering'),
  ...Array(8).fill('Sales'),
  ...Array(6).fill('Support'),
  ...Array(5).fill('Marketing'),
  ...Array(4).fill('Design'),
  ...Array(4).fill('Product'),
  ...Array(4).fill('Human Resources'),
  ...Array(3).fill('Finance'),
];

const pick = (list, i) => list[i % list.length];

/** Deterministic-ish sample data — enough rows to exercise pagination and charts. */
function buildEmployees(count = 48) {
  const employees = [];

  for (let i = 0; i < count; i += 1) {
    const first = pick(FIRST_NAMES, i * 5);
    const last = pick(LAST_NAMES, i * 3);
    const department = pick(DEPARTMENT_WEIGHTS, i * 17);
    const designation = pick(ROLES[department], i);

    // Spread joining dates across the last ~22 months so the monthly chart has shape.
    const joiningDate = new Date();
    joiningDate.setMonth(joiningDate.getMonth() - ((i * 7) % 22));
    joiningDate.setDate(((i * 3) % 27) + 1);
    joiningDate.setHours(0, 0, 0, 0);

    employees.push({
      name: `${first} ${last}`,
      email: `${first}.${last}${i}`.toLowerCase() + '@example.com',
      phone: `+91 9${String(800000000 + i * 137).slice(0, 9)}`,
      department,
      designation,
      status: pick(STATUS_WEIGHTS, i * 3),
      joiningDate,
      salary: 400000 + (i % 12) * 75000,
    });
  }

  return employees;
}

/** Inserts the demo login and sample employees. Skips whatever already exists. */
async function seedDatabase({ force = false } = {}) {
  if (force) {
    await Promise.all([User.deleteMany({}), Employee.deleteMany({})]);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create(DEMO_USER);
    console.log(`Seeded demo user: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  }

  const employeeCount = await Employee.countDocuments();
  if (employeeCount === 0) {
    const created = await Employee.insertMany(buildEmployees());
    console.log(`Seeded ${created.length} employees.`);
  }
}

module.exports = { seedDatabase, buildEmployees, DEMO_USER };
