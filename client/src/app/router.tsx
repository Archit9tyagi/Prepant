import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, useParams } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout.js';
import { DashboardShell } from '../components/layout/DashboardShell.js';
import { RequireAuth } from './guards/RequireAuth.js';
import { RequireRole } from './guards/RequireRole.js';
import {
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  Settings,
} from '../pages/auth/AuthForms.js';
import {
  BecomeMentor,
  MentorOnboarding,
  AdminMentors,
  AdminCatalog,
} from '../pages/mentor/MentorPages.js';
import {
  Contact,
  MentorProfilePage,
  MentorSearch,
  StaticPage,
  FindMyMentor,
  ContentLanding,
  BookingPage,
  BlogList,
  BlogPost,
} from '../pages/public/PublicPages.js';
import { Classroom, MentorAvailability, Sessions } from '../pages/booking/BookingPages.js';
import {
  FavoritesPage,
  MessagesPage,
  NotificationsPage,
} from '../pages/community/CommunityPages.js';
import {
  AdminOperations,
  EarningsPage,
  MentorDashboard,
} from '../pages/operations/OperationsPages.js';

const Home = lazy(() => import('../pages/Home.js').then((m) => ({ default: m.Home })));
const Styleguide = lazy(() =>
  import('../pages/Styleguide.js').then((m) => ({ default: m.Styleguide })),
);
const NotFound = lazy(() => import('../pages/NotFound.js').then((m) => ({ default: m.NotFound })));

const SuspenseLoader: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '_styleguide',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <Styleguide />
          </Suspense>
        ),
      },
      {
        path: 'mentors',
        element: <MentorSearch />,
      },
      { path: 'find-my-mentor', element: <FindMyMentor /> },
      { path: 'learn/:categorySlug', element: <ContentLanding /> },
      { path: 'learn/:categorySlug/:subjectSlug', element: <ContentLanding /> },
      { path: 'exams/:examSlug', element: <ContentLanding exam /> },
      { path: 'book/:slug', element: <BookingPage /> },
      { path: 'blog', element: <BlogList /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      {
        path: 'become-a-mentor',
        element: <BecomeMentor />,
      },
      { path: 'mentors/:slug', element: <MentorProfileRoute /> },
      { path: 'contact', element: <Contact /> },
      {
        path: 'about',
        element: (
          <StaticPage title="About Prepant">
            Prepant makes quality one-to-one guidance accessible to learners across school subjects,
            exams, languages, technology, music and more.
          </StaticPage>
        ),
      },
      {
        path: 'how-it-works',
        element: (
          <StaticPage title="How Prepant works">
            Choose a mentor, book a trial session, and learn through clear, personal guidance built
            around your goals.
          </StaticPage>
        ),
      },
      {
        path: 'faq',
        element: (
          <StaticPage title="Frequently asked questions">
            You can browse mentors by subject and experience. Trial sessions help you decide whether
            a mentor is right for you. Payments and booking workflows will expand in the next phase.
          </StaticPage>
        ),
      },
      {
        path: 'privacy',
        element: (
          <StaticPage title="Privacy policy">
            Draft: pending legal review. Prepant uses your information to provide mentoring, support
            bookings and keep the marketplace safe.
          </StaticPage>
        ),
      },
      {
        path: 'terms',
        element: (
          <StaticPage title="Terms of service">
            Draft: pending legal review. Use Prepant respectfully and provide accurate information
            when creating an account.
          </StaticPage>
        ),
      },
      {
        path: 'refund-policy',
        element: (
          <StaticPage title="Refund policy">
            Draft: pending legal review. Booking cancellation and refund rules will be shown before
            payment.
          </StaticPage>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPassword />,
      },
      {
        path: 'verify-email/:token',
        element: <VerifyEmail />,
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/app/settings',
    element: (
      <RequireAuth>
        <Settings />
      </RequireAuth>
    ),
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <RequireRole roles={['student']}>
          <DashboardShell role="student">
            <Sessions />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teach',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <MentorDashboard />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teach/availability',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <MentorAvailability />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teach/earnings',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <EarningsPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/app/sessions',
    element: (
      <RequireAuth>
        <RequireRole roles={['student']}>
          <DashboardShell role="student">
            <Sessions />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/app/messages',
    element: (
      <RequireAuth>
        <RequireRole roles={['student']}>
          <DashboardShell role="student">
            <MessagesPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/app/favorites',
    element: (
      <RequireAuth>
        <RequireRole roles={['student']}>
          <DashboardShell role="student">
            <FavoritesPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/app/notifications',
    element: (
      <RequireAuth>
        <RequireRole roles={['student']}>
          <DashboardShell role="student">
            <NotificationsPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teach/messages',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <MessagesPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/teach/notifications',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <NotificationsPage />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/classroom/:bookingId',
    element: (
      <RequireAuth>
        <Classroom />
      </RequireAuth>
    ),
  },
  {
    path: '/teach/onboarding',
    element: (
      <RequireAuth>
        <RequireRole roles={['mentor']}>
          <DashboardShell role="mentor">
            <MentorOnboarding />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <DashboardShell role="admin">
            <AdminOperations type="stats" />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/mentors',
    element: (
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <DashboardShell role="admin">
            <AdminMentors />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  {
    path: '/admin/catalog',
    element: (
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <DashboardShell role="admin">
            <AdminCatalog />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
  ...(
    [
      'users',
      'bookings',
      'payments',
      'payouts',
      'reviews',
      'leads',
      'blog',
      'settings',
      'audit',
    ] as const
  ).map((type) => ({
    path: `/admin/${type}`,
    element: (
      <RequireAuth>
        <RequireRole roles={['admin']}>
          <DashboardShell role="admin">
            <AdminOperations type={type} />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  })),
]);

function MentorProfileRoute() {
  const { slug = '' } = useParams();
  return <MentorProfilePage slug={slug} />;
}
