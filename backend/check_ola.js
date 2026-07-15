require('dotenv').config();
const mongoose = require('mongoose');

async function checkOla() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ name: 'Ola' });
  console.log('Ola record:', user);
  process.exit(0);
}

checkOla();
