const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToMongoDB() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  await client.connect();

  db = client.db('tender_scanner');

  // Confirm that MongoDB is actually reachable.
  await db.command({ ping: 1 });

  console.log('MongoDB connected successfully');

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db;
}

module.exports = {
  connectToMongoDB,
  getDatabase,
};