const mongoose = require('mongoose');
const { User } = require('./src/models/User');
const { Project } = require('./src/models/Project');
const { formatUser, formatProject } = require('./src/utils/formatters');
require('dotenv').config();

async function testLogic() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a dev user
  const devUser = await User.findOne({ role: 'DEV' });
  if (!devUser) {
    console.log("No DEV user found");
    process.exit(0);
  }
  
  const user = formatUser(devUser);
  console.log("User:", user);
  
  // Find a project
  const dbProject = await Project.findOne();
  if (!dbProject) {
    console.log("No projects found");
    process.exit(0);
  }
  
  const project = formatProject(dbProject);
  console.log("Project:", project);
  
  const userRole = user?.role?.toLowerCase();
  const isGlobalAdmin = userRole === 'admin';
  const teamInfo = user?.teams?.find(t => t.teamId === project?.teamId);
  const isGlobalLeadInTeam = userRole === 'lead' && !!teamInfo;
  const isTeamLead = teamInfo?.role?.toLowerCase() === 'lead';
  
  const canWriteTasks = isGlobalAdmin || isGlobalLeadInTeam || isTeamLead;
  
  console.log("canWriteTasks:", canWriteTasks);
  
  process.exit(0);
}

testLogic();
