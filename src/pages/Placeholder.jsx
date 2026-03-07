import React from 'react';

const Placeholder = ({ title = 'Trang đang phát triển' }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
    <div className="rounded-md border border-border bg-surface p-8 text-center text-gray-400">
      Nội dung sẽ được cập nhật sau.
    </div>
  </div>
);

export default Placeholder;
