import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Subject } from '../models/Subject.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { User } from '../models/User.js';
import { generateSlug } from '../utils/slug.js';

const catalog = [
  [
    'School',
    'GraduationCap',
    [
      'CBSE Maths Class 10',
      'CBSE Science Class 10',
      'ICSE English',
      'Physics Class 12',
      'Chemistry Class 12',
      'Biology Class 12',
      'Accountancy',
      'Economics',
      'History',
      'Geography',
    ],
  ],
  [
    'Competitive Exams',
    'Trophy',
    [
      'JEE Physics',
      'JEE Chemistry',
      'JEE Mathematics',
      'NEET Biology',
      'NEET Physics',
      'NEET Chemistry',
      'UPSC General Studies',
      'SSC Quant',
      'Banking Aptitude',
      'CUET General Test',
    ],
  ],
  [
    'Languages',
    'Languages',
    [
      'Spoken English',
      'Business English',
      'IELTS',
      'TOEFL',
      'Hindi',
      'French',
      'German',
      'Spanish',
      'Japanese',
      'Sanskrit',
    ],
  ],
  [
    'Coding and Tech',
    'Code',
    [
      'Python',
      'JavaScript',
      'TypeScript',
      'DSA',
      'Web Development',
      'React',
      'Node.js',
      'Data Science',
      'Machine Learning',
      'SQL',
    ],
  ],
  [
    'Music',
    'Music',
    [
      'Guitar',
      'Piano',
      'Keyboard',
      'Vocals',
      'Music Theory',
      'Drums',
      'Violin',
      'Hindustani Classical',
      'Western Classical',
      'Music Production',
    ],
  ],
  [
    'Fitness and Wellness',
    'Dumbbell',
    [
      'Yoga',
      'Meditation',
      'Strength Training',
      'Functional Fitness',
      'Nutrition',
      'Weight Loss',
      'Running',
      'Pilates',
      'Zumba',
      'Sports Conditioning',
    ],
  ],
  [
    'Professional Skills',
    'Briefcase',
    [
      'CAT Quant',
      'CAT DILR',
      'CAT VARC',
      'GATE CS',
      'Public Speaking',
      'Interview Preparation',
      'Resume Writing',
      'Digital Marketing',
      'Product Management',
      'Leadership',
    ],
  ],
  [
    'Hobbies and Arts',
    'Palette',
    [
      'Drawing',
      'Painting',
      'Sketching',
      'Photography',
      'Creative Writing',
      'Calligraphy',
      'Dance',
      'Acting',
      'Cooking',
      'Crafts',
    ],
  ],
] as const;

await connectDB();
const subjectByName = new Map<string, string>();

for (const [index, [name, icon, subjects]] of catalog.entries()) {
  const category = await Category.findOneAndUpdate(
    { slug: generateSlug(name) },
    { $set: { name, icon, order: index, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  for (const subjectName of subjects) {
    const subject = await Subject.findOneAndUpdate(
      { slug: generateSlug(subjectName) },
      { $set: { category: category._id, name: subjectName, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    subjectByName.set(subjectName, subject._id.toString());
  }
}

const mentor = await User.findOne({ email: 'mentor1@prepant.test', role: 'mentor' });
if (mentor) {
  const featuredSubjects = ['JEE Physics', 'Physics Class 12', 'Spoken English']
    .map((name) => subjectByName.get(name))
    .filter((id): id is string => Boolean(id));
  await MentorProfile.findOneAndUpdate(
    { user: mentor._id },
    {
      $set: {
        slug: 'mentor-one',
        headline: 'Patient mentor for exams and confident learning',
        bio: 'I help learners build strong fundamentals through clear explanations and practical examples.',
        subjects: featuredSubjects.map((subject) => ({
          subject,
          levels: ['beginner', 'intermediate'],
          boards: [],
        })),
        hourlyRatePaise: 80000,
        durations: [30, 60],
        trialEnabled: true,
        languages: [
          { code: 'en', level: 'native' },
          { code: 'hi', level: 'native' },
        ],
        experienceYears: 6,
        timezone: 'Asia/Kolkata',
        status: 'approved',
        completeness: 80,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

console.log(`Seeded ${catalog.length} categories and ${subjectByName.size} subjects`);
await disconnectDB();
