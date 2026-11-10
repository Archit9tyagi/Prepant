import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, Sparkles, Users, Video, Star, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { CategoryTile } from '../components/common/CategoryTile.js';
import { MentorCard } from '../components/common/MentorCard.js';
import { SectionHeader } from '../components/common/SectionHeader.js';
import { StatCard } from '../components/common/StatCard.js';
import { Seo } from '../components/common/Seo.js';
import { siteConfig } from '../config/site.js';
import type { MentorCardData } from '../types/index.js';

const SAMPLE_MENTORS: MentorCardData[] = [
  {
    slug: 'aravind-sharma-physics',
    name: 'Dr. Aravind Sharma',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Ex-IITian | 12+ Yrs Teaching JEE Advanced & CBSE Physics',
    subjects: ['JEE Physics', 'NEET Physics', 'CBSE Class 12'],
    ratingAvg: 4.9,
    ratingCount: 148,
    sessionsTaught: 1240,
    hourlyRatePaise: 80000, // ₹800
    trialPricePaise: 40000, // ₹400
    trialEnabled: true,
    badges: ['verified', 'top_rated'],
    bio: 'Passionate physics mentor focusing on first-principles understanding and problem-solving intuition. Helped 80+ students clear IIT-JEE with top ranks.',
    languages: [
      { code: 'en', level: 'Fluent' },
      { code: 'hi', level: 'Native' },
    ],
    country: 'IN',
    timezone: 'Asia/Kolkata',
  },
  {
    slug: 'priya-nair-biology',
    name: 'Priya Nair, M.Sc.',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'AIIMS Gold Medalist Guide | NEET Botany & Zoology Specialist',
    subjects: ['NEET Biology', 'CBSE Class 11', 'Olympiad'],
    ratingAvg: 4.95,
    ratingCount: 210,
    sessionsTaught: 1890,
    hourlyRatePaise: 95000, // ₹950
    trialPricePaise: 47500, // ₹475
    trialEnabled: true,
    badges: ['verified', 'rising'],
    bio: 'Simplifying complex biological diagrams, memorization techniques, and NCERT deep dives for aspiring medical doctors.',
    languages: [
      { code: 'en', level: 'Fluent' },
      { code: 'hi', level: 'Fluent' },
    ],
    country: 'IN',
    timezone: 'Asia/Kolkata',
  },
  {
    slug: 'rohit-verma-coding',
    name: 'Rohit Verma',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior SDE @ Tier-1 Tech | Python, Data Structures & System Design',
    subjects: ['Python', 'DSA & LeetCode', 'Web Dev'],
    ratingAvg: 4.85,
    ratingCount: 94,
    sessionsTaught: 780,
    hourlyRatePaise: 120000, // ₹1,200
    trialPricePaise: 60000, // ₹600
    trialEnabled: true,
    badges: ['verified'],
    bio: 'Hands-on live coding mentorship tailored for college students and professionals aiming for top product engineering roles.',
    languages: [{ code: 'en', level: 'Fluent' }],
    country: 'IN',
    timezone: 'Asia/Kolkata',
  },
];

export const Home: React.FC = () => {
  return (
    <>
      <Seo />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF2FF] via-[#FFFFFF] to-[#FEF3C7]/40 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3.5 py-1 text-xs font-bold text-primary-700 shadow-xs backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent-500 fill-accent-500" />
              <span>Universal 1-to-1 Learning Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Prep Smart. <span className="text-primary-600">Succeed Big.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Whatever you want to learn, whenever you&apos;re ready, Prepant connects you with
              expert mentors who make it simple, personal and tailored.
            </p>

            {/* Search Input Box */}
            <div className="mt-8 flex w-full max-w-xl flex-col sm:flex-row gap-2.5 rounded-[16px] border border-slate-200 bg-white p-2 shadow-lg">
              <div className="flex flex-1 items-center px-3 gap-2.5">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="What do you want to learn? (e.g. JEE Physics, Python)"
                  className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-900 bg-transparent"
                />
              </div>
              <Button size="lg" asChild className="rounded-[10px] font-bold">
                <Link to="/mentors">Find my mentor</Link>
              </Button>
            </div>

            {/* Trust Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> Verified mentors
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> True 1-to-1 sessions
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> Flexible timings
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> Trial session discount
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explore by Category"
            subtitle="From CBSE school boards and competitive exams to professional coding and fitness."
            action={{ label: 'View all mentors', href: '/mentors' }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {siteConfig.categories.map((category) => (
              <CategoryTile
                key={category.slug}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="How Prepant Works"
            subtitle="Get started in three simple steps — no rigid contracts, learn at your pace."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Choose your mentor</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by subject, level, budget, and language. Watch intro videos and read reviews
                from verified learners.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Book a trial session</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick a slot that fits your schedule in your time zone. Get 50% off on your first
                session with any mentor.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Learn and grow</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Join the interactive classroom, clear doubts one-on-one, and track your ongoing
                academic progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured Mentors"
            subtitle="Meet top-rated educators ready to guide you."
            action={{ label: 'Explore all mentors', href: '/mentors' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_MENTORS.map((m) => (
              <MentorCard key={m.slug} mentor={m} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} value="2,500+" label="Active Learners" />
            <StatCard icon={GraduationCap} value="180+" label="Expert Mentors" />
            <StatCard icon={Video} value="15,000+" label="Sessions Delivered" />
            <StatCard icon={Star} value="4.9 / 5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Teach banner */}
      <section className="py-16 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 text-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
              Become a teacher
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Share your knowledge. Earn on your own terms.
            </h2>
            <p className="mt-2 text-sm text-primary-100 max-w-xl">
              Set your own hourly rate, manage your availability with ease, and inspire students
              across the nation.
            </p>
          </div>
          <Button variant="accent" size="lg" asChild className="shrink-0 text-slate-950 font-bold">
            <Link to="/become-a-mentor">Apply as a mentor</Link>
          </Button>
        </div>
      </section>
    </>
  );
};
