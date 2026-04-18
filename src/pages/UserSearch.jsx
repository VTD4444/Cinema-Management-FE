import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { getMoviesPublic, getGenres } from '../api/movieApi';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const poster = Array.isArray(movie.poster_urls) ? movie.poster_urls[0] : null;

  return (
    <div
      className="flex flex-col gap-3 group cursor-pointer"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
            No image
          </div>
        )}

      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold text-base line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
            {movie.genre_names?.[0] || 'Phim'}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'TBA'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
          className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          Đặt vé
        </button>
      </div>
    </div>
  );
};

const UserSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchInput, 500);

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination (mocking support)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Load genres once
    getGenres()
      .then(res => {
        const raw = res?.data?.items || res?.data || res;
        setGenres(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setGenres([]));
  }, []);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNo: page,
        pageSize: 12,
      };

      if (initialQuery) params.title = initialQuery;
      if (selectedGenre) params.genreId = selectedGenre;
      if (statusFilter) params.status = statusFilter;

      const res = await getMoviesPublic(params);
      const items = res?.data?.items || res?.data || [];
      let total = res?.data?.totalItems || res?.data?.total || items.length;

      let filtered = [...items];

      // Fallback local filtering in case backend doesn't filter correctly
      if (initialQuery) {
        filtered = filtered.filter(m =>
          m.title.toLowerCase().includes(initialQuery.toLowerCase())
        );
      }
      if (selectedGenre) {
        filtered = filtered.filter(m =>
          (m.genre_ids && m.genre_ids.some(id => id == selectedGenre)) ||
          (m.genres && m.genres.some(g => g.id == selectedGenre)) ||
          (m.genreIds && m.genreIds.some(id => id == selectedGenre))
        );
      }
      if (statusFilter) {
        filtered = filtered.filter(m => m.status === statusFilter);
      }

      // If local filtering changed the amount, adjust total (approximate)
      if (filtered.length !== items.length) {
        total = filtered.length;
      }

      setMovies(filtered);
      setTotalPages(Math.ceil(total / 12) || 1);
    } catch (err) {
      console.error('Search failed', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [page, initialQuery, selectedGenre, statusFilter]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    if (debouncedSearch !== initialQuery) {
      if (debouncedSearch.trim()) {
        setSearchParams({ q: debouncedSearch.trim() });
      } else {
        setSearchParams({});
      }
      setPage(1);
    }
  }, [debouncedSearch, initialQuery, setSearchParams]);

  const handleGenreToggle = (genreId) => {
    setSelectedGenre(prev => prev === genreId ? '' : genreId);
    setPage(1);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white">

        {/* Search Header Banner */}
        <div className="border-b border-zinc-800 px-4 pb-10 pt-10 text-center sm:px-6 sm:pt-14 flex flex-col items-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Tìm kiếm phim</h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-8">
            Khám phá bộ sưu tập phim đa dạng, tìm rạp chiếu gần bạn và đặt vé ngay hôm nay.
          </p>

          <div className="w-full max-w-2xl mx-auto relative flex items-center">
            <div className="absolute left-4 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Nhập tên phim..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-zinc-700/50 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Two Sidebar Layout */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:gap-10">

          {/* LEFT SIDEBAR (FILTERS) */}
          <div className="space-y-8 rounded-xl border border-zinc-800/50 p-4 lg:col-span-1 lg:rounded-none lg:border-0 lg:border-r lg:pr-6 lg:pl-0">
            {/* Thể loại */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base tracking-wide text-zinc-100">Thể loại</h3>
                <button
                  onClick={() => setSelectedGenre('')}
                  className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-3">
                {genres.map(genre => (
                  <label key={genre.id} className="flex items-center gap-3 cursor-pointer group hover:text-white" onClick={() => handleGenreToggle(genre.id)}>
                    <div className="relative flex items-center justify-center">
                      <div className={`w-4 h-4 rounded-full border transition-colors ${selectedGenre === genre.id ? 'border-red-600' : 'border-zinc-600 group-hover:border-zinc-400'}`}></div>
                      {selectedGenre === genre.id && (
                        <div className="absolute w-2 h-2 rounded-full bg-red-600"></div>
                      )}
                    </div>
                    <span className={`text-sm ${selectedGenre === genre.id ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {genre.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <h3 className="font-bold text-base tracking-wide text-zinc-100 mb-4">Trạng thái</h3>
              <div className="space-y-3">
                {[
                  { id: '', label: 'Tất cả' },
                  { id: 'SHOWING', label: 'Đang chiếu' },
                  { id: 'COMING_SOON', label: 'Sắp chiếu' },
                ].map((statusOption) => (
                  <label key={statusOption.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="status"
                        className="peer sr-only"
                        checked={statusFilter === statusOption.id}
                        onChange={() => { setStatusFilter(statusOption.id); setPage(1); }}
                      />
                      <div className="w-4 h-4 rounded-full border border-zinc-600 peer-checked:border-red-600 transition-colors group-hover:border-zinc-400"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-red-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className={`text-sm ${statusFilter === statusOption.id ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {statusOption.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (RESULTS) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold">Kết quả tìm kiếm</h2>
              <span className="text-sm text-zinc-500 font-medium">{movies.length} phim</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-3">
                    <div className="aspect-[2/3] bg-zinc-800/50 rounded-xl"></div>
                    <div className="h-4 bg-zinc-800/50 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800/50 rounded w-1/2"></div>
                    <div className="h-9 bg-zinc-800/50 rounded-lg mt-1 w-full"></div>
                  </div>
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
                <p className="text-zinc-400">Không tìm thấy phim nào khớp với điều kiện tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex w-fit max-w-full items-center justify-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-900/50 p-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  &lsaquo;
                </button>
                {[...Array(totalPages)].slice(0, 7).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${page === i + 1 ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </UserLayout>
  );
};

export default UserSearch;
