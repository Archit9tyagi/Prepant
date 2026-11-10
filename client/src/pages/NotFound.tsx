import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Seo } from '../components/common/Seo.js';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Seo title="Page Not Found (404)" noIndex />
      <div className="mb-6 rounded-full bg-primary-50 p-6 text-primary-600 shadow-xs">
        <Compass className="h-12 w-12 stroke-[1.5]" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        404 — Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        We couldn&apos;t find the learning resource or page you were looking for. It might have been
        moved or does not exist.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/mentors">Explore Mentors</Link>
        </Button>
      </div>
    </div>
  );
};
