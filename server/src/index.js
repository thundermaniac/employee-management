require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const metaRoutes = require('./routes/metaRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/meta', metaRoutes);

app.use(notFound);
app.use(errorHandler);

(async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing — copy server/.env.example to server/.env');
    }

    const { isMemory } = await connectDB();

    // An in-memory database starts empty on every boot, so always seed it.
    // For a real database we only seed when the collections are still empty.
    await seedDatabase({ force: false });
    if (isMemory) {
      console.log('Data is in memory only and resets when the server restarts.');
    }

    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();

module.exports = app;
