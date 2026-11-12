import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Search, Sparkles, Users, Video, Star, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { CategoryTile } from '../components/common/CategoryTile.js';
import { MentorCard } from '../components/common/MentorCard.js';
import { SectionHeader } from '../components/common/SectionHeader.js';
import { StatCard } from '../components/common/StatCard.js';
import { Seo } from '../components/common/Seo.js';
import { siteConfig } from '../config/site.js';
import type { MentorCardData } from '../types/index.js';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api.js';

type HomeStats = {
  activeLearners: number;
  approvedMentors: number;
  sessionsDelivered: number;
  averageRating: number | null;
};

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  useEffect(() => {
    void Promise.all([
      api.get('/mentors', { params: { sort: 'rating', limit: 3 } }),
      api.get('/stats'),
    ])
      .then(([mentorResponse, statsResponse]) => {
        setMentors(mentorResponse.data.data);
        setStats(statsResponse.data.data);
      })
      .catch(() => undefined);
  }, []);
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
              <span>{t('home.platform')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {t('hero.headline')}
            </h1>

            {/* Subhead */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {t('hero.subhead')}
            </p>

            {/* Search Input Box */}
            <div className="mt-8 flex w-full max-w-xl flex-col sm:flex-row gap-2.5 rounded-[16px] border border-slate-200 bg-white p-2 shadow-lg">
              <div className="flex flex-1 items-center px-3 gap-2.5">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-900 bg-transparent"
                />
              </div>
              <Button size="lg" asChild className="rounded-[10px] font-bold">
                <Link to="/mentors">{t('hero.cta')}</Link>
              </Button>
            </div>

            {/* Trust Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />{' '}
                {t('common.verifiedMentors')}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> {t('common.oneToOne')}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> {t('common.flexible')}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />{' '}
                {t('common.trialDiscount')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={t('home.explore')}
            subtitle={t('home.exploreSub')}
            action={{ label: t('home.viewMentors'), onClick: () => navigate('/mentors') }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {siteConfig.categories.map((category) => (
              <CategoryTile
                key={category.slug}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                onClick={() => navigate(`/mentors?category=${category.slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={t('home.howWorks')}
            subtitle={t('home.howWorksSub')}
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">{t('home.choose')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('home.chooseText')}</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">{t('home.book')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('home.bookText')}</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-[16px] border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">{t('home.learn')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('home.learnText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={t('home.featured')}
            subtitle={t('home.featuredSub')}
            action={{ label: t('home.exploreAll'), href: '/mentors' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((m) => (
              <MentorCard key={m.slug} mentor={m} />
            ))}
          </div>
          {!mentors.length && (
            <p className="mt-6 text-center text-sm text-slate-500">{t('home.noMentors')}</p>
          )}
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              value={stats ? stats.activeLearners.toLocaleString('en-IN') : '—'}
              label={t('home.learners')}
            />
            <StatCard
              icon={GraduationCap}
              value={stats ? stats.approvedMentors.toLocaleString('en-IN') : '—'}
              label={t('home.mentors')}
            />
            <StatCard
              icon={Video}
              value={stats ? stats.sessionsDelivered.toLocaleString('en-IN') : '—'}
              label={t('home.sessions')}
            />
            <StatCard
              icon={Star}
              value={stats?.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : '—'}
              label={t('home.rating')}
            />
          </div>
        </div>
      </section>

      {/* Teach banner */}
      <section className="py-16 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 text-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-400">
              {t('home.becomeTeacher')}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              {t('home.teacherTitle')}
            </h2>
            <p className="mt-2 text-sm text-primary-100 max-w-xl">{t('home.teacherText')}</p>
          </div>
          <Button variant="accent" size="lg" asChild className="shrink-0 text-slate-950 font-bold">
            <Link to="/become-a-mentor">{t('home.apply')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
};
