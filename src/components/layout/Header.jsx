import React from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation';

export const Header = ({ onMenuClick }) => {
  const location = useLocation();

  // Determine current page title from navigation config
  let pageTitle = 'Tổng quan';
  for (const item of NAVIGATION_ITEMS) {
    if (location.pathname === item.href) {
      pageTitle = item.name;
      break;
    }
    if (item.children) {
      const childMatch = item.children.find((c) => location.pathname === c.href);
      if (childMatch) {
        pageTitle = childMatch.name;
        break;
      }
    }
    // Simple fallback for nested routes (e.g. /movies/new)
    if (location.pathname.startsWith(item.href) && item.href !== '/') {
      pageTitle = item.name;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur sm:h-16 sm:px-6 lg:h-20 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-zinc-900/60 text-zinc-300 hover:text-white sm:h-9 sm:w-9 md:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-white sm:text-lg lg:text-xl">{pageTitle}</h1>
          <p className="hidden text-[11px] text-zinc-500 sm:block">Admin Dashboard</p>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button className="relative rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:p-2">
          <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </button>

        <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-zinc-800 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:h-9 sm:w-9">
          <div className="h-full w-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center">
            <User className="h-4 w-4 text-yellow-800 sm:h-5 sm:w-5" />
          </div>
        </button>
      </div>
    </header>
  );
};
