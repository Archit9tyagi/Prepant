import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, BookOpen, User as UserIcon, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { siteConfig } from '../../config/site.js';
import { api } from '../../lib/api.js';
import { useTranslation } from 'react-i18next';
import i18n from '../../app/i18n.js';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setMobileNavOpen } = useUiStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    void api.post('/auth/logout').catch(() => undefined);
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'mentor') return '/teach';
    if (user.role === 'admin') return '/admin';
    return '/app';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-600 text-white shadow-xs group-hover:bg-primary-700 transition-colors">
            <span className="font-extrabold text-lg tracking-tight font-heading">P</span>
            <div className="h-1.5 w-1.5 rounded-full bg-accent-400 absolute ml-3 -mt-3" />
          </div>
          <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
            Prep<span className="text-primary-600">ant</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
          <Link to="/mentors" className="hover:text-primary-600 transition-colors">
            {t('nav.findMentor')}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-primary-600 transition-colors cursor-pointer"
              >
                <span>{t('nav.categories')}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel>{t('nav.popularCategories')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {siteConfig.categories.map((cat) => (
                <DropdownMenuItem key={cat.slug} asChild>
                  <Link
                    to={`/mentors?category=${cat.slug}`}
                    className="w-full flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-primary-500" />
                    <span>{cat.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/become-a-mentor" className="hover:text-primary-600 transition-colors">
            {t('nav.becomeMentor')}
          </Link>
        </nav>

        {/* Right Action / Auth */}
        <div className="hidden md:flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="sr-only">{t('nav.language')}</span>
            <select
              aria-label={t('nav.language')}
              value={i18n.resolvedLanguage?.split('-')[0] || 'en'}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-500"
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage src={user.avatar?.url} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] font-normal text-slate-400 truncate">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getDashboardLink()} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">{t('nav.signup')}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <select
            aria-label={t('nav.language')}
            value={i18n.resolvedLanguage?.split('-')[0] || 'en'}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="ta">த</option>
            <option value="te">తె</option>
            <option value="mr">म</option>
            <option value="kn">ಕ</option>
            <option value="pa">ਪੰ</option>
          </select>
          {user && (
            <Link to={getDashboardLink()} className="p-1">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatar?.url} alt={user.name} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-[10px] p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
