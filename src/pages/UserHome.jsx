import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { getMoviesPublic } from '../api/movieApi';
import { getActorsPublic } from '../api/actorApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';
import { Button } from '../components/ui';
import UserLayout from '../components/layout/UserLayout';

const sectionHeadingClass = 'mb-4 inline-flex items-center gap-2 text-xl font-bold text-zinc-100';

const getPoster = (movie) => {
  if (Array.isArray(movie?.poster_urls) && movie.poster_urls.length > 0) return movie.poster_urls[0];
  return null;
};

const getBackdrop = (movie) => {
  if (Array.isArray(movie?.poster_urls) && movie.poster_urls.length > 1) return movie.poster_urls[1];
  return getPoster(movie);
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '').trim();
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }
  return '';
};

const MovieCard = ({ movie, onClick }) => {
  const poster = getPoster(movie);
  return (
    <article className="group min-w-0">
      <button type="button" onClick={onClick} className="w-full text-left">
        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          {poster ? (
            <img src={poster} alt={movie.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">No image</div>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 text-[13px] font-semibold text-zinc-100">{movie.title}</h3>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          {movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
        </p>
      </button>
    </article>
  );
};

const TrailerThumb = ({ movie, onClick }) => {
  const poster = getPoster(movie);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-32 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 text-left sm:w-[148px]"
    >
      <div className="aspect-video">
        {poster ? (
          <img src={poster} alt={movie.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-zinc-500">Trailer</div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white">
          <Play className="ml-0.5 h-3.5 w-3.5" />
        </div>
      </div>
      <div className="absolute bottom-1 left-2 right-2">
        <p className="line-clamp-1 text-[10px] font-medium text-zinc-200">{movie.title}</p>
      </div>
    </button>
  );
};

const UserHome = () => {
  const navigate = useNavigate();
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [showingRes, comingRes, actorsRes] = await Promise.all([
          getMoviesPublic({ status: 'SHOWING', pageNo: 1, pageSize: 12 }),
          getMoviesPublic({ status: 'COMING_SOON', pageNo: 1, pageSize: 12 }),
          getActorsPublic({ pageNo: 1, pageSize: 12 }),
        ]);
        const showingRaw = showingRes?.data?.items || showingRes?.data || [];
        const comingRaw = comingRes?.data?.items || comingRes?.data || [];
        const actorRaw = actorsRes?.data?.items || actorsRes?.items || actorsRes?.data || [];
        setNowShowing(withoutSoftDeleted(Array.isArray(showingRaw) ? showingRaw : []));
        setComingSoon(withoutSoftDeleted(Array.isArray(comingRaw) ? comingRaw : []));
        setActors(Array.isArray(actorRaw) ? actorRaw : []);
      } catch {
        setNowShowing([]);
        setComingSoon([]);
        setActors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const heroMovies = nowShowing.length > 0 ? nowShowing : comingSoon;
  const safeHeroIndex = heroMovies.length > 0 ? heroIndex % heroMovies.length : 0;
  const heroMovie = heroMovies[safeHeroIndex] || null;
  const latestTrailers = useMemo(() => [...nowShowing, ...comingSoon].filter((m) => m.trailer_url).slice(0, 5), [nowShowing, comingSoon]);
  const activeTrailerEmbedUrl = getYoutubeEmbedUrl(activeTrailerMovie?.trailer_url);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroMovies.length]);

  useEffect(() => {
    if (heroMovies.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [heroMovies.length]);

  return (
    <UserLayout>
      <div className="pb-12">
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden border-y border-zinc-900 bg-zinc-900">
          <div className="relative h-[320px] md:h-[460px]">
            {heroMovie ? (
              <img src={getBackdrop(heroMovie)} alt={heroMovie.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
            <div className="absolute inset-0 px-5 py-6 md:px-8 md:py-8">
              <div className="max-w-[420px]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Now Showing</p>
                <h1 className="mb-2 text-3xl font-black leading-tight text-zinc-100 md:text-5xl">{heroMovie?.title || 'CineGo Movies'}</h1>
                <p className="line-clamp-3 text-xs leading-5 text-zinc-300 md:text-sm">
                  {heroMovie?.description || 'Khám phá phim mới, đặt vé nhanh và trải nghiệm điện ảnh đỉnh cao.'}
                </p>
                <div className="mt-4 flex gap-2.5">
                  <Button className="h-9 rounded-md bg-primary px-4 text-xs font-semibold" onClick={() => heroMovie && navigate(`/movie/${heroMovie.id}`)}>
                    Đặt Vé Ngay
                  </Button>
                  <Button variant="secondary" className="h-9 rounded-md px-4 text-xs font-semibold" onClick={() => heroMovie && navigate(`/movie/${heroMovie.id}`)}>
                    Xem Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-zinc-900 py-2">
            {(heroMovies.length > 0 ? heroMovies : [null]).slice(0, 8).map((_, idx) => (
              <button
                key={`hero-dot-${idx}`}
                type="button"
                aria-label={`Chuyển banner ${idx + 1}`}
                onClick={() => setHeroIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === safeHeroIndex ? 'w-5 bg-zinc-300' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <section className="mt-1 border-t border-zinc-900 pt-4">
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Latest Trailers</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(latestTrailers.length > 0 ? latestTrailers : (nowShowing[0] ? [nowShowing[0]] : [])).map((m) => (
              <TrailerThumb key={`trailer-${m.id}`} movie={m} onClick={() => setActiveTrailerMovie(m)} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionHeadingClass}>
              <span className="h-5 w-1 rounded-full bg-primary" />
              Phim đang chiếu
            </h2>
            <button type="button" className="text-xs font-semibold text-primary hover:text-red-400" onClick={() => navigate('/movies')}>
              Xem tất cả
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-zinc-500">Đang tải danh sách phim...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {nowShowing.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} onClick={() => navigate(`/movie/${movie.id}`)} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-purple-800/40 bg-gradient-to-r from-purple-900/80 via-violet-800/60 to-indigo-900/70 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-bold text-white">Ưu đãi thành viên mới</p>
              <p className="mt-1 text-xs text-purple-100/90">Đăng ký thành viên CineGo để nhận voucher và quyền lợi độc quyền.</p>
            </div>
            <Button className="h-9 rounded-md bg-white px-4 text-xs font-semibold text-zinc-900 hover:bg-zinc-100" onClick={() => navigate('/register')}>
              Đăng ký ngay
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={sectionHeadingClass}>
              <span className="h-5 w-1 rounded-full bg-primary" />
              Phim sắp chiếu
            </h2>
            <button type="button" className="text-xs font-semibold text-primary hover:text-red-400" onClick={() => navigate('/movies')}>
              Xem tất cả
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-zinc-500">Đang tải danh sách phim...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {comingSoon.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} onClick={() => navigate(`/movie/${movie.id}`)} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className={sectionHeadingClass}>
            <span className="h-5 w-1 rounded-full bg-primary" />
            Danh sách các diễn viên
          </h2>
          <div className="mt-3 flex flex-wrap gap-5">
            {actors.length === 0 ? (
              <p className="text-sm text-zinc-500">Danh sách diễn viên sẽ được cập nhật.</p>
            ) : (
              actors.slice(0, 8).map((actor) => (
                <button
                  key={actor.id || actor.name}
                  type="button"
                  onClick={() => actor.id && navigate(`/actors/${actor.id}`)}
                  className="w-16 text-center sm:w-[78px]"
                  aria-label={`Xem chi tiết diễn viên ${actor.name}`}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-sm font-bold text-zinc-300">
                    {actor.image_url ? (
                      <img src={actor.image_url} alt={actor.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{String(actor.name || '?').charAt(0)}</span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] text-zinc-400">{actor.name}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="mt-12 border-t border-zinc-900 pt-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CineGo Membership</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-100">Trải nghiệm điện ảnh đỉnh cao</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            Đăng ký thành viên CineGo ngay hôm nay để đặt vé nhanh, nhận ưu đãi độc quyền và tích điểm đổi quà.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button className="h-9 rounded-md bg-primary px-5 text-xs font-semibold" onClick={() => navigate('/register')}>
              Đăng ký ngay
            </Button>
            <Button variant="secondary" className="h-9 rounded-md px-5 text-xs font-semibold" onClick={() => navigate('/about')}>
              Tìm hiểu thêm
            </Button>
          </div>
        </section>
        </div>
      </div>

      {activeTrailerMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100">{activeTrailerMovie.title}</h3>
              <button
                type="button"
                onClick={() => setActiveTrailerMovie(null)}
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Đóng trailer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {activeTrailerEmbedUrl ? (
                <iframe
                  src={activeTrailerEmbedUrl}
                  title={`${activeTrailerMovie.title} trailer`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : activeTrailerMovie.trailer_url ? (
                <a
                  href={activeTrailerMovie.trailer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full w-full items-center justify-center text-sm text-zinc-300 hover:text-white"
                >
                  Mở trailer trong tab mới
                </a>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Trailer chưa khả dụng</div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserHome;

