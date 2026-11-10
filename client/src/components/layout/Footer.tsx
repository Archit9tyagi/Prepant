import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Heart } from 'lucide-react';
import { siteConfig } from '../../config/site.js';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-14 pb-8 text-slate-600">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-block">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-600 text-white shadow-xs">
                <span className="font-extrabold text-lg tracking-tight font-heading">P</span>
              </div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                Prep<span className="text-primary-600">ant</span>
              </span>
            </Link>

            <p className="text-sm font-semibold text-primary-700">{siteConfig.tagline}</p>

            <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
              {siteConfig.description}
            </p>

            {/* Contact details */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>
                  Mobile: {siteConfig.contact.mobile} | Phone: {siteConfig.contact.phone}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="h-4 w-4 text-primary-600" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3.5">Learn</h4>
            <ul className="space-y-2 text-xs">
              {siteConfig.categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/mentors?category=${cat.slug}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3.5">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-primary-600 transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary-600 transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/become-a-mentor" className="hover:text-primary-600 transition-colors">
                  Teach on Prepant
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3.5">Legal & Policy</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-primary-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-primary-600 transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/mentor-guidelines" className="hover:text-primary-600 transition-colors">
                  Mentor Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/_styleguide"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Styleguide (Internal)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};
