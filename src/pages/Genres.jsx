import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';
import GenreModals from '../components/features/genres/GenreModals';
import { getGenres } from '../api/genreApi';

const PAGE_SIZE = 5;

const formatGenreId = (id) => `G-${String(id).padStart(3, '0')}`;

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const fetchGenres = useCallback(() => {
    setLoading(true);
    getGenres({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
    })
      .then((res) => {
        const raw = res?.data ?? res;
        if (Array.isArray(raw)) {
          const term = (search || '').trim().toLowerCase();
          const filtered = term ? raw.filter((g) => (g.name || '').toLowerCase().includes(term)) : raw;
          setTotal(filtered.length);
          const start = (page - 1) * PAGE_SIZE;
          setGenres(filtered.slice(start, start + PAGE_SIZE));
        } else if (raw && typeof raw === 'object') {
          if (Array.isArray(raw.items)) {
            setGenres(raw.items);
            setTotal(typeof raw.total === 'number' ? raw.total : raw.items.length);
          } else {
            setGenres([]);
            setTotal(0);
          }
        } else {
          setGenres([]);
          setTotal(0);
        }
      })
      .catch(() => {
        setGenres([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const closeModal = () => setModalState({ type: null, data: null });
  const onModalSuccess = () => fetchGenres();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">Quản lý thể loại</h2>
        <Button
          onClick={() => setModalState({ type: 'add', data: null })}
          className="gap-2 rounded-full px-5 hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]"
        >
          <Plus className="h-4 w-4" />
          Thêm Thể loại Mới
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface/30 p-1 flex flex-col gap-1 overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-surface/50 rounded-t-lg">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
              className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-0 bg-transparent border-t border-border/50">
          <Table className="border-0 rounded-none bg-transparent">
            <TableHeader className="bg-transparent border-b border-border/40">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-6">ID</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tên thể loại</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">Đang tải...</TableCell>
                </TableRow>
              ) : genres.length === 0 ? (
                <TableRow className="border-b border-border/20">
                  <TableCell colSpan={3} className="py-12 text-center text-zinc-500">Chưa có thể loại nào.</TableCell>
                </TableRow>
              ) : (
                genres.map((genre) => (
                  <TableRow key={genre.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                    <TableCell className="pl-6 py-4 font-mono text-zinc-300">{formatGenreId(genre.id)}</TableCell>
                    <TableCell className="py-4 text-gray-200">{genre.name}</TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setModalState({ type: 'view', data: genre })}
                          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                          aria-label="Xem"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'edit', data: genre })}
                          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                          aria-label="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModalState({ type: 'delete', data: genre })}
                          className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all"
                          aria-label="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface/50 rounded-b-lg">
          <span className="text-sm text-zinc-500">
            Hiển thị <span className="font-semibold text-zinc-300">{start}</span>
            {' - '}
            <span className="font-semibold text-zinc-300">{end}</span> trong{' '}
            <span className="font-semibold text-zinc-300">{total}</span> thể loại
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
              let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              p = Math.max(1, Math.min(p, totalPages));
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                    page === p ? 'bg-primary text-white border-transparent shadow-md shadow-primary/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <GenreModals state={modalState} onClose={closeModal} onSuccess={onModalSuccess} />
    </div>
  );
};

export default Genres;
