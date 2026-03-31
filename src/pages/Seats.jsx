import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Armchair,
  Crown,
  Heart,
  Upload,
} from 'lucide-react';
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '../components/ui';
import SeatModals from '../components/features/seats/SeatModals';
import { getSeats, normalizeSeatTypeForUi } from '../api/seatApi';
import { getRooms, getRoomListFromResponse } from '../api/roomApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';

const PAGE_SIZE = 10;

const TYPE_LABELS = { standard: 'Thường', vip: 'VIP', couple: 'Sweetbox' };
const TYPE_VARIANTS = { standard: 'primary', vip: 'warning', default: 'default' };
const TYPE_ICONS = { standard: Armchair, vip: Crown, couple: Heart };

const formatSeatCode = (row_label, number) =>
  `${(row_label || '').toUpperCase()}${String(number ?? 0).padStart(2, '0')}`;
const formatSeatName = (type, row_label, number) => {
  const t = normalizeSeatTypeForUi(type);
  return `Ghế ${TYPE_LABELS[t] || type} ${(row_label || '').toUpperCase()}${String(number ?? 0).padStart(2, '0')}`;
};

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [selectedIds, setSelectedIds] = useState(new Set());

  const fetchRooms = useCallback(() => {
    getRooms({ pageNo: 1, pageSize: 500 })
      .then((res) => {
        setRooms(getRoomListFromResponse(res));
      })
      .catch(() => setRooms([]));
  }, []);

  const fetchSeats = useCallback(() => {
    setLoading(true);
    getSeats({ search: search.trim() || undefined })
      .then((res) => {
        const raw = res?.data ?? res;
        const list = withoutSoftDeleted(
          Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [],
        );
        const term = (search || '').trim().toLowerCase();
        const filtered = term
          ? list.filter(
              (s) =>
                formatSeatCode(s.row_label, s.number).toLowerCase().includes(term) ||
                formatSeatName(s.type, s.row_label, s.number).toLowerCase().includes(term) ||
                (s.row_label || '').toLowerCase().includes(term)
            )
          : list;
        setTotal(filtered.length);
        const start = (page - 1) * PAGE_SIZE;
        setSeats(filtered.slice(start, start + PAGE_SIZE));
        setStatsData({
          total: list.length,
          standard: list.filter((s) => normalizeSeatTypeForUi(s.type) === 'standard').length,
          vip: list.filter((s) => normalizeSeatTypeForUi(s.type) === 'vip').length,
          couple: list.filter((s) => normalizeSeatTypeForUi(s.type) === 'couple').length,
        });
      })
      .catch(() => {
        setSeats([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const closeModal = () => setModalState({ type: null, data: null });
  const onModalSuccess = () => fetchSeats();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const [statsData, setStatsData] = useState({ total: 0, standard: 0, vip: 0, couple: 0 });

  const toggleSelectAll = () => {
    if (selectedIds.size === seats.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(seats.map((s) => s.id)));
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Quản lý Ghế ngồi</h2>
        <p className="text-sm text-zinc-400 mt-1">Cấu hình chi tiết sơ đồ chỗ ngồi cho các phòng chiếu trong hệ thống</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface/50 p-6 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Tổng số ghế</span>
          <span className="text-2xl font-bold text-white">{statsData.total}</span>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{statsData.total}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-6 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Ghế Thường</span>
          <span className="text-2xl font-bold text-white">{statsData.standard}</span>
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Armchair className="h-5 w-5 text-blue-400" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-6 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Ghế VIP</span>
          <span className="text-2xl font-bold text-white">{statsData.vip}</span>
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Crown className="h-5 w-5 text-amber-400" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-6 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Sweetbox</span>
          <span className="text-2xl font-bold text-white">{statsData.couple}</span>
          <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-pink-400" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/30 p-1 flex flex-col gap-1 overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-surface/50 rounded-t-lg">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã ghế, tên hoặc dãy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button variant="secondary" className="gap-2 rounded-full border-zinc-700/50">
              <Filter className="h-4 w-4" />
              Bộ lọc nâng cao
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={() => setModalState({ type: 'import', data: null })}
              className="gap-2 rounded-full px-5"
            >
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button
              onClick={() => setModalState({ type: 'add', data: null })}
              className="gap-2 rounded-full px-5"
            >
              <Plus className="h-4 w-4" />
              Thêm ghế
            </Button>
          </div>
        </div>

        <div className="p-0 bg-transparent border-t border-border/50">
          <Table className="border-0 rounded-none bg-transparent">
            <TableHeader className="bg-transparent border-b border-border/40">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-6 w-10">
                  <input
                    type="checkbox"
                    checked={seats.length > 0 && selectedIds.size === seats.length}
                    onChange={toggleSelectAll}
                    className="rounded border-border bg-zinc-800"
                  />
                </TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mã ghế</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tên ghế</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Loại ghế</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Dãy</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thứ tự</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={8} className="py-12 text-center text-zinc-500">Đang tải...</TableCell>
                </TableRow>
              ) : seats.length === 0 ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={8} className="py-12 text-center text-zinc-500">Chưa có ghế nào.</TableCell>
                </TableRow>
              ) : (
                seats.map((seat) => {
                  const code = formatSeatCode(seat.row_label, seat.number);
                  const name = formatSeatName(seat.type, seat.row_label, seat.number);
                  const typeUi = normalizeSeatTypeForUi(seat.type);
                  const variant = TYPE_VARIANTS[typeUi] || 'default';
                  const isActive = seat.is_active !== false;
                  return (
                    <TableRow key={seat.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                      <TableCell className="pl-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(seat.id)}
                          onChange={() => toggleSelect(seat.id)}
                          className="rounded border-border bg-zinc-800"
                        />
                      </TableCell>
                      <TableCell className="py-4 font-mono text-zinc-300">{code}</TableCell>
                      <TableCell className="py-4 text-gray-200">{name}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant={typeUi === 'couple' ? 'default' : variant} className={typeUi === 'couple' ? 'bg-pink-500/10 text-pink-400' : ''}>
                          {TYPE_LABELS[typeUi] || seat.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-400">{seat.row_label || '—'}</TableCell>
                      <TableCell className="py-4 text-zinc-400">{String(seat.number ?? 0).padStart(2, '0')}</TableCell>
                      <TableCell className="py-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() => {}}
                          className={`relative inline-flex h-6 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isActive ? 'bg-primary' : 'bg-zinc-600'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`}
                          />
                        </button>
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModalState({ type: 'edit', data: seat })}
                            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                            aria-label="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setModalState({ type: 'delete', data: seat })}
                            className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
                            aria-label="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface/50 rounded-b-lg">
          <span className="text-sm text-zinc-500">
            Hiển thị <span className="font-semibold text-zinc-300">{start}</span>-<span className="font-semibold text-zinc-300">{end}</span> trên tổng số <span className="font-semibold text-zinc-300">{total}</span> ghế
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none">
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              p = Math.max(1, Math.min(p, totalPages));
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${page === p ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  {p}
                </button>
              );
            })}
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none">
              &gt;
            </button>
          </div>
        </div>
      </div>

      <SeatModals state={modalState} onClose={closeModal} onSuccess={onModalSuccess} rooms={rooms} />
    </div>
  );
};

export default Seats;
