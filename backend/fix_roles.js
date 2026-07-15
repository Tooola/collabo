const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const res = await db.collection('users').updateMany(
    { role: 'LEAD' },
    { $set: { role: 'DEV', teamRole: 'LEAD' } }
  );
  
  console.log(`Updated ${res.modifiedCount} users from global LEAD to global DEV.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
