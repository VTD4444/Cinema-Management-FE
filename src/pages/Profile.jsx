import React, { useState } from 'react';
import UserLayout from '../components/layout/UserLayout';

const Profile = () => {
  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-2xl font-bold mb-8">Thông tin cá nhân</h1>
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6 flex items-center justify-center min-h-[400px]">
          <p className="text-zinc-400">Tính năng đang được phát triển...</p>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
