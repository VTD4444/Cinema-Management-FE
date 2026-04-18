import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, UserCircle, Ticket, CalendarDays, LogOut, Menu, X } from 'lucide-react';
import UserFooter from './UserFooter';
import useAuthStore from '../../store/useAuthStore';
import { getMyInfo } from '../../api/authApi';

const UserHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch updated user info to get the latest full_name, etc.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && isAuthenticated) {
      getMyInfo()
        .then(res => {
          if (res?.data?.user) {
            updateUser(res.data.user);
          }
        })
        .catch(err => console.error('Failed to fetch user info', err));
    }
  }, [isAuthenticated, updateUser]);

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
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/70 bg-[#0e0e0e]/90 text-sm text-zinc-100 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/home" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <img src="/logo.png" alt="CineGo logo" className="h-7 w-7 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">CineGo</h1>
            <p className="mt-1 hidden text-[10px] font-medium uppercase text-gray-400 sm:block">
              Trải nghiệm điện ảnh
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-zinc-300 transition-colors">
          <Link to="/movies" className={`font-medium transition-colors ${isActive('/movies') ? 'text-red-500 font-bold' : 'hover:text-white'}`}>Phim</Link>
          <Link to="/cinemas" className={`font-medium transition-colors ${isActive('/cinemas') || isActive('/search') ? 'text-red-500 font-bold' : 'hover:text-white'}`}>Rạp</Link>
          <Link to="/about" className={`font-medium transition-colors ${isActive('/about') ? 'text-red-500 font-bold' : 'hover:text-white'}`}>Về chúng tôi</Link>
          <Link to="/contact" className={`font-medium transition-colors ${isActive('/contact') ? 'text-red-500 font-bold' : 'hover:text-white'}`}>Trung tâm hỗ trợ</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/search" className="text-zinc-300 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 md:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-white">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate text-left text-sm font-medium">
                    {user?.full_name || 'Người dùng'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden py-2" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white line-clamp-1">{user?.full_name || 'Người dùng'}</p>
                      <p className="text-xs text-zinc-400 line-clamp-1">{user?.email}</p>
                    </div>
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
                    <div className="border-t border-zinc-800 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Đăng nhập / Đăng ký</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1 text-zinc-300">
            <Link to="/movies" onClick={() => setIsMobileMenuOpen(false)} className={`rounded-lg px-3 py-2 transition-colors ${isActive('/movies') ? 'bg-red-500/10 text-red-500 font-bold' : 'hover:bg-zinc-800/60 hover:text-white'}`}>Phim</Link>
            <Link to="/cinemas" onClick={() => setIsMobileMenuOpen(false)} className={`rounded-lg px-3 py-2 transition-colors ${isActive('/cinemas') || isActive('/search') ? 'bg-red-500/10 text-red-500 font-bold' : 'hover:bg-zinc-800/60 hover:text-white'}`}>Rạp</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`rounded-lg px-3 py-2 transition-colors ${isActive('/about') ? 'bg-red-500/10 text-red-500 font-bold' : 'hover:bg-zinc-800/60 hover:text-white'}`}>Về chúng tôi</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`rounded-lg px-3 py-2 transition-colors ${isActive('/contact') ? 'bg-red-500/10 text-red-500 font-bold' : 'hover:bg-zinc-800/60 hover:text-white'}`}>Trung tâm hỗ trợ</Link>
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-1 rounded-lg border border-zinc-700 px-3 py-2 text-center hover:border-zinc-500 hover:text-white">
                Đăng nhập / Đăng ký
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
      <UserHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <UserFooter />
    </div>
  );
};

export default UserLayout;
