import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
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

// Placeholder components for Phase 1+
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <p className="mt-2 text-xs text-slate-500">
      Scheduled for implementation in subsequent phases.
    </p>
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
        element: <PlaceholderPage title="Mentor Search (Phase 3)" />,
      },
      {
        path: 'become-a-mentor',
        element: <PlaceholderPage title="Become a Mentor (Phase 2)" />,
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
            <PlaceholderPage title="Student Dashboard (Phase 6)" />
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
            <PlaceholderPage title="Mentor Portal (Phase 2/6)" />
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
            <PlaceholderPage title="Admin Portal (Phase 8)" />
          </DashboardShell>
        </RequireRole>
      </RequireAuth>
    ),
  },
]);
