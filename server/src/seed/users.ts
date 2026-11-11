import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

if (env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed development users in production');
}

const users = [
  { name: 'Prepant Admin', email: 'admin@prepant.test', password: 'Admin@12345', role: 'admin' },
  {
    name: 'Student One',
    email: 'student1@prepant.test',
    password: 'Student@12345',
    role: 'student',
  },
  { name: 'Mentor One', email: 'mentor1@prepant.test', password: 'Mentor@12345', role: 'mentor' },
] as const;

await connectDB();
for (const item of users) {
  await User.updateOne(
    { email: item.email },
    {
      $set: {
        name: item.name,
        role: item.role,
        passwordHash: await bcrypt.hash(item.password, 12),
        emailVerifiedAt: new Date(),
        status: 'active',
      },
    },
    { upsert: true },
  );
}
console.log(`Seeded ${users.length} development users`);
await disconnectDB();
await mongoose.disconnect();
