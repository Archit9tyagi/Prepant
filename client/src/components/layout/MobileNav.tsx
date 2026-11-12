import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, LogIn, UserPlus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet.js';
import { Button } from '../ui/button.js';
import { useUiStore } from '../../store/uiStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { siteConfig } from '../../config/site.js';
import { useTranslation } from 'react-i18next';
import i18n from '../../app/i18n.js';

export const MobileNav: React.FC = () => {
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const handleClose = () => setMobileNavOpen(false);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between"
      >
        <div>
          <SheetHeader className="pb-6 border-b border-slate-100">
            <SheetTitle>
              <Link to="/" onClick={handleClose} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-600 text-white">
                  <span className="font-extrabold text-base font-heading">P</span>
                </div>
                <span className="font-heading font-extrabold text-lg text-slate-900">
                  Prep<span className="text-primary-600">ant</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Nav links */}
          <div className="py-6 space-y-4">
            <Link
              to="/mentors"
              onClick={handleClose}
              className="flex items-center gap-3 text-sm font-semibold text-slate-800 hover:text-primary-600"
            >
              <BookOpen className="h-4 w-4 text-primary-500" />
              {t('nav.findMentor')}
            </Link>

            <Link
              to="/become-a-mentor"
              onClick={handleClose}
              className="flex items-center gap-3 text-sm font-semibold text-slate-800 hover:text-primary-600"
            >
              <User className="h-4 w-4 text-primary-500" />
              {t('nav.becomeMentor')}
            </Link>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t('nav.popularCategories')}
              </p>
              <div className="space-y-2">
                {siteConfig.categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/mentors?category=${cat.slug}`}
                    onClick={handleClose}
                    className="block text-xs text-slate-600 hover:text-primary-600 py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Auth action at bottom */}
        <div className="pt-6 border-t border-slate-100">
          {user ? (
            <Button asChild className="w-full" onClick={handleClose}>
              <Link to="/app">{t('nav.dashboard')}</Link>
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild onClick={handleClose}>
                <Link to="/login" className="flex items-center justify-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  {t('nav.login')}
                </Link>
              </Button>
              <Button size="sm" asChild onClick={handleClose}>
                <Link to="/signup" className="flex items-center justify-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  {t('nav.signup')}
                </Link>
              </Button>
            </div>
          )}
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            {t('nav.language')}
            <select
              className="mt-1 w-full rounded border p-2"
              value={i18n.resolvedLanguage?.split('-')[0] || 'en'}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="mr">मराठी</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
          </label>
        </div>
      </SheetContent>
    </Sheet>
  );
};
