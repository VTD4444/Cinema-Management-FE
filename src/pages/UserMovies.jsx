import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { Button } from '../components/ui';
import { getMoviesPublic } from '../api/movieApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả phim' },
  { key: 'SHOWING', label: 'Phim đang chiếu' },
  { key: 'COMING_SOON', label: 'Phim sắp tới' },
];

const PAGE_SIZE = 8;

const normalizeMoviesFromResponse = (res) => {
  const data = res?.data;
  const raw = data?.items || data || [];
  return withoutSoftDeleted(Array.isArray(raw) ? raw : []);
};

const posterFromMovie = (movie) => {
  if (Array.isArray(movie?.poster_urls) && movie.poster_urls.length > 0) return movie.poster_urls[0];
  return movie?.poster_url || movie?.thumbnail_url || null;
};

const UserMovies = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('SHOWING');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('popularity');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const [showingRes, comingRes] = await Promise.all([
          getMoviesPublic({ status: 'SHOWING', pageNo: 1, pageSize: 50 }),
          getMoviesPublic({ status: 'COMING_SOON', pageNo: 1, pageSize: 50 }),
        ]);

        const showing = normalizeMoviesFromResponse(showingRes);
        const coming = normalizeMoviesFromResponse(comingRes);
        const merged = [...showing, ...coming].filter(
          (movie, idx, arr) => arr.findIndex((x) => x.id === movie.id) === idx,
        );
        setMovies(merged);
      } catch (e) {
        setError('Không thể tải danh sách phim.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [tab, genre, sort]);

  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach((movie) => {
      if (Array.isArray(movie?.genres)) {
        movie.genres.forEach((g) => {
          if (g?.name) set.add(g.name);
        });
      }
    });
    return ['all', ...Array.from(set)];
  }, [movies]);

  const filtered = useMemo(() => {
    let next = [...movies];
    if (tab !== 'all') {
      next = next.filter((movie) => String(movie.status || '').toUpperCase() === tab);
    }
    if (genre !== 'all') {
      next = next.filter((movie) =>
        Array.isArray(movie?.genres) ? movie.genres.some((g) => g?.name === genre) : false,
      );
    }

    if (sort === 'title') {
      next.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      next.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }
    return next;
  }, [movies, tab, genre, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedMovies = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const heroMovie = filtered[0] || movies[0];

  return (
    <UserLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8">
        <section className="mb-5 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
          <div className="relative aspect-[16/6] min-h-[220px] w-full bg-zinc-900">
            {heroMovie ? (
              <>
                <img
                  src={posterFromMovie(heroMovie) || '/logo.png'}
                  alt={heroMovie.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
            )}
          </div>
        </section>

        <section className="border-y border-zinc-900 py-2">
          <div className="flex flex-wrap items-center gap-6">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`pb-1 text-sm transition-colors ${
                  tab === t.key
                    ? 'border-b border-primary font-semibold text-primary'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-100">{filtered.length} Phim đang hiển thị</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300 outline-none"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g === 'all' ? 'Thể loại' : g}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300 outline-none"
              >
                <option value="popularity">Sắp xếp: Phổ biến nhất</option>
                <option value="title">Sắp xếp: A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-14 text-center text-sm text-zinc-400">Đang tải danh sách phim...</p>
          ) : error ? (
            <p className="py-14 text-center text-sm text-red-400">{error}</p>
          ) : pagedMovies.length === 0 ? (
            <p className="py-14 text-center text-sm text-zinc-400">Không có phim phù hợp.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pagedMovies.map((movie) => {
                const poster = posterFromMovie(movie);
                return (
                  <article key={movie.id} className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <Link to={`/movies/${movie.id}`} className="block aspect-[3/4] overflow-hidden bg-zinc-900">
                      {poster ? (
                        <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                          No image
                        </div>
                      )}
                    </Link>
                    <div className="space-y-2 p-3">
                      <Link to={`/movies/${movie.id}`}>
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-zinc-100 hover:text-white">
                          {movie.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {movie.duration ? `${movie.duration} phút` : 'Đang cập nhật'}
                        </span>
                        <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : ''}</span>
                      </div>
                      <Link to={`/movies/${movie.id}`}>
                        <Button className="mt-1 h-8 w-full rounded-md bg-primary text-xs font-semibold hover:bg-primary-hover">
                          Chi tiết phim
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-950 text-zinc-400 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 6) }).map((_, idx) => {
              const num = idx + 1;
              const active = num === safePage;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  className={`h-8 min-w-8 rounded border px-2 text-xs ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-950 text-zinc-400 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};

export default UserMovies;
