import React, { useState, useEffect } from 'react';
import UserLayout from '../components/layout/UserLayout';
import { Ticket, Coffee, Gift, CalendarX, Loader2 } from 'lucide-react';
import { getMyVouchers } from '../api/voucherApi';

const VoucherCard = ({ voucher }) => {
  const isUsed = voucher.status === 'used';
  const isExpired = voucher.status === 'expired';
  const isUnused = voucher.status === 'unused';

  const getIcon = () => {
    switch (voucher.type) {
      case 'food': return <Coffee className="w-8 h-8" />;
      case 'ticket': return <Ticket className="w-8 h-8" />;
      case 'gift': return <Gift className="w-8 h-8" />;
      case 'event': return <CalendarX className="w-8 h-8" />;
      default: return <Ticket className="w-8 h-8" />;
    }
  };

  const getCategoryColor = () => {
    if (isUsed || isExpired) return 'bg-zinc-800 text-zinc-500';
    switch (voucher.type) {
      case 'food': return 'bg-red-900/40 text-red-500';
      case 'ticket': return 'bg-red-900/40 text-red-500';
      case 'gift': return 'bg-zinc-800 text-zinc-400';
      case 'event': return 'bg-zinc-800 text-zinc-400';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className={`relative flex flex-col md:flex-row rounded-2xl border ${isUsed || isExpired ? 'border-zinc-800/50 bg-[#141414]/50' : 'border-zinc-800 bg-[#1c1c1c]'} overflow-hidden group transition-colors`}>
      {/* Left Icon Area - Fixed Width */}
      <div className={`w-full md:w-32 flex items-center justify-center py-6 md:py-0 border-b md:border-b-0 md:border-r border-dashed border-zinc-700/50 ${isUsed || isExpired ? 'text-zinc-700 bg-black/20' : 'text-red-500 bg-red-950/10'}`}>
        {getIcon()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getCategoryColor()}`}>
              {voucher.category}
            </span>
            {isUnused && (
              <span className="text-[10px] font-bold text-green-500 bg-green-950/30 px-2 py-0.5 rounded">
                Chưa sử dụng
              </span>
            )}
            {isUsed && (
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Đã sử dụng
              </span>
            )}
            {isExpired && (
              <span className="text-[10px] font-bold text-red-400 bg-red-950/30 px-2 py-0.5 rounded">
                Hết hạn
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-bold mb-1 ${isUsed || isExpired ? 'text-zinc-500' : 'text-white'}`}>
            {voucher.title}
          </h3>
          <p className={`text-sm mb-4 ${isUsed || isExpired ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {voucher.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <p className={`text-xs ${isUsed || isExpired ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Hạn dùng: <span className={isUsed || isExpired ? 'text-zinc-500' : 'text-zinc-300'}>{voucher.expiryDate}</span>
            </p>
            <p className={`text-xs ${isUsed || isExpired ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Mã: <span className={`font-bold ${isUsed || isExpired ? 'text-zinc-500' : 'text-white'}`}>{voucher.code}</span>
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="w-full md:w-auto flex justify-end shrink-0">
          {isUnused && (
            <button className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-red-600/20">
              Dùng ngay
            </button>
          )}
          {isUsed && (
            <span className="text-sm font-medium text-zinc-500">
              Đã dùng {voucher.usedDate}
            </span>
          )}
          {isExpired && (
            <span className="absolute -right-6 top-8 transform rotate-12 border-2 border-red-900/30 text-red-900/40 font-black text-xl px-4 py-1 uppercase tracking-widest">
              Hết hạn
            </span>
          )}
        </div>
      </div>

      {/* Decorative semi-circles for ticket effect */}
      <div className="absolute left-[-8px] top-1/2 -mt-2 w-4 h-4 bg-[#0e0e0e] rounded-full hidden md:block"></div>
      <div className="absolute right-[-8px] top-1/2 -mt-2 w-4 h-4 bg-[#0e0e0e] rounded-full hidden md:block"></div>
    </div>
  );
};

const MyVouchers = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyVouchers();
      const items = res?.data?.items || res?.data || [];
      
      const mapped = items.map(apiItem => {
        // Decode nested structure (e.g. { id, status, used_at, voucher: { ... } }) or flat structure
        const v = apiItem.voucher || apiItem;
        
        let mappedStatus = 'unused';
        const isUsed = apiItem.status === 'USED' || apiItem.is_used || v.is_used;
        
        if (isUsed) {
          mappedStatus = 'used';
        } else {
          // Calculate expiration based on end_date
          const end = new Date(v.end_date || v.expiryDate || '2099-12-31');
          if (end < new Date()) {
            mappedStatus = 'expired';
          }
        }

        // Return unified object for the Card UI
        return {
          id: apiItem.id || v.id,
          type: v.type?.toLowerCase() || 'ticket',
          status: mappedStatus,
          category: v.category || (v.type === 'PERCENTAGE' ? 'GIẢM GIÁ' : 'VOUCHER'),
          title: v.name || v.title || (v.value ? `Giảm ${v.value}` : 'Voucher Ưu Đãi'),
          description: v.description || 'Áp dụng cho các dịch vụ tại rạp chiếu phim',
          expiryDate: v.end_date ? new Date(v.end_date).toLocaleDateString('vi-VN') : 'KXĐ',
          code: v.code || 'NO-CODE',
          usedDate: apiItem.used_at ? new Date(apiItem.used_at).toLocaleDateString('vi-VN') : undefined
        };
      });

      setVouchers(mapped);
    } catch (err) {
      console.error('Failed to fetch user vouchers:', err);
      setError('Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVouchers();
  }, []);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'unused', label: 'Chưa sử dụng' },
    { id: 'used', label: 'Đã sử dụng' },
    { id: 'expired', label: 'Hết hạn' }
  ];

  const filteredVouchers = vouchers.filter(v => activeTab === 'all' || v.status === activeTab);

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-8">Voucher của tôi</h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-800 mb-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-red-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Đang tải danh sách voucher...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-500 bg-red-950/20 rounded-2xl border border-red-900/30">
                {error}
              </div>
            ) : filteredVouchers.length > 0 ? (
              filteredVouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} />
              ))
            ) : (
              <div className="py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                Không có voucher nào trong mục này.
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default MyVouchers;
