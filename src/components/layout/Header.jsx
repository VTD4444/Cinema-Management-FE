import React from 'react';
import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../config/navigation';

export const Header = () => {
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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background px-8">
      <h1 className="text-xl font-bold text-white">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 border border-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-transform hover:scale-105">
          <div className="h-full w-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center">
            <User className="h-5 w-5 text-yellow-800" />
          </div>
        </button>
      </div>
    </header>
  );
};
