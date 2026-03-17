import React from 'react';

const UserHeader = () => {
  return (
    <header className="flex items-center justify-between px-10 py-4 text-sm text-zinc-100">
      <div className="flex items-center gap-3">
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
      </div>
      <nav className="flex items-center gap-6 text-zinc-300">
        <button className="hover:text-white">Phim</button>
        <button className="hover:text-white">Rạp</button>
        <button className="hover:text-white">Giới thiệu</button>
      </nav>
      <button className="text-xs text-zinc-300 hover:text-white">Trợ giúp</button>
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
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white flex flex-col">
      <UserHeader />
      <main className="flex-1">{children}</main>
      <UserFooter />
    </div>
  );
};

export default UserLayout;

