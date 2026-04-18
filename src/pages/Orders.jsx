import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, X, Eye, Ticket, ShoppingBag, RotateCcw, ScanLine } from 'lucide-react';
import { Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, MobileTableCards } from '../components/ui';
import { getAdminOrders, getOrderDetail } from '../api/orderApi';

const STATUS_CONFIG = {
  SUCCESS: { label: 'Thành công', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  PENDING: { label: 'Đang xử lý', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
  FAILED: { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDateTime = (raw) => {
  if (!raw) return '—';
  const dateStr = typeof raw === 'string' ? raw.replace('Z', '') : raw;
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <div className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.bg}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
};

/* ═══════════ Detail Modal ═══════════ */
const OrderDetailModal = ({ orderId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderDetail(orderId)
      .then(res => setDetail(res?.data))
      .catch(err => console.error('Lỗi lấy chi tiết:', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-zinc-900 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white">Chi tiết đơn hàng</h3>
            <p className="text-xs text-zinc-500 mt-1 font-mono">{detail?.booking_code || `#${orderId}`}</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              <span className="text-zinc-500 text-sm">Đang tải chi tiết đơn hàng...</span>
            </div>
          ) : detail ? (
            <>
              {/* Movie + QR */}
              <div className="flex gap-5">
                {detail.poster && (
                  <img src={detail.poster} alt="poster" className="w-24 rounded-xl aspect-[2/3] object-cover bg-zinc-800 shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-1">{detail.movie_name}</h4>
                  <p className="text-sm text-zinc-400 mb-2">
                    {(detail.genres || []).join(', ')}
                    {detail.duration ? ` • ${Math.floor(detail.duration / 60)}h${detail.duration % 60}p` : ''}
                  </p>
                  <div className="text-xs text-zinc-500 space-y-1">
                    <p>{detail.cinema} – {detail.room}</p>
                    <p>{formatDateTime(detail.showtime)}</p>
                  </div>
                </div>
              </div>


              {/* Order info */}
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Khách hàng" value={detail.customer?.name || '—'} />
                <InfoItem label="Email" value={detail.customer?.email || '—'} />
                <InfoItem label="SĐT" value={detail.customer?.phone || '—'} />
                <InfoItem label="Ghế" value={(detail.seats || []).join(', ')} highlight />
              </div>

              {/* Tickets */}
              {detail.tickets && detail.tickets.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-red-500" />
                    Vé ({detail.tickets.length})
                  </h4>
                  <div className="space-y-2">
                    {detail.tickets.map((t, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-white font-mono">
                          {detail.seats?.[i] || `Ghế ${i + 1}`}
                          {detail.ticket_prices?.[i] ? ` • ${formatCurrency(detail.ticket_prices[i])}` : ''}
                        </span>
                        {t.status === 'CHECKED_IN' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <ScanLine className="w-3.5 h-3.5" /> Đã check-in
                          </span>
                        ) : t.status === 'EXPIRED' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">Hết hạn</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <ScanLine className="w-3.5 h-3.5" /> Chưa check-in
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foods */}
              {detail.foods && detail.foods.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                    Đồ ăn kèm ({detail.foods.length})
                  </h4>
                  <div className="space-y-2">
                    {detail.foods.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          {f.image ? (
                            <img src={f.image} alt={f.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                          ) : (
                            <span className="text-lg">🍿</span>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{f.name}</p>
                            <p className="text-xs text-zinc-500">SL: {f.quantity} × {formatCurrency(f.price)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white">{formatCurrency(f.total || f.price * f.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-800/50 space-y-3">
                {detail.ticket_total != null && (
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Vé ({detail.ticket_quantity} vé)</span>
                    <span className="text-white">{formatCurrency(detail.ticket_total)}</span>
                  </div>
                )}
                {detail.food_total > 0 && (
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Đồ ăn kèm</span>
                    <span className="text-white">{formatCurrency(detail.food_total)}</span>
                  </div>
                )}
                {detail.discount > 0 && (
                  <div className="flex justify-between text-sm text-zinc-400">
                    <span>Giảm giá {detail.voucher ? `(${detail.voucher})` : ''}</span>
                    <span className="text-emerald-400">-{formatCurrency(detail.discount)}</span>
                  </div>
                )}
                <div className="w-full h-px bg-zinc-700" />
                <div className="flex justify-between text-lg font-black text-white">
                  <span>Tổng cộng</span>
                  <span className="text-red-500">{formatCurrency(detail.total_amount)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-zinc-500 py-10">Không tìm thấy dữ liệu đơn hàng</p>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, highlight }) => (
  <div className="bg-zinc-800/30 border border-zinc-800/50 rounded-xl px-4 py-3">
    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">{label}</p>
    <p className={`text-sm font-medium ${highlight ? 'text-red-400 font-bold' : 'text-white'} line-clamp-1`}>{value}</p>
  </div>
);

/* ═══════════ Main Component ═══════════ */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageNo: page, pageSize: PAGE_SIZE };
      if (statusFilter) params.order_status = statusFilter;

      const res = await getAdminOrders(params);
      const data = res?.data;

      const items = data?.items || data?.data || [];
      setOrders(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
      setTotalItems(data?.totalItems || items.length);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side search
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (order.booking_code || '').toLowerCase().includes(q) ||
      (order.movie_name || '').toLowerCase().includes(q) ||
      (order.seat_code || '').toLowerCase().includes(q) ||
      (order.user?.name || '').toLowerCase().includes(q) ||
      (order.customer_name || '').toLowerCase().includes(q)
    );
  });

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Xem và quản lý tất cả đơn đặt vé trên hệ thống</p>
        </div>
        <Button variant="ghost" onClick={fetchOrders} className="gap-2 text-zinc-400 hover:text-white">
          <RotateCcw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm theo mã, phim, ghế, tên KH..."
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
              <option value="PENDING">Đang xử lý</option>
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
        <MobileTableCards className="p-3">
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">Đang tải danh sách đơn hàng...</div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((item, idx) => (
              <div key={`card-${item.order_id || item.booking_code || idx}`} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-white">#{item.order_id}</p>
                  <StatusBadge status={item.order_status || 'PENDING'} />
                </div>
                <p className="mt-1 text-xs font-mono text-red-400">{item.booking_code || '—'}</p>
                <p className="mt-2 line-clamp-1 text-sm text-zinc-200">{item.movie_name || '—'}</p>
                <p className="text-xs text-zinc-500">{item.cinema} - {item.room}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Tổng tiền</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(item.total_amount)}</span>
                </div>
                <button
                  onClick={() => setSelectedOrderId(item.order_id || item.id)}
                  className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200"
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">Không tìm thấy đơn hàng nào</div>
          )}
        </MobileTableCards>

        <div className="hidden md:block">
          <Table className="border-0">
            <TableHeader className="bg-zinc-800/50">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-6 h-12">Mã đơn</TableHead>
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12">Booking Code</TableHead>
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12">Chi tiết đặt vé</TableHead>
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12 text-right">Tổng tiền</TableHead>
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-12 text-center">Trạng thái</TableHead>
                <TableHead className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pr-6 text-right h-12">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                      <p className="text-zinc-500 text-sm">Đang tải danh sách đơn hàng...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((item, idx) => {
                  return (
                    <TableRow key={item.order_id || item.booking_code || idx} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-sm text-white tracking-tight">#{item.order_id}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-mono text-xs font-bold text-red-400">{item.booking_code || '—'}</span>
                      </TableCell>
                      <TableCell className="py-4 max-w-[300px]">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{item.movie_name || '—'}</p>
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {item.cinema} – {item.room}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Ghế: <span className="text-zinc-300 font-medium">{(item.seats || []).join(', ')}</span>
                          </p>
                          {item.foods && item.foods.length > 0 && (
                            <p className="text-[10px] text-zinc-500 italic mt-1 bg-zinc-800/50 px-2 py-0.5 rounded w-fit">
                              + {item.foods.map(f => `${f.quantity}x ${f.food_name || f.name}`).join(', ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <span className="text-sm font-bold text-white">{formatCurrency(item.total_amount)}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <StatusBadge status={item.order_status || 'PENDING'} />
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrderId(item.order_id || item.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
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
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 px-4 py-4 bg-zinc-800/30 border-t border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="text-xs font-medium text-zinc-500">
            Hiển thị {Math.min(((page - 1) * PAGE_SIZE) + 1, totalItems)}-{Math.min(page * PAGE_SIZE, totalItems)} trong {totalItems} bản ghi
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
              <span className="text-sm font-bold text-white px-3 py-1 rounded-lg bg-red-600/10 border border-red-500/20">
                {page}
              </span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-sm font-medium text-zinc-400">
                {totalPages}
              </span>
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
};

export default Orders;
