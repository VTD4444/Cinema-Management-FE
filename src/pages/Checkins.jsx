import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ScanLine, CheckCircle2, Clock, XCircle, RotateCcw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { checkInByBookingCode, getCheckinHistory } from '../api/orderApi';

const STATUS_CONFIG = {
  CHECKED_IN: { label: 'Đã Check-in', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  PENDING: { label: 'Chờ xử lý', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500' },
  EXPIRED: { label: 'Hết hạn', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <div className={`inline-flex items-center gap-1.5 border px-2 py-1 rounded-full whitespace-nowrap ${cfg.bg}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
};

const Checkins = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [checkResult, setCheckResult] = useState(null); // { success, message } | null
  const [checkLoading, setCheckLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 10;

  const inputRef = useRef(null);

  // ─── Fetch history ───────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = { pageNo: page, pageSize: PAGE_SIZE };
      if (statusFilter) params.ticket_status = statusFilter;
      const res = await getCheckinHistory(params);
      const data = res?.data;
      const items = data?.items || data?.data || data || [];
      setHistory(Array.isArray(items) ? items : []);
      setTotalPages(data?.totalPages || 1);
      setTotalItems(data?.totalItems || items.length);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ─── Check-in ────────────────────────────────────────────────────
  const handleCheckIn = async () => {
    const code = bookingCode.trim();
    if (!code) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await checkInByBookingCode(code);
      const data = res?.data || res;
      setCheckResult({ success: true, message: data?.message || 'Check-in thành công!' });
      fetchHistory(); // refresh history
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Mã không hợp lệ hoặc vé đã check-in.';
      setCheckResult({ success: false, message: msg });
    } finally {
      setCheckLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleCheckIn(); };

  const formatDateTime = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          Check-in Vé
        </h2>
        <Button
          variant="ghost"
          onClick={fetchHistory}
          className="gap-2 text-zinc-400 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* ─── Scanner / Input ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface/50 p-6 shadow-sm space-y-4">
        <label className="text-sm font-medium text-zinc-300">Nhập hoặc quét mã Booking</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
            <input
              ref={inputRef}
              value={bookingCode}
              onChange={(e) => { setBookingCode(e.target.value); setCheckResult(null); }}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 h-12 bg-zinc-900/80 border border-zinc-800 text-white rounded-xl font-mono tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-zinc-600"
              placeholder="BK1775386781400..."
              autoFocus
            />
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={checkLoading || !bookingCode.trim()}
            className="h-12 px-8 font-bold rounded-xl shadow-[0_0_15px_rgba(229,9,20,0.3)] gap-2 disabled:opacity-50"
          >
            <ScanLine className="h-5 w-5" />
            {checkLoading ? 'Đang xử lý...' : 'Check-in'}
          </Button>
        </div>

        {/* Result toast */}
        {checkResult && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium animate-in slide-in-from-top-2 duration-200 ${checkResult.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
            {checkResult.success
              ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            }
            <span>{checkResult.message}</span>
          </div>
        )}
      </div>

      {/* ─── History Table ────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface/50 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-border/50">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-zinc-400" />
              Lịch sử Check-in
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">{totalItems} bản ghi</p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CHECKED_IN">Đã Check-in</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
          </div>
        </div>

        {historyLoading ? (
          <div className="p-12 text-center text-zinc-500">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải lịch sử...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Clock className="h-8 w-8 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm">Không có dữ liệu check-in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border-0 rounded-none bg-transparent">
              <TableHeader className="bg-zinc-900/50 border-b border-border/40">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-11">Mã vé</TableHead>
                  <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-11">Booking Code</TableHead>
                  <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-11">Khách hàng</TableHead>
                  <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-11">Phim / Suất</TableHead>
                  <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-11">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, idx) => (
                  <TableRow key={item.ticket_id || item.id || idx} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-6 py-3">
                      <span className="font-mono text-xs text-zinc-400">#{item.ticket_id || item.id || '—'}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-bold text-red-400">{item.booking_code || '—'}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-200">{item.customer?.name || '—'}</span>
                        {item.customer?.email && <span className="text-xs text-zinc-500">{item.customer.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-300 font-medium">{item.movie_name || '—'}</span>
                        <span className="text-xs text-zinc-500">{item.showtime ? formatDateTime(item.showtime) : (item.room || '—')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-3 text-right">
                      <StatusBadge status={item.tickets[0].ticket_status || item.status || 'PENDING'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-surface/30">
            <span className="text-xs text-zinc-500">
              Trang <span className="text-zinc-300 font-medium">{page}</span> / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkins;
