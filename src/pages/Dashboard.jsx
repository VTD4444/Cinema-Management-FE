import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Tổng quan hệ thống</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-gray-400">Chỉ số {i}</h3>
            </div>
            <div className="text-2xl font-bold">---</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
