import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { MobileNav } from './MobileNav.js';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Header />
      <MobileNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
