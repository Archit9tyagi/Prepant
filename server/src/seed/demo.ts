import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { Subject } from '../models/Subject.js';

if (env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed demo data in production');
}

const mentorCount = Number(process.env.DEMO_MENTORS ?? 100);
const studentCount = Number(process.env.DEMO_STUDENTS ?? 1000);
if (
  !Number.isInteger(mentorCount) ||
  mentorCount < 1 ||
  mentorCount > 5000 ||
  !Number.isInteger(studentCount) ||
  studentCount < 1 ||
  studentCount > 50000
) {
  throw new Error('DEMO_MENTORS must be 1-5000 and DEMO_STUDENTS must be 1-50000');
}

await connectDB();
const subjects = await Subject.find({ isActive: true }).select('_id name').lean();
if (!subjects.length) throw new Error('Seed taxonomy first with npm run seed:taxonomy');

const passwordHash = await bcrypt.hash('Demo@12345', 10);
const users = Array.from({ length: mentorCount + studentCount }, (_, index) => {
  const mentor = index < mentorCount;
  const number = String(mentor ? index + 1 : index - mentorCount + 1).padStart(4, '0');
  return {
    name: `${mentor ? 'Demo Mentor' : 'Demo Learner'} ${number}`,
    email: `${mentor ? 'mentor' : 'student'}-${number}@demo.prepant.test`,
    role: mentor ? ('mentor' as const) : ('student' as const),
    passwordHash,
    emailVerifiedAt: new Date(),
    status: 'active' as const,
  };
});

await User.bulkWrite(
  users.map((user) => ({
    updateOne: {
      filter: { email: user.email },
      update: { $set: user },
      upsert: true,
    },
  })),
);

const mentors = await User.find({
  role: 'mentor',
  email: /@demo\.prepant\.test$/,
})
  .select('_id name')
  .lean();
await MentorProfile.bulkWrite(
  mentors.map((mentor, index) => {
    const assigned = [subjects[index % subjects.length], subjects[(index + 3) % subjects.length]];
    const ratingCount = 8 + (index % 80);
    return {
      updateOne: {
        filter: { user: mentor._id },
        update: {
          $set: {
            slug: `demo-mentor-${String(index + 1).padStart(4, '0')}`,
            headline: `Demo mentor for ${assigned[0].name} and practical learning`,
            bio: 'Synthetic demo profile for scale and layout testing. Not a real mentor.',
            subjects: assigned.map((subject) => ({
              subject: subject._id,
              levels: ['beginner', 'intermediate'],
              boards: [],
            })),
            hourlyRatePaise: 50000 + (index % 12) * 10000,
            durations: [30, 60],
            trialEnabled: true,
            languages: [
              { code: 'en', level: 'fluent' },
              { code: 'hi', level: 'basic' },
            ],
            country: 'IN',
            timezone: 'Asia/Kolkata',
            experienceYears: 2 + (index % 15),
            status: 'approved',
            badges: index % 5 === 0 ? ['top_rated'] : [],
            completeness: 90,
            searchBoost: 1,
            stats: {
              ratingAvg: Number((4 + (index % 10) / 10).toFixed(1)),
              ratingCount,
              sessionsTaught: 30 + index * 7,
              studentsTaught: 10 + index * 2,
              responseRate: 90 + (index % 10),
            },
          },
        },
        upsert: true,
      },
    };
  }),
);

console.log(
  `Seeded ${mentorCount} demo mentors and ${studentCount} demo learners. ` +
    'Demo password: Demo@12345',
);
await disconnectDB();
await mongoose.disconnect();
