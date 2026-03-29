import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { getMoviesPublic, getGenres } from '../api/movieApi';

const MovieCard = ({ movie }) => {
  const poster = Array.isArray(movie.poster_urls) ? movie.poster_urls[0] : null;

  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
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
        {/* Rating badge (Mock) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500/90 text-black px-2 py-0.5 rounded text-[10px] font-bold">
          ★ {(Math.random() * (9.5 - 7.0) + 7.0).toFixed(1)}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold text-base line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
             {movie.genre_names?.[0] || 'Phim'}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'TBA'}
          </span>
        </div>
        <button className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
          Đặt vé
        </button>
      </div>
    </div>
  );
};

const UserSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  // Pagination (mocking support)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    // Load genres once
    getGenres()
      .then(res => {
        const raw = res?.data ?? res;
        setGenres(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setGenres([]));
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await getMoviesPublic({ search: initialQuery, pageNo: page, pageSize: 12 });
      const items = res?.data?.items || res?.data || [];
      const total = res?.data?.total || items.length;
      
      let filtered = [...items];
      
      // Local genre filtering if API doesn't support it directly
      if (selectedGenres.length > 0) {
        filtered = filtered.filter(m => 
          m.genre_ids && m.genre_ids.some(id => selectedGenres.includes(id))
        );
      }

      // Local sorting
      if (sortBy === 'a-z') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      }

      setMovies(filtered);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / 12) || 1);
    } catch (err) {
      console.error('Search failed', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [initialQuery, page, selectedGenres, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
    setPage(1);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
    setPage(1);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        
        {/* Search Header Banner */}
        <div className="pt-16 pb-12 px-6 flex flex-col items-center justify-center text-center border-b border-zinc-800">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tìm kiếm phim</h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-8">
            Khám phá bộ sưu tập phim đa dạng, tìm rạp chiếu gần bạn và đặt vé ngay hôm nay.
          </p>
          
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-2xl relative flex items-center"
          >
            <div className="absolute left-4 text-zinc-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Nhập tên phim..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-zinc-700/50 rounded-full py-4 pl-12 pr-32 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            />
            <button 
              type="submit"
              className="absolute right-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-6 rounded-full text-sm transition-colors shadow-lg shadow-red-600/20"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Two Sidebar Layout */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* LEFT SIDEBAR (FILTERS) */}
          <div className="lg:col-span-1 border-r border-zinc-800/50 pr-6 space-y-10">
            {/* Thể loại */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base tracking-wide text-zinc-100">Thể loại</h3>
                <button 
                  onClick={() => setSelectedGenres([])}
                  className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-3">
                {genres.map(genre => (
                  <label key={genre.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedGenres.includes(genre.id) ? 'bg-red-600 border-red-600' : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'}`}>
                        {selectedGenres.includes(genre.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <span className={`text-sm ${selectedGenres.includes(genre.id) ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {genre.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sắp xếp theo */}
            <div>
              <h3 className="font-bold text-base tracking-wide text-zinc-100 mb-4">Sắp xếp theo</h3>
              <div className="space-y-3">
                {[
                  { id: 'a-z', label: 'Tên phim (A-Z)' },
                  { id: 'newest', label: 'Mới nhất' },
                  { id: 'popular', label: 'Phổ biến nhất' },
                  { id: 'rating', label: 'Đánh giá cao' },
                ].map((sortOption) => (
                  <label key={sortOption.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="sort" 
                        className="peer sr-only" 
                        checked={sortBy === sortOption.id}
                        onChange={() => setSortBy(sortOption.id)}
                      />
                      <div className="w-4 h-4 rounded-full border border-zinc-600 peer-checked:border-red-600 transition-colors group-hover:border-zinc-400"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-red-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                    <span className={`text-sm ${sortBy === sortOption.id ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {sortOption.label}
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 bg-zinc-900/50 w-fit mx-auto p-1.5 rounded-full border border-zinc-800">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  &lsaquo;
                </button>
                {[...Array(totalPages)].map((_, i) => (
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
