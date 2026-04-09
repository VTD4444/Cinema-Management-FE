import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { getAdminOrders } from '../api/orderApi';

const STATUS_CONFIG = {
  SUCCESS: { label: 'Thành công', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  PENDING: { label: 'Đang xử lý', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
  FAILED: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // SUCCESS, PENDING, FAILED
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: PAGE_SIZE,
      };
      if (statusFilter) params.payment_status = statusFilter;
      
      const res = await getAdminOrders(params);
      const data = res?.data;
      
      // Handle the usual paginated response structure
      const items = data?.items || data?.data || [];
      setOrders(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
      setTotalItems(data?.totalItems || items.length);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side search (fallback if API doesn't support it)
  const filteredOrders = orders.filter(order => 
    order.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.movie_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone?.includes(searchTerm)
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Xem và quản lý tất cả giao dịch đặt vé trên hệ thống</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm theo mã, phim, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-sm"
          />
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-zinc-500" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-48">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="flex h-11 w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="FAILED">Đã hủy</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <Filter className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
          
          <button 
            onClick={() => { setPage(1); fetchOrders(); }}
            className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden shadow-sm backdrop-blur-sm">
        <Table className="border-0">
          <TableHeader className="bg-zinc-800/50">
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-6 h-12">Mã đơn</TableHead>
              <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12">Chi tiết đặt vé</TableHead>
              <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12 text-right">Tổng tiền</TableHead>
              <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12 text-center">Trạng thái</TableHead>
              <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pr-6 text-right h-12">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <p className="text-zinc-500 text-sm">Đang tải danh sách đơn hàng...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((item) => {
                const status = STATUS_CONFIG[item.payment_status] || STATUS_CONFIG.PENDING;
                return (
                  <TableRow key={item.order_id || item.booking_code} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <p className="font-bold text-sm text-white tracking-tight">{item.booking_code}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-tighter">ID: #{item.order_id}</p>
                    </TableCell>
                    <TableCell className="py-4 max-w-[300px]">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-red-400 line-clamp-1">{item.movie_name}</p>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          {item.cinema} – {item.room}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Ghế: <span className="text-zinc-300 font-medium">{(item.seats || []).join(', ')}</span>
                        </p>
                        {item.foods && item.foods.length > 0 && (
                           <p className="text-[10px] text-zinc-500 italic mt-1 bg-zinc-800/50 px-2 py-0.5 rounded w-fit">
                             + {item.foods.map(f => `${f.quantity}x ${f.food_name}`).join(', ')}
                           </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span className="text-sm font-bold text-white">{formatCurrency(item.total_amount)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        <div className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full whitespace-nowrap ${status.bg}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
                       <Search className="h-6 w-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 font-medium">Không tìm thấy đơn hàng nào</p>
                    <p className="text-zinc-600 text-xs text-balance max-w-[200px]">Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-800/30 border-t border-zinc-800">
          <span className="text-xs font-medium text-zinc-500">
            Hiển thị {((page-1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalItems)} trong {totalItems} đơn hàng
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
               {/* Show simplified page indicator */}
               <span className="text-sm font-bold text-white px-3 py-1 rounded-lg bg-red-600/10 border border-red-500/20">
                  {page}
               </span>
               <span className="text-zinc-600 mx-1">/</span>
               <span className="text-sm font-medium text-zinc-400">
                  {totalPages}
               </span>
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
