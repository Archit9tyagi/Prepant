export const siteConfig = {
  name: 'Prepant',
  tagline: 'Prep Smart. Succeed Big.',
  description:
    "Whatever you want to learn, whenever you're ready, Prepant connects you with expert mentors who make it simple, personal and tailored.",
  mission:
    'Make quality one-to-one guidance accessible to everyone, whatever their age, goal or background: clear doubts, build confidence, and move forward with clarity and motivation.',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  apiUrl: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api/v1',
  contact: {
    mobile: '9109447256',
    phone: '9278078486',
    email: 'mishra8542@gmail.com',
    whatsapp: 'https://wa.me/919109447256',
  },
  cta: {
    primary: 'Book your 1-to-1 session today',
    secondary: 'Contact us to begin your exam preparation journey',
  },
  social: {
    facebook: 'https://facebook.com/prepant',
    instagram: 'https://instagram.com/prepant',
    twitter: 'https://twitter.com/prepant',
    youtube: 'https://youtube.com/@prepant',
    linkedin: 'https://linkedin.com/company/prepant',
  },
  categories: [
    { name: 'School', slug: 'school', icon: 'GraduationCap' },
    { name: 'Competitive Exams', slug: 'competitive-exams', icon: 'Trophy' },
    { name: 'Languages', slug: 'languages', icon: 'Languages' },
    { name: 'Coding & Tech', slug: 'coding-and-tech', icon: 'Code' },
    { name: 'Music', slug: 'music', icon: 'Music' },
    { name: 'Fitness & Wellness', slug: 'fitness-and-wellness', icon: 'Dumbbell' },
    { name: 'Professional Skills', slug: 'professional-skills', icon: 'Briefcase' },
    { name: 'Hobbies & Arts', slug: 'hobbies-and-arts', icon: 'Palette' },
  ],
  features: {
    hindi: false,
    darkMode: false,
  },
} as const;
