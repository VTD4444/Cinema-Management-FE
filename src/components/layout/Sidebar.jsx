import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../config/navigation';
import { cn } from '../../utils/mergeClass';
import useAuthStore from '../../store/useAuthStore';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [expandedMenus, setExpandedMenus] = useState(['/movies', '/cinemas']);

  const toggleSubmenu = (path) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 767px)').matches && onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeOnMobile}
          aria-label="Đóng menu"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-surface transition-transform duration-200 md:z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
      {/* Logo Area */}
      <div className="flex h-20 items-center px-6 gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 3v18" />
            <path d="M17 3v18" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">CineGo</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-medium">Quản lý rạp phim</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const isExpanded = expandedMenus.includes(item.href);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.name} className="flex flex-col">
              {hasChildren ? (
                <button
                  onClick={() => toggleSubmenu(item.href)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                    isActive
                      ? 'text-white bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'
                      )}
                    />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>
              ) : (
                <NavLink
                  to={item.href}
                  onClick={closeOnMobile}
                  className={({ isActive: isExactActive }) =>
                    cn(
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                      isExactActive
                        ? 'text-white bg-white/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  {({ isActive: isExactActive }) => (
                    <>
                      {/* Active indicator bar - as seen in "Check-in" image */}
                      {isExactActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
                      )}
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 transition-colors',
                          isExactActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'
                        )}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              )}

              {/* Submenu rendering */}
              {hasChildren && isExpanded && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.name}
                      to={child.href}
                      onClick={closeOnMobile}
                      // Use end modifier so nested routes like /movies/new don't highlight the parent 'Danh sách Phim'
                      end={child.href === '/movies' || child.href === '/cinemas'}
                      className={({ isActive: isChildActive }) =>
                        cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isChildActive
                            ? 'text-white bg-white/10 font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )
                      }
                    >
                      {child.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={() => {
            logout();
            closeOnMobile();
          }}
          className="flex w-full box-border items-center px-4 py-2.5 text-sm font-medium text-gray-400 bg-zinc-900 rounded-lg transition-colors hover:text-white hover:bg-zinc-800"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Đăng xuất
        </button>
      </div>
      </aside>
    </>
  );
};
