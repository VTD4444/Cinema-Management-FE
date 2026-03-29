import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, UserCircle, Ticket, CalendarDays } from 'lucide-react';

const UserHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-10 py-4 text-sm text-zinc-100 relative z-50">
      <Link to="/home" className="flex items-center gap-3">
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
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">CineGo</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
            Trải nghiệm điện ảnh
          </p>
        </div>
      </Link>
      <nav className="flex items-center gap-6 text-zinc-300">
        <button className="hover:text-white">Phim</button>
        <button className="hover:text-white">Rạp</button>
        <Link to="/about" className="hover:text-white">Về chúng tôi</Link>
      </nav>
      <div className="flex items-center gap-5">
        <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">
          <Search className="h-5 w-5" />
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <User className="h-4 w-4" />
          </button>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden py-2" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <UserCircle className="w-4 h-4" />
                <span>Thông tin cá nhân</span>
              </Link>
              <Link 
                to="/my-vouchers" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Ticket className="w-4 h-4" />
                <span>Voucher của tôi</span>
              </Link>
              <Link 
                to="/my-tickets" 
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Vé của tôi</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const UserFooter = () => {
  return (
    <footer className="border-t border-zinc-800 py-6 px-10 text-xs text-zinc-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} CinemaPlus. All rights reserved.</span>
        <div className="flex gap-4">
          <button className="hover:text-zinc-300">Privacy</button>
          <button className="hover:text-zinc-300">Terms</button>
          <button className="hover:text-zinc-300">Sitemap</button>
        </div>
      </div>
    </footer>
  );
};

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      <UserHeader />
      <main className="flex-1">{children}</main>
      <UserFooter />
    </div>
  );
};

export default UserLayout;
