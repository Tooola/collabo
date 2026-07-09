import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './services/database';
import { User } from './models/User';
import { Team } from './models/Team';
import { Project } from './models/Project';
import { Task } from './models/Task';

async function main() {
  await connectDB();
  const password = await bcrypt.hash('password', 10);

  // Generate a single shared workspaceId for all demo data
  const demoWorkspaceId = new mongoose.Types.ObjectId();
  console.log(`Demo workspace ID: ${demoWorkspaceId}`);

  console.log('Clearing old data...');
  await Task.deleteMany({});
  await Project.deleteMany({});
  await Team.deleteMany({});
  await User.deleteMany({});

  console.log('Creating teams...');
  const frontend = await Team.create({ name: 'Frontend Team', description: 'Handles all UI/UX development', workspaceId: demoWorkspaceId });
  const backend = await Team.create({ name: 'Backend Team', description: 'API and server-side logic', workspaceId: demoWorkspaceId });

  console.log('Creating users...');
  const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', password, role: 'ADMIN', workspaceId: demoWorkspaceId });
  const lead = await User.create({ name: 'Sarah Lead', email: 'lead@test.com', password, role: 'LEAD', teamId: frontend._id, workspaceId: demoWorkspaceId });
  const dev = await User.create({ name: 'John Dev', email: 'dev@test.com', password, role: 'DEV', teamId: frontend._id, workspaceId: demoWorkspaceId });
  const backendDev = await User.create({ name: 'Emma Dev', email: 'emma@test.com', password, role: 'DEV', teamId: backend._id, workspaceId: demoWorkspaceId });

  console.log('Creating projects...');
  const dashboard = await Project.create({
    name: 'Dashboard Redesign',
    description: 'Complete overhaul of the internal dashboard',
    status: 'EN_COURS',
    teamId: frontend._id,
    workspaceId: demoWorkspaceId
  });

  const apiMigration = await Project.create({
    name: 'API v2 Migration',
    description: 'Migrate REST endpoints to v2 schema',
    status: 'EN_COURS',
    teamId: backend._id,
    workspaceId: demoWorkspaceId
  });

  console.log('Creating tasks...');
  await Task.insertMany([
    {
      title: 'Design new layout',
      description: 'Create wireframes for the new dashboard',
      projectId: dashboard._id,
      assignedTo: dev._id,
      dueDate: new Date('2026-06-20'),
      status: 'TERMINE',
      workspaceId: demoWorkspaceId
    },
    {
      title: 'Implement sidebar',
      description: 'Build collapsible sidebar component',
      projectId: dashboard._id,
      assignedTo: dev._id,
      dueDate: new Date('2026-06-25'),
      status: 'EN_COURS',
      workspaceId: demoWorkspaceId
    },
    {
      title: 'Review dashboard scope',
      description: 'Validate project board workflow',
      projectId: dashboard._id,
      assignedTo: lead._id,
      dueDate: new Date('2026-06-28'),
      status: 'A_FAIRE',
      workspaceId: demoWorkspaceId
    },
    {
      title: 'API endpoint refactor',
      description: 'Refactor user endpoints to v2',
      projectId: apiMigration._id,
      assignedTo: backendDev._id,
      dueDate: new Date('2026-06-30'),
      status: 'BLOQUE',
      workspaceId: demoWorkspaceId
    }
  ]);

  console.log(`\n✅ Seed complete!`);
  console.log(`   Admin: ${admin.email} / password`);
  console.log(`   Lead:  ${lead.email} / password`);
  console.log(`   Dev:   ${dev.email} / password`);
  console.log(`   Workspace ID: ${demoWorkspaceId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
