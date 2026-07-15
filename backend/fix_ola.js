require('dotenv').config();
const mongoose = require('mongoose');

async function fixOla() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const result = await db.collection('users').updateOne({ name: 'Ola' }, { $set: { role: 'LEAD' } });
  console.log('Fixed Ola:', result);
  process.exit(0);
}

fixOla();
