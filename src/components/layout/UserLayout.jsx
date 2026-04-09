import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, UserCircle, Ticket, CalendarDays, LogOut } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import UserFooter from './UserFooter';

const UserHeader = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
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

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 text-sm text-zinc-100 border-b border-zinc-800/70 bg-[#0e0e0e]/90 backdrop-blur-md">
      <Link to="/home" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <img src="/logo.png" alt="CineGo logo" className="h-7 w-7 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">CineGo</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
            Trải nghiệm điện ảnh
          </p>
        </div>
      </Link>
      <nav className="flex items-center gap-6 text-zinc-300">
        <Link to="/movies" className="hover:text-white">Phim</Link>
        <Link to="/cinemas" className="hover:text-white">Rạp</Link>
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
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
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
