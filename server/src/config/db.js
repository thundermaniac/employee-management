const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connects to MongoDB.
 *
 * Uses MONGODB_URI when set (Atlas or a local mongod). When it is missing we
 * spin up an in-memory MongoDB so the project can be cloned and run without any
 * database setup — the Mongoose models and queries are identical either way.
 */
async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    // eslint-disable-next-line global-require
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('MONGODB_URI not set — started an in-memory MongoDB instance.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected: ${host}/${name}`);

  return { uri, isMemory: Boolean(memoryServer) };
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
