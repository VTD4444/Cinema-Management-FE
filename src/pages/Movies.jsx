import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  Clapperboard,
  Clock,
} from 'lucide-react';
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  MobileTableCards,
} from '../components/ui';
import MovieModals from '../components/features/movies/MovieModals';
import { getMovies } from '../api/movieApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SHOWING', label: 'Đang chiếu' },
  { value: 'COMING_SOON', label: 'Sắp chiếu' },
  { value: 'PASSED', label: 'Đã dừng' },
];

const PAGE_SIZE = 8;

const formatReleaseDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusBadge = (status) => {
  const map = {
    SHOWING: { label: 'Đang chiếu', variant: 'success', dotClass: 'bg-emerald-500' },
    COMING_SOON: { label: 'Sắp chiếu', variant: 'warning', dotClass: 'bg-amber-500' },
    PASSED: { label: 'Đã dừng', variant: 'default', dotClass: 'bg-zinc-500' },
  };
  const normalizedStatus = status?.toUpperCase();
  const config = map[normalizedStatus] || { label: status, variant: 'default', dotClass: 'bg-zinc-500' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <Badge variant={config.variant} className="rounded-full px-2.5 py-0.5 text-xs font-medium">
        {config.label}
      </Badge>
    </span>
  );
};

const getPosterUrl = (movie) => {
  if (Array.isArray(movie.poster_urls) && movie.poster_urls[0]) return movie.poster_urls[0];
  if (typeof movie.poster_urls === 'string') return movie.poster_urls;
  return null;
};

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const fetchMovies = useCallback(() => {
    setLoading(true);
    getMovies({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      status: statusFilter || undefined,
    })
      .then((res) => {
        // Hỗ trợ cả format { data: { items, total } } và response mảng trực tiếp (JSON Server)
        const raw = res?.data ?? res;
        if (Array.isArray(raw)) {
          const list = withoutSoftDeleted(raw);
          setMovies(list);
          setTotal(list.length);
        } else if (raw && typeof raw === 'object') {
          if (Array.isArray(raw.items)) {
            const list = withoutSoftDeleted(raw.items);
            setMovies(list);
            setTotal(typeof raw.totalItems === 'number' ? raw.totalItems : typeof raw.total === 'number' ? raw.total : list.length);
          } else {
            setMovies([]);
            setTotal(0);
          }
        } else {
          setMovies([]);
          setTotal(0);
        }
      })
      .catch(() => {
        setMovies([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const closeModal = () => setModalState({ type: null, data: null });
  const onModalSuccess = () => fetchMovies();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">Danh sách phim</h2>
        <Button
          onClick={() => setModalState({ type: 'add', data: null })}
          className="gap-2 rounded-full px-5 hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]"
        >
          <Plus className="h-4 w-4" />
          Thêm Phim Mới
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface/30 p-1 flex flex-col gap-1 overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-surface/50 rounded-t-lg">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="flex h-10 rounded-full border border-border bg-zinc-900/80 px-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-no-repeat bg-[length:16px] bg-[right_12px_center]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }}
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Filter className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="p-0 bg-transparent border-t border-border/50">
          <MobileTableCards className="p-3">
            {loading ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">Đang tải...</div>
            ) : movies.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">
                Chưa có phim nào. Nhấn "Thêm Phim Mới" để thêm.
              </div>
            ) : (
              movies.map((movie) => {
                const posterUrl = getPosterUrl(movie);
                return (
                  <div key={`mobile-${movie.id}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-md bg-zinc-800">
                        {posterUrl ? <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" /> : <Clapperboard className="m-auto h-6 w-6 text-zinc-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-zinc-100">{movie.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">{movie.directors_name || '—'}</p>
                        <div className="mt-2">{getStatusBadge(movie.status)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </MobileTableCards>

          <div className="hidden md:block">
          <Table className="border-0 rounded-none bg-transparent">
            <TableHeader className="bg-transparent border-b border-border/40">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-6">Tên phim</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thời lượng</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Đạo diễn</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ngày phát hành</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={6} className="py-12 text-center text-zinc-500">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : movies.length === 0 ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={6} className="py-12 text-center text-zinc-500">
                    Chưa có phim nào. Nhấn &quot;Thêm Phim Mới&quot; để thêm.
                  </TableCell>
                </TableRow>
              ) : (
                movies.map((movie) => {
                  const posterUrl = getPosterUrl(movie);
                  return (
                    <TableRow key={movie.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700/50 shrink-0 flex items-center justify-center">
                            {posterUrl ? (
                              <img src={posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                            ) : (
                              <Clapperboard className="h-6 w-6 text-zinc-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-200">{movie.title}</p>
                            {movie.description && (
                              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{movie.description.slice(0, 40)}…</p>
                            )}
                            {movie.rating && (
                              <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-700/80 text-zinc-400">
                                {movie.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          {movie.duration ? `${movie.duration}p` : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                          <Clapperboard className="h-3.5 w-3.5 text-zinc-500" />
                          {movie.directors_name || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-zinc-300">
                        {formatReleaseDate(movie.release_date)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(movie.status)}
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => setModalState({ type: 'edit', data: movie })}
                            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                            aria-label="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setModalState({ type: 'delete', data: movie })}
                            className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all"
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
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 border-t border-border/50 bg-surface/50 rounded-b-lg sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="text-xs sm:text-sm text-zinc-500">
            Hiển thị <span className="font-semibold text-zinc-300">{total === 0 ? 0 : start}</span>
            {' - '}
            <span className="font-semibold text-zinc-300">{end}</span> trong{' '}
            <span className="font-semibold text-zinc-300">{total}</span> phim
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${page === p
                      ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <span className="px-1 text-zinc-500">…</span>
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              &gt;
            </button>
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Trang cuối"
              >
                &gt;&gt;
              </button>
            )}
          </div>
        </div>
      </div>

      <MovieModals state={modalState} onClose={closeModal} onSuccess={onModalSuccess} />
    </div>
  );
};

export default Movies;
