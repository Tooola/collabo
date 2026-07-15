const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('Starting migration: teamId/teamRole -> teams array...');
  
  // Find all users who have a teamId set (old schema)
  const users = await db.collection('users').find({ teamId: { $exists: true, $ne: null } }).toArray();
  console.log(`Found ${users.length} users with existing teamId to migrate.`);

  let migrated = 0;
  for (const user of users) {
    const teamId = user.teamId;
    const teamRole = user.teamRole || 'DEV';

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { teams: [{ teamId, role: teamRole }] },
        $unset: { teamId: '', teamRole: '' }
      }
    );
    migrated++;
  }

  // For users with no teamId but with old teamRole field, just clean up
  const orphanUsers = await db.collection('users').find({ teamId: null, teamRole: { $exists: true } }).toArray();
  for (const user of orphanUsers) {
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { teams: [] },
        $unset: { teamId: '', teamRole: '' }
      }
    );
  }

  console.log(`✅ Migration complete: ${migrated} users migrated. ${orphanUsers.length} cleaned up.`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
